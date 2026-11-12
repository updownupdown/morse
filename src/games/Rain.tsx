import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { alphaToMorse } from "../data/alphaToMorse";
import { words } from "../data/words";
import { MorseKeys } from "../components/MorseKeys";
import { MorseChar } from "../components/MorseChar";
import { useProgress } from "../context/ProgressContext";
import {
  charsForLevel,
  GameStats,
  Lives,
  pick,
  Stat,
  usePaused,
} from "./common";
import { GameProps } from "./types";

type Drop = {
  id: number;
  text: string;
  // Characters of the text already keyed
  done: number;
  // Across (0-1, left edge) and down (0 top - 1 landed)
  x: number;
  y: number;
};

const maxLives = 3;
const shortWords = words.filter((w) => w.length >= 2 && w.length <= 3);

// Seconds a drop takes to fall, and seconds between drops, by stage
function pace(level: string, stage: number) {
  const base = level === "easy" ? 11 : level === "medium" ? 9 : 7.5;
  return {
    fall: Math.max(base - stage * 0.6, 4),
    gap: Math.max(base / 2.4 - stage * 0.25, 1.6),
  };
}

export const Rain = ({ level, onEnd }: GameProps) => {
  const { record } = useProgress();
  const chars = charsForLevel(level);

  const [drops, setDrops] = useState<Drop[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(maxLives);

  const dropsRef = useRef<Drop[]>([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(maxLives);
  const nextIdRef = useRef(1);
  const overRef = useRef(false);

  const stage = Math.floor(score / 10);

  const paused = usePaused();
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let sinceSpawn = Infinity;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (overRef.current) return;

      if (pausedRef.current) {
        frame = requestAnimationFrame(tick);
        return;
      }

      const currentStage = Math.floor(scoreRef.current / 10);
      const { fall, gap } = pace(level, currentStage);
      sinceSpawn += dt;

      let next = dropsRef.current.map((d) => ({ ...d, y: d.y + dt / fall }));

      // Landed: lose a life
      const landed = next.filter((d) => d.y >= 1);
      if (landed.length > 0) {
        next = next.filter((d) => d.y < 1);
        landed.forEach((d) => record("send", d.text[d.done], false));
        livesRef.current -= landed.length;
        setLives(Math.max(livesRef.current, 0));

        if (livesRef.current <= 0) {
          overRef.current = true;
          dropsRef.current = [];
          setDrops([]);
          onEnd({ score: scoreRef.current });
          return;
        }
      }

      if (sinceSpawn >= gap && next.length < 5) {
        sinceSpawn = 0;
        // Whole words start to fall from the third stage
        const text =
          currentStage >= 2 && Math.random() < 0.35
            ? pick(shortWords).toUpperCase()
            : pick(chars);

        next.push({
          id: nextIdRef.current++,
          text,
          done: 0,
          x: 0.06 + Math.random() * 0.7,
          y: 0,
        });
      }

      dropsRef.current = next;
      setDrops(next);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      overRef.current = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  function onChar(char: string) {
    // The lowest drop waiting for this character
    const target = [...dropsRef.current]
      .sort((a, b) => b.y - a.y)
      .find((d) => d.text[d.done] === char);
    if (!target) return;

    record("send", char, true);

    if (target.done + 1 === target.text.length) {
      dropsRef.current = dropsRef.current.filter((d) => d.id !== target.id);
      scoreRef.current += 1;
      setScore(scoreRef.current);
    } else {
      dropsRef.current = dropsRef.current.map((d) =>
        d.id === target.id ? { ...d, done: d.done + 1 } : d,
      );
    }
    setDrops(dropsRef.current);
  }

  return (
    <div className="game game--rain">
      <GameStats
        left={<Stat label="Caught" value={score} />}
        centre={<Stat label="Stage" value={stage + 1} />}
        right={<Lives lives={lives} max={maxLives} />}
      />

      <div className="rain-field">
        {drops.map((drop) => (
          <div
            key={drop.id}
            className={clsx("rain-drop", drop.y > 0.75 && "rain-drop--low")}
            style={{ left: `${drop.x * 100}%`, top: `${drop.y * 100}%` }}
          >
            <span>
              <b>{drop.text.slice(0, drop.done)}</b>
              {drop.text.slice(drop.done)}
            </span>
            {/* Easy shows the code for the next character */}
            {level === "easy" && (
              <MorseChar morse={alphaToMorse(drop.text[drop.done])} size="sm" />
            )}
          </div>
        ))}
        <div className="rain-ground" />
      </div>

      <div className="game__bottom">
        <MorseKeys setGuess={onChar} />
      </div>
    </div>
  );
};
