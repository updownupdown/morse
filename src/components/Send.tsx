import React, { useEffect, useRef, useState } from "react";
import "./Send.scss";
import { MorseKeys } from "./MorseKeys";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { alphaToMorse, calculateMorseUnitLength } from "../data/alphaToMorse";
import { Status, Word } from "./Word";
import { Sources, useRandomWord } from "../data/DataSources";
import clsx from "clsx";

function getStatusColor(accuracy: number): string {
  // Clamp accuracy between 0 and 100
  const acc = Math.max(0, Math.min(accuracy, 100)) / 100;
  // status-red: #F44336, status-green: #4CAF50
  const red = { r: 244, g: 67, b: 54 };
  const green = { r: 76, g: 175, b: 80 };
  const r = Math.round(red.r + (green.r - red.r) * acc);
  const g = Math.round(red.g + (green.g - red.g) * acc);
  const b = Math.round(red.b + (green.b - red.b) * acc);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const Send = () => {
  const [wordAlpha, setWordAlpha] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [status, setStatus] = useState<Status[]>([]);

  const { getUniqueRandomWord } = useRandomWord();
  const [source, setSource] = useLocalStorage<Sources>(
    "sendSource",
    Sources.Words,
  );

  // WPM counter
  const [wpm, setWpm] = useLocalStorage("sendWpm", 0);
  const [enableWpm, setEnableWpm] = useState(false);
  const [wordUnitLength, setWordUnitLength] = useState<number | undefined>(
    undefined,
  );
  const timerRef = useRef<number>(null);

  function startTimer(now: number) {
    if (timerRef.current === null) {
      timerRef.current = now;
    }
  }

  function calculateWPM(timeInMs: number, unitsSent: number) {
    const timeInSec = timeInMs / 1000;
    return (1.2 * unitsSent) / timeInSec;
  }

  const [mistakes, setMistakes] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number | undefined>(undefined);
  const [accuracyOutdated, setAccuracyOutdated] = useState(true);

  useEffect(() => {
    if (wordIndex === 0 && mistakes === 0) {
      setAccuracyOutdated(true);
    } else {
      setAccuracyOutdated(false);
      let newAccuracy = (wordIndex / (wordIndex + mistakes)) * 100;

      setAccuracy(Math.round(newAccuracy));
    }
  }, [wordIndex, mistakes]);

  // Reset word on source change or word reset
  useEffect(() => {
    if (wordAlpha.length !== 0) return;

    let newWord = getUniqueRandomWord(source);
    let newStatus: Status[] = [];
    let newMorseWord: string[] = [];

    for (let i = 0; i < newWord.length; i++) {
      newStatus.push(newWord[i] === " " ? "space" : "empty");
      newMorseWord.push(alphaToMorse(newWord[i]));
    }

    setStatus(newStatus);
    setWordIndex(0);
    setWordAlpha(newWord);
    setMistakes(0);

    // Enable/disable WPM timer
    if (newWord.length > 1) {
      setEnableWpm(true);

      const unitLength = calculateMorseUnitLength(alphaToMorse(newWord));
      setWordUnitLength(unitLength);
    } else {
      setEnableWpm(false);
    }
  }, [source, wordAlpha]);

  function submitChar(char: string) {
    const isCorrect = char === wordAlpha.charAt(wordIndex).toUpperCase();

    if (!isCorrect) {
      setMistakes((prev) => prev + 1);
    }

    let newStatus = [...status];
    newStatus[wordIndex] = isCorrect ? "correct" : "incorrect";
    setStatus(newStatus);
  }

  useEffect(() => {
    if (status.length === 0) {
      return;
    } else if (
      status.find((val) => !["correct", "space"].includes(val)) === undefined
    ) {
      // Word done! Stop WPM timer and reset word
      if (timerRef.current !== null) {
        const timeEllapsed = Date.now() - timerRef.current;

        if (wordUnitLength) {
          setWpm(calculateWPM(timeEllapsed, wordUnitLength));
        }

        timerRef.current = null;
      }

      setWordAlpha("");
      return;
    } else {
      // Advance
      const newIndex = status.findIndex((s) =>
        ["empty", "incorrect"].includes(s),
      );

      setWordIndex(newIndex);
    }
  }, [status]);

  return (
    <div className="send">
      <div className="button-menu">
        {Object.entries(Sources).map(([key, val]) => {
          return (
            <button
              key={key}
              className={`btn-menu-item btn-menu-item--${source === val ? "selected" : "not-selected"}`}
              onClick={() => {
                setWordAlpha("");
                setSource(val as Sources);
              }}
            >
              {val}
            </button>
          );
        })}
      </div>

      {enableWpm && (
        <div className="send__stats">
          <div className="send__stats__accuracy">
            <span>Accuracy: {accuracy ?? "--"}%</span>

            <div className="send__stats__accuracy__bar">
              <div
                className="accuracy-progress"
                style={{
                  width: `${accuracy ?? 0}%`,
                  background: accuracyOutdated
                    ? ""
                    : getStatusColor(accuracy ?? 0),
                }}
              />
            </div>
          </div>

          <div className="send__stats__wpm">
            {enableWpm && wpm !== 0 ? wpm.toFixed() : "N/A"} WPM
          </div>
        </div>
      )}

      <div className="send__word">
        <Word word={wordAlpha} index={wordIndex} status={status} />
      </div>

      <MorseKeys
        hint={alphaToMorse(wordAlpha.charAt(wordIndex).toUpperCase())}
        submitChar={submitChar}
        startTimer={startTimer}
      />
    </div>
  );
};
