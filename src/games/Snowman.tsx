import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { alphaToMorse } from "../data/alphaToMorse";
import { words } from "../data/words";
import { MorseKeys } from "../components/MorseKeys";
import { useAudioContext } from "../context/AudioContext";
import { useProgress } from "../context/ProgressContext";
import { GameStats, pick, Slots, Stat, useFlash } from "./common";
import { GameProps } from "./types";
import { SpeakerIcon } from "../icons/SpeakerIcon";

const maxParts = 6;
const hintsPerWord = 2;

const lengths: Record<string, [number, number]> = {
  easy: [3, 4],
  medium: [5, 6],
  hard: [7, 9],
};

// The snowman loses a part with every wrong letter
const SnowmanFigure = ({ parts }: { parts: number }) => (
  <svg
    className="snowman"
    viewBox="0 0 120 150"
    role="img"
    aria-label={`Snowman: ${parts} of ${maxParts} parts left`}
  >
    <ellipse cx="60" cy="142" rx="50" ry="5" className="snowman__ground" />
    {/* Listed in the order they melt away, last first */}
    <g className={clsx(parts < 1 && "gone")}>
      <circle cx="60" cy="108" r="32" />
    </g>
    <g className={clsx(parts < 2 && "gone")}>
      <circle cx="60" cy="62" r="23" />
    </g>
    <g className={clsx(parts < 3 && "gone")}>
      <circle cx="60" cy="28" r="16" />
    </g>
    <g className={clsx("snowman__detail", parts < 4 && "gone")}>
      <circle cx="54" cy="25" r="2" />
      <circle cx="66" cy="25" r="2" />
      <path d="M60 30 l12 3 l-12 2 z" className="snowman__nose" />
    </g>
    <g className={clsx("snowman__stick", parts < 5 && "gone")}>
      <path d="M38 58 L14 42 M82 58 L106 42" />
    </g>
    <g className={clsx("snowman__detail", parts < 6 && "gone")}>
      <rect x="46" y="4" width="28" height="12" rx="2" />
      <rect x="40" y="14" width="40" height="4" rx="2" />
    </g>
  </svg>
);

export const Snowman = ({ level, onEnd }: GameProps) => {
  const { playMorse } = useAudioContext();
  const { record } = useProgress();
  const [flash, triggerFlash] = useFlash();
  const [min, max] = lengths[level] ?? lengths.easy;

  const newWord = (previous?: string) => {
    const pool = words.filter(
      (w) => w.length >= min && w.length <= max && w.toUpperCase() !== previous,
    );
    return pick(pool).toUpperCase();
  };

  const [word, setWord] = useState(() => newWord());
  const [guessed, setGuessed] = useState<string[]>([]);
  const [parts, setParts] = useState(maxParts);
  const [solved, setSolved] = useState(0);
  const [hints, setHints] = useState(hintsPerWord);
  // Between words, or once the snowman has gone
  const [paused, setPaused] = useState(false);

  const timerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const wrong = guessed.filter((g) => !word.includes(g));

  function onChar(char: string) {
    if (paused) return;
    if (!/^[A-Z]$/.test(char) || guessed.includes(char)) {
      triggerFlash("bad");
      return;
    }

    const next = [...guessed, char];
    setGuessed(next);

    if (!word.includes(char)) {
      triggerFlash("bad");
      const left = parts - 1;
      setParts(left);

      if (left === 0) {
        setPaused(true);
        timerRef.current = window.setTimeout(
          () => onEnd({ score: solved, summary: `The word was ${word}` }),
          1500,
        );
      }
      return;
    }

    // Keying a letter that's in the word counts as sending it well
    record("send", char, true);

    if (word.split("").every((c) => next.includes(c))) {
      triggerFlash("good");
      setPaused(true);
      setSolved(solved + 1);

      timerRef.current = window.setTimeout(() => {
        // A solved word wins a part back
        setParts((p) => Math.min(p + 1, maxParts));
        setWord(newWord(word));
        setGuessed([]);
        setHints(hintsPerWord);
        setPaused(false);
      }, 1400);
    }
  }

  // Plays the code of a letter still missing: copy it, then key it
  function hint() {
    const missing = word.split("").filter((c) => !guessed.includes(c));
    if (missing.length === 0 || hints === 0 || paused) return;

    setHints(hints - 1);
    playMorse(alphaToMorse(pick(missing)));
  }

  return (
    <div className="game game--snowman">
      <GameStats
        left={<Stat label="Words" value={solved} />}
        right={<Stat label="Left" value={`${parts}/${maxParts}`} />}
      />

      <div className="game__stage">
        <SnowmanFigure parts={parts} />

        <div className={clsx("game-card", flash && `game-card--${flash}`)}>
          <Slots
            word={word}
            shown={(i) => guessed.includes(word[i]) || parts === 0}
          />
        </div>

        <div className="snowman-wrong" aria-label="Wrong letters">
          {wrong.length === 0 ? (
            <span className="snowman-wrong__none">Key a letter to guess</span>
          ) : (
            wrong.map((letter) => <span key={letter}>{letter}</span>)
          )}
        </div>
      </div>

      <div className="game__bottom">
        <div className="game__actions">
          <button
            className="btn btn--outlined"
            onClick={hint}
            disabled={hints === 0 || paused}
          >
            <SpeakerIcon />
            <span>Hear a letter ({hints})</span>
          </button>
        </div>
        <MorseKeys setGuess={onChar} onInvalid={() => triggerFlash("bad")} />
      </div>
    </div>
  );
};
