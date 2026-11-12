import { useContext, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import "./OnAir.scss";
import { Hints, MorseContext, Setting } from "../context/MorseContext";
import { useAudioContext } from "../context/AudioContext";
import { useProgress } from "../context/ProgressContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { initCode } from "../hooks/useAudio";
import {
  alphaToMorse,
  alphaToMorseDict,
  calculateMorseUnitLength,
} from "../data/alphaToMorse";
import {
  ConversationNode,
  conversationChars,
  conversations,
  matchReply,
  phrases,
  Reply,
} from "../data/conversations";
import { words } from "../data/words";
import { defaultStats, shuffle, Stats } from "../data/DataSources";
import { buildSchedule } from "../morse/timing";
import { charMastery, lessonChars } from "../progress/progress";
import { calculateWPM } from "../utils/utils";
import { MorseKeys } from "./MorseKeys";
import { Keyboard } from "./Keyboard";
import { PracticeTabs } from "./Send";
import { ArrowLeftIcon } from "../icons/ArrowLeftIcon";
import { ArrowRightIcon } from "../icons/ArrowRightIcon";
import { SpeakerIcon } from "../icons/SpeakerIcon";

enum Kinds {
  Chat = "Chat",
  StreamSend = "Stream send",
  StreamCopy = "Stream copy",
}

enum Styles {
  Guided = "Guided",
  Choice = "Choice",
  Free = "Free",
}

enum Reveals {
  Live = "As sent",
  Words = "By word",
  Hidden = "Hidden",
}

const kindHints: Record<Kinds, string> = {
  [Kinds.Chat]: "A station sends, you key your reply, and it answers.",
  [Kinds.StreamSend]: "Key an endless run of words, with no stops between.",
  [Kinds.StreamCopy]: "Sentences play one after another. Type what you hear.",
};

const styleHints: Record<Styles, string> = {
  [Styles.Guided]: "Your reply is shown. Key it.",
  [Styles.Choice]: "Pick a reply, then key it.",
  [Styles.Free]: "Key anything. Send K or pause to hand over.",
};

type Mark = "ok" | "bad";

type Bubble = {
  id: number;
  who: "station" | "me";
  text: string;
  // One per character keyed or typed so far (spaces excluded)
  marks?: Mark[];
  // Station lines: how many characters are visible
  shown?: number;
  // Free replies have no target to mark against
  free?: boolean;
  // Copying by ear: characters stay hidden until you've typed them
  conceal?: boolean;
};

type Turn =
  | { type: "station" }
  | { type: "choose"; replies: Reply[] }
  // Key (or type, when copying) a known target
  | { type: "target"; input: "key" | "type"; reply?: Reply }
  | { type: "free" }
  | { type: "done" };

// How long a pause ends a free reply
const freeHandoverMs = 2800;
const maxBubbles = 40;

export const OnAir = () => {
  const { settings, phase, setPhase, setStats, setSessionLabel, setAutoHints } =
    useContext(MorseContext);
  const { playMorse, stopMorse } = useAudioContext();
  const { progress, record } = useProgress();

  // ========== Setup =========== //
  const [kind, setKind] = useLocalStorage<Kinds>("onAirKind", Kinds.Chat);
  const [style, setStyle] = useLocalStorage<Styles>(
    "onAirStyle",
    Styles.Guided,
  );
  const [reveal, setReveal] = useLocalStorage<Reveals>(
    "onAirReveal",
    Reveals.Live,
  );
  const [scriptId, setScriptId] = useLocalStorage(
    "onAirScript",
    conversations[0].id,
  );
  const scriptIndex = Math.max(
    conversations.findIndex((c) => c.id === scriptId),
    0,
  );
  const script = conversations[scriptIndex];

  // Characters in this script that the lessons haven't reached yet
  const newChars = useMemo(() => {
    const learned = new Set(
      lessonChars(Math.max(progress.lesson.send, progress.lesson.receive)),
    );
    return conversationChars(script).filter(
      (char) =>
        !learned.has(char) &&
        charMastery(progress, "send", char) === "new" &&
        charMastery(progress, "receive", char) === "new",
    );
  }, [script, progress]);

  // ========== Session =========== //
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [turn, setTurn] = useState<Turn>({ type: "done" });
  const turnRef = useRef(turn);
  turnRef.current = turn;
  const bubblesRef = useRef(bubbles);
  bubblesRef.current = bubbles;

  // Bumped whenever a session starts or stops, so that anything still
  // waiting on audio or a timer from an older session gives up
  const sessionRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const nextIdRef = useRef(1);
  const statsRef = useRef<Stats>(defaultStats);
  const turnStartRef = useRef<number | null>(null);
  const activeMsRef = useRef(0);
  const turnsDoneRef = useRef(0);
  const freeTimerRef = useRef<number | null>(null);
  // The station line being answered
  const nodeRef = useRef<ConversationNode | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  function later(fn: () => void, ms: number) {
    const session = sessionRef.current;
    const timer = window.setTimeout(() => {
      if (session === sessionRef.current) fn();
    }, ms);
    timersRef.current.push(timer);
    return timer;
  }

  function clearTimers() {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
    freeTimerRef.current = null;
  }

  function addBubble(bubble: Omit<Bubble, "id">) {
    const id = nextIdRef.current++;
    setBubbles((prev) => [...prev, { ...bubble, id }].slice(-maxBubbles));
    return id;
  }

  function updateBubble(id: number, change: (bubble: Bubble) => Bubble) {
    setBubbles((prev) => prev.map((b) => (b.id === id ? change(b) : b)));
  }

  function pushStats(change: Partial<Stats>) {
    const next = { ...statsRef.current, ...change };
    const total = next.correct + next.incorrect;
    next.accuracy = total === 0 ? 0 : (next.correct / total) * 100;
    next.wpm =
      activeMsRef.current > 0
        ? calculateWPM(activeMsRef.current, next.unitLength)
        : 0;
    statsRef.current = next;
    setStats(next);
  }

  // Time spent on your own turns only, for WPM
  function closeTurnClock(text: string) {
    if (turnStartRef.current !== null) {
      activeMsRef.current += performance.now() - turnStartRef.current;
      turnStartRef.current = null;
    }
    pushStats({
      unitLength:
        statsRef.current.unitLength +
        calculateMorseUnitLength(alphaToMorse(text)),
    });
  }

  // ---------- The station's turn ---------- //
  // Plays a line and reveals its text in step with the sound.
  // Resolves when it has finished (or the session has moved on).
  async function stationSend(text: string, concealed: boolean) {
    const session = sessionRef.current;
    const id = addBubble({ who: "station", text, shown: 0 });
    const { UnitTime, Farnsworth } = settingsRef.current;

    if (!concealed && reveal !== Reveals.Hidden) {
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") continue;

        const wordEnd = text.indexOf(" ", i);
        const upTo =
          reveal === Reveals.Words
            ? wordEnd === -1
              ? text.length
              : wordEnd
            : i + 1;

        // When the last element of this character (or word) has sounded
        const at = buildSchedule(
          alphaToMorse(text.slice(0, upTo)),
          UnitTime,
          Farnsworth,
        ).duration;

        later(
          () =>
            updateBubble(id, (b) => ({
              ...b,
              shown: Math.max(b.shown ?? 0, upTo),
            })),
          at,
        );
      }
    }

    await playMorse(alphaToMorse(text));

    if (session === sessionRef.current && !concealed && reveal !== Reveals.Hidden) {
      updateBubble(id, (b) => ({ ...b, shown: text.length }));
    }

    return id;
  }

  async function stationTurn(nodeId: string) {
    const session = sessionRef.current;
    const node = script.nodes[nodeId];
    if (!node) return finish();
    nodeRef.current = node;

    setTurn({ type: "station" });
    await stationSend(node.station, false);
    if (session !== sessionRef.current) return;

    turnsDoneRef.current += 1;
    pushStats({ charsDone: turnsDoneRef.current });

    const replies = node.replies ?? [];
    if (replies.length === 0) {
      later(finish, 900);
    } else if (style === Styles.Free) {
      addBubble({ who: "me", text: "", free: true });
      setTurn({ type: "free" });
    } else if (style === Styles.Choice && replies.length > 1) {
      setTurn({ type: "choose", replies });
    } else {
      startTarget(replies[0].text, "key", replies[0]);
    }
  }

  // ---------- Your turn: a known target ---------- //
  function startTarget(text: string, input: "key" | "type", reply?: Reply) {
    addBubble({ who: "me", text, marks: [], conceal: input === "type" });
    setTurn({ type: "target", input, reply });
  }

  function onTargetChar(char: string) {
    const current = turnRef.current;
    if (current.type !== "target") return;

    const bubble = bubblesRef.current[bubblesRef.current.length - 1];
    if (!bubble?.marks) return;

    const expected = bubble.text.replace(/ /g, "");
    const index = bubble.marks.length;
    if (index >= expected.length) return;

    if (turnStartRef.current === null) turnStartRef.current = performance.now();

    // Wrong characters are marked and you carry on: nothing blocks
    const isCorrect = char === expected[index];
    record(current.input === "key" ? "send" : "receive", expected[index], isCorrect);

    const marks: Mark[] = [...bubble.marks, isCorrect ? "ok" : "bad"];
    // Kept current at once, in case two characters land in one frame
    bubblesRef.current = bubblesRef.current.map((b) =>
      b.id === bubble.id ? { ...b, marks } : b,
    );
    updateBubble(bubble.id, (b) => ({ ...b, marks }));

    pushStats(
      isCorrect
        ? { correct: statsRef.current.correct + 1 }
        : { incorrect: statsRef.current.incorrect + 1 },
    );

    if (marks.length === expected.length) {
      closeTurnClock(bubble.text);
      endTargetTurn(current);
    }
  }

  // Once you've answered, any hidden station text is shown for checking
  function revealStation() {
    setBubbles((prev) =>
      prev.map((b) =>
        b.who === "station" ? { ...b, shown: b.text.length } : b,
      ),
    );
  }

  function endTargetTurn(current: Extract<Turn, { type: "target" }>) {
    setTurn({ type: "station" });

    if (kind === Kinds.StreamSend) {
      later(nextStreamSend, 250);
    } else if (kind === Kinds.StreamCopy) {
      // Show what was sent, for checking, then move on
      stopMorse();
      revealStation();
      later(nextStreamCopy, 1400);
    } else if (current.reply?.next) {
      revealStation();
      const next = current.reply.next;
      later(() => stationTurn(next), 700);
    } else {
      later(finish, 700);
    }
  }

  // ---------- Your turn: free reply ---------- //
  function onFreeChar(char: string) {
    if (turnRef.current.type !== "free") return;
    if (turnStartRef.current === null) turnStartRef.current = performance.now();

    const bubble = bubblesRef.current[bubblesRef.current.length - 1];
    if (!bubble?.free) return;

    const text = bubble.text + char;
    bubblesRef.current = bubblesRef.current.map((b) =>
      b.id === bubble.id ? { ...b, text } : b,
    );
    updateBubble(bubble.id, (b) => ({ ...b, text }));
    pushStats({ correct: statsRef.current.correct + 1 });
    armHandover();
  }

  function onFreeWordGap() {
    if (turnRef.current.type !== "free") return;

    const bubble = bubblesRef.current[bubblesRef.current.length - 1];
    if (!bubble?.free || bubble.text === "" || bubble.text.endsWith(" ")) return;

    // A lone K at the end means "over"
    if (/(^| )K$/.test(bubble.text)) return handOver();

    const text = bubble.text + " ";
    bubblesRef.current = bubblesRef.current.map((b) =>
      b.id === bubble.id ? { ...b, text } : b,
    );
    updateBubble(bubble.id, (b) => ({ ...b, text }));
  }

  function armHandover() {
    if (freeTimerRef.current) clearTimeout(freeTimerRef.current);
    freeTimerRef.current = later(handOver, freeHandoverMs);
  }

  function handOver() {
    if (turnRef.current.type !== "free") return;
    if (freeTimerRef.current) clearTimeout(freeTimerRef.current);

    const bubble = bubblesRef.current[bubblesRef.current.length - 1];
    const sent = (bubble?.text ?? "").trim();
    if (sent === "") return;

    closeTurnClock(sent);

    const reply = nodeRef.current
      ? matchReply(nodeRef.current, sent)
      : undefined;

    setTurn({ type: "station" });
    revealStation();
    if (reply?.next) {
      const next = reply.next;
      later(() => stationTurn(next), 600);
    } else {
      later(finish, 600);
    }
  }

  // ---------- Streams ---------- //
  const streamQueueRef = useRef<string[]>([]);

  function nextStreamSend() {
    if (streamQueueRef.current.length < 4) {
      streamQueueRef.current.push(
        ...shuffle(words.filter((w) => w.length <= 6)).slice(0, 60),
      );
    }
    const text = streamQueueRef.current.splice(0, 3).join(" ").toUpperCase();
    startTarget(text, "key");
  }

  function nextStreamCopy() {
    if (streamQueueRef.current.length === 0) {
      streamQueueRef.current.push(...shuffle(phrases));
    }
    const text = streamQueueRef.current.shift()!;

    // Type along as it plays: no need to wait for the end
    stationSend(text, true);
    startTarget(text, "type");
  }

  // ---------- Start / stop ---------- //
  async function start() {
    await playMorse(initCode);

    sessionRef.current += 1;
    clearTimers();
    streamQueueRef.current = [];
    statsRef.current = {
      ...defaultStats,
      charsTotal: kind === Kinds.Chat ? script.turns : 0,
    };
    activeMsRef.current = 0;
    turnStartRef.current = null;
    turnsDoneRef.current = 0;

    setBubbles([]);
    bubblesRef.current = [];
    setStats(statsRef.current);
    setSessionLabel(["On Air", kind === Kinds.Chat ? script.title : kind]);
    setPhase("guess");

    if (kind === Kinds.Chat) {
      later(() => stationTurn(script.start), 400);
    } else if (kind === Kinds.StreamSend) {
      nextStreamSend();
    } else {
      later(nextStreamCopy, 400);
    }
  }

  function finish() {
    setTurn({ type: "done" });
    setPhase("stats");
  }

  // Stopped from the header, or by leaving: tidy up
  useEffect(() => {
    if (phase === "standby" || phase === "stats") {
      sessionRef.current += 1;
      clearTimers();
      stopMorse();
      setTurn({ type: "done" });
    }
  }, [phase]);

  useEffect(() => {
    return () => {
      sessionRef.current += 1;
      clearTimers();
    };
  }, []);

  // ========== Input =========== //
  const isRunning = phase === "guess";
  const lastBubble = bubbles[bubbles.length - 1];

  // The character expected next, for the key's hint
  const expectedChar =
    isRunning && turn.type === "target" && lastBubble?.marks
      ? lastBubble.text.replace(/ /g, "")[lastBubble.marks.length]
      : undefined;
  const expectedMastery = expectedChar
    ? charMastery(progress, "send", expectedChar)
    : undefined;

  useEffect(() => {
    setAutoHints(
      expectedMastery === "known"
        ? Hints.Off
        : expectedMastery === "learning"
          ? Hints.Delayed
          : Hints.On,
    );
  }, [expectedMastery]);

  // Typing on a real keyboard while copying
  const typeRef = useRef(onTargetChar);
  typeRef.current = onTargetChar;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.metaKey || e.ctrlKey || e.repeat) return;

      const current = turnRef.current;
      if (current.type !== "target" || current.input !== "type") return;

      const char = e.key.toUpperCase();
      if (e.key.length === 1 && e.key !== " " && alphaToMorseDict[char]) {
        typeRef.current(char);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Keep the newest line in view
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [bubbles, turn]);

  function changeScript(step: number) {
    const count = conversations.length;
    setScriptId(conversations[(scriptIndex + step + count) % count].id);
  }

  const usesKey =
    isRunning &&
    (turn.type === "free" || (turn.type === "target" && turn.input === "key"));
  const usesKeyboard =
    isRunning && turn.type === "target" && turn.input === "type";

  return (
    <div className="quiz on-air">
      <div className="quiz__content">
        {!isRunning && (
          <>
            <PracticeTabs />

            <div className="button-menu on-air__kinds">
              {Object.values(Kinds).map((k) => (
                <button
                  key={k}
                  className={`btn-menu-item btn-menu-item--${kind === k ? "selected" : "not-selected"}`}
                  onClick={() => {
                    setPhase("standby");
                    setKind(k);
                  }}
                >
                  {k}
                </button>
              ))}
            </div>

            <p className="on-air__hint">{kindHints[kind]}</p>

            {kind === Kinds.Chat && (
              <>
                <div className="on-air__script">
                  <button
                    className="btn btn--outlined"
                    aria-label="Previous conversation"
                    onClick={() => changeScript(-1)}
                  >
                    <ArrowLeftIcon />
                  </button>
                  <div className="on-air__script__text">
                    <span>{script.title}</span>
                    <span>{script.desc}</span>
                    <span>
                      {newChars.length === 0
                        ? "Uses characters you've met"
                        : `New to you: ${newChars.slice(0, 8).join(" ")}${newChars.length > 8 ? " ..." : ""}`}
                    </span>
                  </div>
                  <button
                    className="btn btn--outlined"
                    aria-label="Next conversation"
                    onClick={() => changeScript(1)}
                  >
                    <ArrowRightIcon />
                  </button>
                </div>

                <div className="on-air__option">
                  <span>Replies</span>
                  <div className="button-menu">
                    {Object.values(Styles).map((s) => (
                      <button
                        key={s}
                        className={`btn-menu-item btn-menu-item--${style === s ? "selected" : "not-selected"}`}
                        onClick={() => setStyle(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="on-air__hint">{styleHints[style]}</p>

                <div className="on-air__option">
                  <span>Station text</span>
                  <div className="button-menu">
                    {Object.values(Reveals).map((r) => (
                      <button
                        key={r}
                        className={`btn-menu-item btn-menu-item--${reveal === r ? "selected" : "not-selected"}`}
                        onClick={() => setReveal(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {isRunning && (
          <div className="on-air__chat" ref={scrollRef}>
            <div className="on-air__chat__lines" aria-live="polite">
              {bubbles.map((bubble) => (
                <ChatBubble
                  key={bubble.id}
                  bubble={bubble}
                  onReveal={() =>
                    updateBubble(bubble.id, (b) => ({
                      ...b,
                      shown: b.text.length,
                    }))
                  }
                  onReplay={
                    kind === Kinds.Chat &&
                    turn.type !== "station" &&
                    bubble.who === "station"
                      ? () => playMorse(alphaToMorse(bubble.text))
                      : undefined
                  }
                />
              ))}

              {turn.type === "choose" && (
                <div className="on-air__choices">
                  <span>Choose your reply</span>
                  {turn.replies.map((reply) => (
                    <button
                      key={reply.text}
                      className="btn btn--outlined"
                      onClick={() => startTarget(reply.text, "key", reply)}
                    >
                      <span>{reply.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="quiz__bottom">
        {turn.type === "free" && isRunning && (
          <button
            className="btn btn--outlined on-air__over"
            onClick={handOver}
            disabled={!lastBubble?.free || lastBubble.text.trim() === ""}
          >
            <span>Over</span>
          </button>
        )}

        {/* Mounted for the whole session, so the key doesn't jump about */}
        {isRunning && !usesKeyboard && (
          <div
            className={clsx("on-air__key", !usesKey && "on-air__key--waiting")}
          >
            <MorseKeys
              hint={expectedChar ? alphaToMorse(expectedChar) : undefined}
              setGuess={(char) => {
                if (turnRef.current.type === "free") onFreeChar(char);
                else onTargetChar(char);
              }}
              onWordGap={onFreeWordGap}
            />
          </div>
        )}

        {usesKeyboard && (
          <Keyboard setGuess={onTargetChar} layout="letters" />
        )}

        {!isRunning && (
          <button className="btn btn--large" onClick={start}>
            <span>Start</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface ChatBubbleProps {
  bubble: Bubble;
  onReveal: () => void;
  onReplay?: () => void;
}

const ChatBubble = ({ bubble, onReveal, onReplay }: ChatBubbleProps) => {
  const isStation = bubble.who === "station";

  if (isStation) {
    const shown = bubble.shown ?? 0;
    const isHidden = shown < bubble.text.length;

    return (
      <div className="bubble bubble--station">
        <small>Station</small>
        <button
          className="bubble__text"
          onClick={isHidden ? onReveal : onReplay}
          disabled={!isHidden && !onReplay}
          aria-label={
            isHidden ? "Show the station's text" : "Play this line again"
          }
        >
          <span>
            {bubble.text.slice(0, shown)}
            <span className="bubble__pending">
              {bubble.text.slice(shown).replace(/[^ ]/g, "·")}
            </span>
          </span>
          {!isHidden && onReplay && <SpeakerIcon />}
        </button>
      </div>
    );
  }

  // Your own line: the target with each character marked as it's sent,
  // or (free replies) simply what you've keyed
  let sent = 0;
  const marks = bubble.marks ?? [];

  return (
    <div className="bubble bubble--me">
      <small>You</small>
      <div className="bubble__text">
        {bubble.free ? (
          <span>
            {bubble.text}
            <span className="bubble__caret" />
          </span>
        ) : (
          <span>
            {[...bubble.text].map((char, i) => {
              if (char === " ") return " ";
              const index = sent++;
              const mark = marks[index];

              return (
                <span
                  key={i}
                  className={clsx(
                    mark ? `bubble__char--${mark}` : "bubble__char--todo",
                    index === marks.length && "bubble__char--next",
                  )}
                >
                  {mark || !bubble.conceal ? char : "\u00b7"}
                </span>
              );
            })}
          </span>
        )}
      </div>
    </div>
  );
};
