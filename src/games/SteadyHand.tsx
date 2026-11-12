import { useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { alphaToMorse } from "../data/alphaToMorse";
import { MorseContext, Setting } from "../context/MorseContext";
import { useAudioContext } from "../context/AudioContext";
import { KeyEvent } from "../morse/decoder";
import { buildSchedule } from "../morse/timing";
import { shuffle } from "../data/DataSources";
import { GameStats, Stat } from "./common";
import { GameProps } from "./types";
import { Keying, readKeying, symbolsOf, timingAdvice } from "./steady";
import { SpeakerIcon } from "../icons/SpeakerIcon";

const phrases: Record<string, string[]> = {
  easy: ["SOS", "TEA", "MAN", "SUN", "NET", "AIM", "TEN", "SIT"],
  medium: ["PARIS", "MORSE", "RADIO", "CODE", "HELLO", "SIGNAL", "WIRE"],
  hard: ["CQ CQ", "GOOD DAY", "ON AIR", "SEND IT", "ALL OK", "DE K"],
};

const rounds = 3;

// Your presses drawn against the ideal, each scaled to its own length
const Timeline = ({
  events,
  phrase,
}: {
  events: KeyEvent[];
  phrase: string;
}) => {
  const ideal = buildSchedule(alphaToMorse(phrase), 1, 1);
  const start = events[0].down;
  const total = events[events.length - 1].up - start;

  return (
    <div className="steady-timeline" aria-hidden="true">
      <span>Ideal</span>
      <div className="steady-timeline__row">
        {ideal.tones.map((tone, i) => (
          <i
            key={i}
            style={{
              left: `${(tone.start / ideal.duration) * 100}%`,
              width: `${(tone.duration / ideal.duration) * 100}%`,
            }}
          />
        ))}
      </div>
      <span>Yours</span>
      <div className="steady-timeline__row steady-timeline__row--yours">
        {events.map((event, i) => (
          <i
            key={i}
            style={{
              left: `${((event.down - start) / total) * 100}%`,
              width: `${((event.up - event.down) / total) * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const SteadyHand = ({ level, onEnd }: GameProps) => {
  const { settings } = useContext(MorseContext);
  const { setIsPressed, isPressed, playMorse } = useAudioContext();
  const unitMs = settings[Setting.UnitTime];

  const [list] = useState(() =>
    shuffle(phrases[level] ?? phrases.easy).slice(0, rounds),
  );
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [result, setResult] = useState<
    { keying: Keying; events: KeyEvent[]; matched: boolean } | undefined
  >(undefined);

  const phrase = list[round];
  const target = symbolsOf(phrase);

  const eventsRef = useRef<KeyEvent[]>([]);
  const downRef = useRef<number | null>(null);
  const doneTimerRef = useRef<number | null>(null);
  const [pressCount, setPressCount] = useState(0);

  const clearDoneTimer = () => {
    if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    doneTimerRef.current = null;
  };

  useEffect(
    () => () => {
      clearDoneTimer();
      setIsPressed(false);
    },
    [],
  );

  function assess() {
    clearDoneTimer();
    const events = eventsRef.current;
    if (events.length === 0) return;

    const keying = readKeying(events, unitMs);
    const matched = keying.symbols === target;

    setResult({ keying, events, matched });
    if (matched) {
      // Trying a phrase again replaces its score
      setScores((s) => {
        const next = [...s];
        next[round] = keying.timing.score;
        return next;
      });
    }
  }

  function press() {
    if (result || downRef.current !== null) return;
    clearDoneTimer();
    downRef.current = performance.now();
    setIsPressed(true);
  }

  function release() {
    if (downRef.current === null) return;

    eventsRef.current.push({ down: downRef.current, up: performance.now() });
    downRef.current = null;
    setIsPressed(false);
    setPressCount(eventsRef.current.length);

    // A long pause, or every element keyed and a short one, ends the phrase
    const complete = eventsRef.current.length >= target.length;
    doneTimerRef.current = window.setTimeout(
      assess,
      Math.max(unitMs * (complete ? 8 : 20), complete ? 700 : 1800),
    );
  }

  // The audio hook releases a key held too long; keep in step with it
  useEffect(() => {
    if (!isPressed && downRef.current !== null) release();
  }, [isPressed]);

  function retry() {
    eventsRef.current = [];
    setPressCount(0);
    setResult(undefined);
  }

  function next() {
    if (round + 1 === list.length) {
      const all = scores;
      const average = Math.round(all.reduce((a, b) => a + b, 0) / all.length);
      onEnd({ score: average, summary: "Average over three phrases" });
      return;
    }
    setRound(round + 1);
    retry();
  }

  // "." (as elsewhere) or the space bar works the key
  const handlersRef = useRef({ press, release });
  handlersRef.current = { press, release };

  useEffect(() => {
    const isKey = (e: KeyboardEvent) => e.key === "." || e.key === " ";

    const down = (e: KeyboardEvent) => {
      if (!isKey(e) || e.repeat) return;
      handlersRef.current.press();
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      if (!isKey(e)) return;
      handlersRef.current.release();
      e.preventDefault();
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const timing = result?.keying.timing;

  return (
    <div className="game game--steady">
      <GameStats
        left={<Stat label="Phrase" value={`${round + 1}/${list.length}`} />}
        right={
          <Stat
            label="Last"
            value={scores.length > 0 ? scores[scores.length - 1] : "-"}
          />
        }
      />

      <div className="game__stage">
        <div className="game-card steady-card">
          <span className="steady-card__phrase">{phrase}</span>
          <span className="steady-card__code">{alphaToMorse(phrase)}</span>
        </div>

        {!result && (
          <>
            <button
              className="btn btn--outlined"
              onClick={() => playMorse(alphaToMorse(phrase))}
              disabled={pressCount > 0}
            >
              <SpeakerIcon />
              <span>Hear it</span>
            </button>
            <p className="game__prompt">
              {pressCount === 0
                ? "Key the phrase with an even rhythm"
                : `${pressCount} of ${target.length} elements`}
            </p>
          </>
        )}

        {result && timing && (
          <div className="steady-result">
            {result.matched ? (
              <>
                <span className="steady-result__score">{timing.score}</span>
                <Timeline events={result.events} phrase={phrase} />
                <p>{timingAdvice(timing)}</p>
                {timing.ratio !== undefined && (
                  <p className="steady-result__ratio">
                    Your dahs are {timing.ratio.toFixed(1)} times your dits. The
                    ideal is 3.
                  </p>
                )}
              </>
            ) : (
              <p>
                That read as “{result.keying.text || "?"}”. Have another go at{" "}
                {phrase}.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="game__bottom">
        {result ? (
          <div className="game__actions game__actions--tall">
            <button className="btn btn--outlined" onClick={retry}>
              <span>Try again</span>
            </button>
            {result.matched && (
              <button className="btn btn--large" onClick={next}>
                <span>{round + 1 === list.length ? "Finish" : "Next"}</span>
              </button>
            )}
          </div>
        ) : (
          <button
            className={clsx(
              "btn btn--large steady-key",
              isPressed && "steady-key--pressed",
            )}
            onPointerDown={(e) => {
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {}
              press();
            }}
            onPointerUp={release}
            onPointerCancel={release}
            onLostPointerCapture={release}
          >
            <span>Tap/hold</span>
          </button>
        )}
      </div>
    </div>
  );
};
