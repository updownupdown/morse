import React, { useEffect, useRef, useState } from "react";
import { letters } from "../data/chars";

export const LV3: [string, string][] = [
  ["easy", "Easy"],
  ["medium", "Medium"],
  ["hard", "Hard"],
];

export const digits = "0123456789".split("");

export function charsForLevel(level: string) {
  if (level === "easy") return "ETIANMSURWDKGO".split("");
  if (level === "hard") return [...letters, ...digits];
  return letters;
}

export const pick = <T,>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)];

// One row of figures for every game: left, centre and right slots
export const GameStats = ({
  left,
  centre,
  right,
}: {
  left?: React.ReactNode;
  centre?: React.ReactNode;
  right?: React.ReactNode;
}) => (
  <div className="game-stats">
    <div>{left}</div>
    <div>{centre}</div>
    <div>{right}</div>
  </div>
);

export const Stat = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <span className="game-stat">
    <b>{value}</b>
    <small>{label}</small>
  </span>
);

export const Lives = ({ lives, max }: { lives: number; max: number }) => (
  <span className="game-lives" aria-label={`${lives} of ${max} lives left`}>
    {Array.from({ length: max }, (_, i) => (
      <i key={i} className={i < lives ? "on" : "off"} />
    ))}
  </span>
);

// Counts down from `seconds`; calls onDone once at zero
export function useCountdown(seconds: number, onDone: () => void) {
  const [left, setLeft] = useState(seconds);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const endsAt = performance.now() + seconds * 1000;

    const timer = window.setInterval(() => {
      const remaining = Math.max(0, (endsAt - performance.now()) / 1000);
      setLeft(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        doneRef.current();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [seconds]);

  return left;
}

export const TimerBar = ({ left, total }: { left: number; total: number }) => (
  <div
    className="game-timer"
    role="timer"
    aria-label={`${Math.ceil(left)} seconds left`}
  >
    <div style={{ width: `${(left / total) * 100}%` }} />
    <span>{Math.ceil(left)}s</span>
  </div>
);

// A brief green or red flash on the game's main card
export function useFlash() {
  const [flash, setFlash] = useState<"good" | "bad" | undefined>(undefined);
  const timerRef = useRef<number | null>(null);

  function trigger(kind: "good" | "bad") {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFlash(kind);
    timerRef.current = window.setTimeout(() => setFlash(undefined), 350);
  }

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return [flash, trigger] as const;
}

// A word as a row of blanks that fill in; `shown` says which are visible
export const Slots = ({
  word,
  shown,
  current,
}: {
  word: string;
  shown: (index: number) => boolean;
  current?: number;
}) => (
  <span className="slots" aria-label={`${word.length} letters`}>
    {word.split("").map((char, i) => (
      <span
        key={i}
        className={
          "slot" +
          (shown(i) ? " slot--done" : "") +
          (i === current ? " slot--current" : "")
        }
      >
        {shown(i) ? char : ""}
      </span>
    ))}
  </span>
);

// Letters and digits typed on a real keyboard, plus named keys
export function useTyping(
  onChar: (char: string) => void,
  keys: Record<string, () => void> = {},
) {
  const handlersRef = useRef({ onChar, keys });
  handlersRef.current = { onChar, keys };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.metaKey || e.ctrlKey || e.repeat) return;
      const { onChar, keys } = handlersRef.current;

      if (keys[e.key]) {
        keys[e.key]();
        e.preventDefault();
      } else if (/^[a-z0-9]$/i.test(e.key)) {
        onChar(e.key.toUpperCase());
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

// Stars for a round, by the slips made in it
export function starsFor(mistakes: number) {
  return mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1;
}

export const Stars = ({ count }: { count: number }) => (
  <span className="stars" aria-label={`${count} of 3 stars`}>
    {"★".repeat(count)}
    {"☆".repeat(3 - count)}
  </span>
);
