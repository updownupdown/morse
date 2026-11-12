import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { alphaToMorse } from "../data/alphaToMorse";
import { MorseKeys } from "../components/MorseKeys";
import { useAudioContext } from "../context/AudioContext";
import { useProgress } from "../context/ProgressContext";
import { charsForLevel, GameStats, pick, Stat, useFlash } from "./common";
import { GameProps } from "./types";

type Stage = "listen" | "repeat";

export const Echo = ({ level, best, onEnd }: GameProps) => {
  const { playMorse } = useAudioContext();
  const { record } = useProgress();
  // Easy shows the letters as well as playing them
  const showText = level === "easy";
  const chars = charsForLevel(level === "easy" ? "easy" : "medium");

  const [sequence, setSequence] = useState<string[]>(() => [pick(chars)]);
  const [stage, setStage] = useState<Stage>("listen");
  const [entered, setEntered] = useState(0);
  const [flash, triggerFlash] = useFlash();

  const sequenceRef = useRef(sequence);
  sequenceRef.current = sequence;
  const stageRef = useRef(stage);
  stageRef.current = stage;
  const enteredRef = useRef(0);
  const aliveRef = useRef(true);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      aliveRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  // The station sends the sequence, then it's your turn
  useEffect(() => {
    let cancelled = false;

    setStage("listen");
    enteredRef.current = 0;
    setEntered(0);

    timerRef.current = window.setTimeout(async () => {
      await playMorse(alphaToMorse(sequence.join("")));
      if (!cancelled && aliveRef.current) setStage("repeat");
    }, 600);

    return () => {
      cancelled = true;
    };
  }, [sequence]);

  function onChar(char: string) {
    if (stageRef.current !== "repeat") return;

    const current = sequenceRef.current;
    const expected = current[enteredRef.current];

    if (char !== expected) {
      record("send", expected, false);
      triggerFlash("bad");
      stageRef.current = "listen";
      onEnd({
        score: current.length - 1,
        summary: `It was ${current.join(" ")}`,
      });
      return;
    }

    record("send", expected, true);
    enteredRef.current += 1;
    setEntered(enteredRef.current);

    if (enteredRef.current === current.length) {
      triggerFlash("good");
      stageRef.current = "listen";
      setStage("listen");
      setSequence([...current, pick(chars)]);
    }
  }

  return (
    <div className="game game--echo">
      <GameStats
        left={<Stat label="Round" value={sequence.length} />}
        right={<Stat label="Best" value={best ?? "-"} />}
      />

      <div className="game__stage">
        <div className={clsx("game-card", flash && `game-card--${flash}`)}>
          <div className="echo-sequence">
            {sequence.map((char, i) => (
              <span
                key={i}
                className={clsx(
                  stage === "repeat" && i < entered && "done",
                  stage === "repeat" && i === entered && "next",
                )}
              >
                {showText || (stage === "repeat" && i < entered) ? char : "?"}
              </span>
            ))}
          </div>
        </div>
        <p className="game__prompt">
          {stage === "listen" ? "Listen..." : "Now key it back"}
        </p>
      </div>

      <div
        className={clsx(
          "game__bottom",
          stage === "listen" && "game__bottom--waiting",
        )}
      >
        <MorseKeys setGuess={onChar} />
      </div>
    </div>
  );
};
