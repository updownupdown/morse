import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { alphaToMorse } from "../data/alphaToMorse";
import { Keyboard } from "../components/Keyboard";
import { useAudioContext } from "../context/AudioContext";
import { useProgress } from "../context/ProgressContext";
import {
  GameStats,
  Stars,
  starsFor,
  Stat,
  useFlash,
  useTyping,
} from "./common";
import { GameProps } from "./types";
import { interceptCases } from "./interceptCases";
import { SpeakerIcon } from "../icons/SpeakerIcon";

export const Intercept = ({ level, onEnd }: GameProps) => {
  const { playMorse, stopMorse } = useAudioContext();
  const { record } = useProgress();
  const [flash, triggerFlash] = useFlash();

  const story = interceptCases.find((c) => c.id === level) ?? interceptCases[0];
  const hasDigits = story.missions.some((m) => /\d/.test(m.message));

  const [missionIndex, setMissionIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [stars, setStars] = useState(0);
  const [solved, setSolved] = useState(false);

  const mission = story.missions[missionIndex];
  const messageWords = mission.message.split(" ");
  const word = messageWords[wordIndex];

  // A slip on this letter already counted against it
  const slippedRef = useRef(false);

  // Each new word is played once
  useEffect(() => {
    if (solved) return;
    const timer = window.setTimeout(() => playMorse(alphaToMorse(word)), 500);
    return () => clearTimeout(timer);
  }, [missionIndex, wordIndex, solved]);

  function replay() {
    if (!solved) playMorse(alphaToMorse(word));
  }

  function onGuess(guess: string) {
    if (solved) return;
    const expected = word[letterIndex];

    if (guess !== expected) {
      if (!slippedRef.current) record("receive", expected, false);
      slippedRef.current = true;
      setMistakes((m) => m + 1);
      triggerFlash("bad");
      return;
    }

    if (!slippedRef.current) record("receive", expected, true);
    slippedRef.current = false;

    if (letterIndex + 1 < word.length) {
      setLetterIndex(letterIndex + 1);
    } else if (wordIndex + 1 < messageWords.length) {
      setWordIndex(wordIndex + 1);
      setLetterIndex(0);
    } else {
      stopMorse();
      setLetterIndex(word.length);
      setStars((s) => s + starsFor(mistakes));
      setSolved(true);
      triggerFlash("good");
    }
  }

  function next() {
    if (missionIndex + 1 === story.missions.length) {
      onEnd({ score: stars, summary: `${story.name}: case closed` });
      return;
    }
    setMissionIndex(missionIndex + 1);
    setWordIndex(0);
    setLetterIndex(0);
    setMistakes(0);
    setSolved(false);
  }

  useTyping(onGuess, {
    Enter: () => solved && next(),
    " ": replay,
  });

  return (
    <div className="game game--intercept">
      <GameStats
        left={
          <Stat
            label="Message"
            value={`${missionIndex + 1}/${story.missions.length}`}
          />
        }
        centre={<Stat label="Stars" value={stars} />}
        right={<Stat label="Slips" value={mistakes} />}
      />

      <div className="game__stage">
        <p className="intercept-brief">{mission.brief}</p>

        <div
          className={clsx(
            "game-card intercept-message",
            flash && `game-card--${flash}`,
          )}
        >
          {messageWords.map((w, wi) => (
            <span key={wi} className="intercept-word">
              {w.split("").map((char, ci) => {
                const done =
                  solved ||
                  wi < wordIndex ||
                  (wi === wordIndex && ci < letterIndex);
                const current =
                  !solved && wi === wordIndex && ci === letterIndex;

                return (
                  <span
                    key={ci}
                    className={clsx(
                      "intercept-char",
                      done && "intercept-char--done",
                      current && "intercept-char--current",
                    )}
                  >
                    {done ? char : ""}
                  </span>
                );
              })}
            </span>
          ))}
        </div>

        {solved ? (
          <>
            <p className="intercept-debrief">
              <Stars count={starsFor(mistakes)} />
              {mission.debrief}
            </p>
            <button className="btn btn--large" onClick={next}>
              <span>
                {missionIndex + 1 === story.missions.length
                  ? "Close the case"
                  : "Next message"}
              </span>
            </button>
          </>
        ) : (
          <button className="btn btn--outlined" onClick={replay}>
            <SpeakerIcon />
            <span>Play word again</span>
          </button>
        )}
      </div>

      <div className="game__bottom">
        <Keyboard
          setGuess={onGuess}
          layout={hasDigits ? "alnum" : "plain"}
          showMorse={false}
          disabled={solved}
        />
      </div>
    </div>
  );
};
