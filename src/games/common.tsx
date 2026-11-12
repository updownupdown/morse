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
