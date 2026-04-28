import React, { useEffect, useState } from "react";
import "./Encode.scss";
import { MorseKeys } from "./MorseKeys";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { alphaToMorse } from "../data/alphaToMorse";
import { Status, Word } from "./Word";
import { getRandomSource, Sources } from "../data/dataSources";

export const Encode = () => {
  const [word, setWord] = useLocalStorage("encodeWord", "");
  const [wordIndex, setWordIndex] = useState(0);
  const [status, setStatus] = useState<Status[]>([]);
  const [source, setSource] = useState<Sources>(Sources.Words);

  function newWord(word: string) {
    let newStatus: Status[] = [];
    let newMorseWord: string[] = [];

    for (let i = 0; i < word.length; i++) {
      newStatus.push("empty");
      newMorseWord.push(alphaToMorse[word[i]]);
    }

    setStatus(newStatus);
    setWordIndex(0);
    setWord(word);
  }

  function submitChar(char: string) {
    const isCorrect = char === word.charAt(wordIndex).toUpperCase();

    let newStatus = [...status];
    newStatus[wordIndex] = isCorrect ? "correct" : "incorrect";
    setStatus(newStatus);

    if (isCorrect) {
      if (wordIndex === word.length - 1) {
        setWord("");
      } else {
        setWordIndex((prev) => prev + 1);
      }
    }
  }

  useEffect(() => {
    if (word.length !== 0) return;

    newWord(getRandomSource(source));
  }, [source, word]);

  return (
    <div className="encode">
      <div className="button-menu button-menu--small">
        {Object.entries(Sources).map(([key, val]) => {
          return (
            <button
              key={key}
              className={`btn-menu-item btn-menu-item--${source === val ? "selected" : "not-selected"}`}
              onClick={() => {
                setWord("");
                setSource(val as Sources);
              }}
            >
              {val}
            </button>
          );
        })}
      </div>

      <div className="encode__word">
        <Word
          word={word}
          index={wordIndex}
          status={status}
          setIndex={setWordIndex}
        />
      </div>

      <MorseKeys word={word} submitChar={submitChar} />
    </div>
  );
};
