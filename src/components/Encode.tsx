import React, { useEffect, useState } from "react";
import "./Encode.scss";
import { MorseKeys } from "./MorseKeys";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { alphaToMorse } from "../data";
import { Status, Word } from "./Word";
import { getRandomWord } from "../data/words";

export const Encode = () => {
  const [word, setWord] = useLocalStorage("encodeWord", "");
  const [guessIndex, setGuessIndex] = useState(0);
  const [status, setStatus] = useState<Status[]>([]);
  const [guess, setGuess] = useState<string[]>([]);

  function newWord(word: string) {
    let newStatus: Status[] = [];
    let newGuess: string[] = [];
    let newMorseWord: string[] = [];

    for (let i = 0; i < word.length; i++) {
      newStatus.push("empty");
      newGuess.push("");
      newMorseWord.push(alphaToMorse[word[i]]);
    }

    setStatus(newStatus);
    setGuess(newGuess);
    setGuessIndex(0);
    setWord(word);
  }

  function submitChar(char: string) {
    const isCorrect = char === word.charAt(guessIndex).toUpperCase();

    let newGuess = [...guess];
    newGuess[guessIndex] = char;
    setGuess(newGuess);

    let newStatus = [...status];
    newStatus[guessIndex] = isCorrect ? "correct" : "incorrect";
    setStatus(newStatus);

    if (isCorrect) {
      if (guessIndex === word.length - 1) {
        setWord("");
      } else {
        setGuessIndex((prev) => prev + 1);
      }
    }
  }

  useEffect(() => {
    if (word.length === 0) {
      newWord(getRandomWord());
    }
  }, [word]);

  return (
    <div className="encode">
      <div className="encode__word">
        <Word
          word={word}
          index={guessIndex}
          status={status}
          setIndex={setGuessIndex}
        />
      </div>

      <MorseKeys word={word} submitChar={submitChar} />
    </div>
  );
};
