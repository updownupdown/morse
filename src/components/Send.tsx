import React, { useContext, useEffect, useRef, useState } from "react";
import "./Send.scss";
import { MorseKeys } from "./MorseKeys";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { alphaToMorse, calculateMorseUnitLength } from "../data/alphaToMorse";
import { Status, Word } from "./Word";
import { getRandomSource, Sources } from "../data/dataSources";
import { MorseContext } from "../context/MorseContext";

export const Send = () => {
  const { settings } = useContext(MorseContext);

  const [wordAlpha, setWordAlpha] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [status, setStatus] = useState<Status[]>([]);
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

  // Reset word on source change or word reset
  useEffect(() => {
    if (wordAlpha.length !== 0) return;

    let newWord = getRandomSource(source);
    let newStatus: Status[] = [];
    let newMorseWord: string[] = [];

    for (let i = 0; i < newWord.length; i++) {
      newStatus.push(newWord[i] === " " ? "space" : "empty");
      newMorseWord.push(alphaToMorse(newWord[i]));
    }

    setStatus(newStatus);
    setWordIndex(0);
    setWordAlpha(newWord);

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
      <div className="button-menu button-menu--small">
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
        <div className="send__wpm">
          <span>{wpm.toFixed()} WPM</span>
        </div>
      )}

      <div className="send__word">
        <Word word={wordAlpha} index={wordIndex} status={status} />
      </div>

      <MorseKeys
        hint={alphaToMorse(wordAlpha.charAt(wordIndex).toUpperCase())}
        word={wordAlpha}
        submitChar={submitChar}
        startTimer={startTimer}
      />
    </div>
  );
};
