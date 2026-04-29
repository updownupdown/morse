import React, { useEffect, useRef, useState } from "react";
import "./Encode.scss";
import { MorseKeys } from "./MorseKeys";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { alphaToMorse, calculateMorseUnitLength } from "../data/alphaToMorse";
import { Status, Word } from "./Word";
import { getRandomSource, Sources } from "../data/dataSources";

export const Encode = () => {
  const [encodeWord, setEncodeWord] = useLocalStorage("encodeWord", "");
  const [wordIndex, setWordIndex] = useState(0);
  const [status, setStatus] = useState<Status[]>([]);
  const [source, setSource] = useLocalStorage<Sources>(
    "encodeSource",
    Sources.Words,
  );

  // WPM counter
  const [wpm, setWpm] = useLocalStorage("encodeWpm", 0);
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

  // Reset word on source change or word reset
  useEffect(() => {
    if (encodeWord.length !== 0) return;

    let newWord = getRandomSource(source);
    let newStatus: Status[] = [];
    let newMorseWord: string[] = [];

    for (let i = 0; i < newWord.length; i++) {
      newStatus.push("empty");
      newMorseWord.push(alphaToMorse(newWord[i]));
    }

    setStatus(newStatus);
    setWordIndex(0);
    setEncodeWord(newWord);

    // Enable/disable WPM timer
    if (newWord.length > 1) {
      setEnableWpm(true);

      const unitLength = calculateMorseUnitLength(alphaToMorse(newWord));
      setWordUnitLength(unitLength);
    } else {
      setEnableWpm(false);
    }
  }, [source, encodeWord]);

  function submitChar(char: string) {
    const isCorrect = char === encodeWord.charAt(wordIndex).toUpperCase();

    let newStatus = [...status];
    newStatus[wordIndex] = isCorrect ? "correct" : "incorrect";
    setStatus(newStatus);

    if (isCorrect) {
      if (wordIndex === encodeWord.length - 1) {
        // Done word!

        // Stop WPM timer
        if (timerRef.current !== null) {
          const timeEllapsed = Date.now() - timerRef.current;

          if (wordUnitLength) {
            setWpm(calculateWPM(timeEllapsed, wordUnitLength));
          }

          timerRef.current = null;
        }

        // Reset word
        setEncodeWord("");
      } else {
        setWordIndex((prev) => prev + 1);
      }
    }
  }

  return (
    <div className="encode">
      <div className="button-menu button-menu--small">
        {Object.entries(Sources).map(([key, val]) => {
          return (
            <button
              key={key}
              className={`btn-menu-item btn-menu-item--${source === val ? "selected" : "not-selected"}`}
              onClick={() => {
                setEncodeWord("");
                setSource(val as Sources);
              }}
            >
              {val}
            </button>
          );
        })}
      </div>

      {enableWpm && (
        <div className="encode__wpm">
          <span>{wpm.toFixed(2)} WPM</span>
        </div>
      )}

      <div className="encode__word">
        <Word word={encodeWord} index={wordIndex} status={status} />
      </div>

      <MorseKeys
        word={encodeWord}
        submitChar={submitChar}
        startTimer={startTimer}
      />
    </div>
  );
};
