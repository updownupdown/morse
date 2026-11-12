import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { alphaToMorse, alphaToMorseDict } from "../data/alphaToMorse";
import { letters } from "../data/chars";
import { MorseKeys } from "../components/MorseKeys";
import { Keyboard } from "../components/Keyboard";
import { useAudioContext } from "../context/AudioContext";
import { useProgress } from "../context/ProgressContext";
import { pickWeighted } from "../progress/progress";
import { GameStats, Stat, TimerBar, useCountdown, useFlash } from "./common";
import { GameProps } from "./types";
import { SpeakerIcon } from "../icons/SpeakerIcon";

const seconds = 60;

export const TimeAttack = ({ level, onEnd }: GameProps) => {
  const byEar = level === "ear";
  const skill = byEar ? "receive" : "send";

  const { playMorse } = useAudioContext();
  const { progress, record } = useProgress();
  const statsRef = useRef(progress[skill]);
  statsRef.current = progress[skill];

  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const scoreRef = useRef(0);
  const [flash, triggerFlash] = useFlash();

  const nextChar = (previous?: string) => {
    let char = pickWeighted(letters, statsRef.current);
    // Never the same character twice running
    while (char === previous) char = pickWeighted(letters, statsRef.current);
    return char;
  };

  const [char, setChar] = useState(() => nextChar());
  const charRef = useRef(char);
  charRef.current = char;
  const missedRef = useRef(false);

  const left = useCountdown(seconds, () => onEnd({ score: scoreRef.current }));

  // By ear: each new character is played
  useEffect(() => {
    if (byEar) playMorse(alphaToMorse(char));
  }, [char]);

  function onGuess(guess: string) {
    const target = charRef.current;

    if (guess === target) {
      record(skill, target, !missedRef.current);
      missedRef.current = false;
      scoreRef.current += 1;
      setScore(scoreRef.current);
      triggerFlash("good");
      setChar(nextChar(target));
    } else {
      missedRef.current = true;
      setMisses((m) => m + 1);
      triggerFlash("bad");
      if (byEar) playMorse(alphaToMorse(target));
    }
  }

  // Typing on a real keyboard
  const guessRef = useRef(onGuess);
  guessRef.current = onGuess;

  useEffect(() => {
    if (!byEar) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.metaKey || e.ctrlKey || e.repeat) return;

      if (e.key === " ") {
        playMorse(alphaToMorse(charRef.current));
        e.preventDefault();
      } else if (e.key.length === 1 && alphaToMorseDict[e.key.toUpperCase()]) {
        guessRef.current(e.key.toUpperCase());
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="game game--time">
      <GameStats
        left={<Stat label="Score" value={score} />}
        centre={<TimerBar left={left} total={seconds} />}
        right={<Stat label="Misses" value={misses} />}
      />

      <div className="game__stage">
        <div className={clsx("game-card", flash && `game-card--${flash}`)}>
          {byEar ? (
            <button
              className="btn btn--outlined"
              onClick={() => playMorse(alphaToMorse(char))}
            >
              <SpeakerIcon />
              <span>Play again</span>
            </button>
          ) : (
            <span className="game-card__char">{char}</span>
          )}
        </div>
        <p className="game__prompt">
          {byEar ? "Type the letter you hear" : "Key this letter"}
        </p>
      </div>

      <div className="game__bottom">
        {byEar ? (
          <Keyboard setGuess={onGuess} layout="plain" showMorse={false} />
        ) : (
          <MorseKeys setGuess={onGuess} />
        )}
      </div>
    </div>
  );
};
