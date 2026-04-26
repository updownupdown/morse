import React, { useContext, useEffect, useState } from "react";
import { Keyboard } from "./Keyboard";
import "./Decode.scss";
import { Speaker as SpeakerIcon } from "../icons/Speaker";
import { Return as ReturnIcon } from "../icons/Return";
import { alphaToMorse } from "../data";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { getRandomWord } from "../data/words";
import { Status, Word } from "./Word";
import { Difficulty, MorseContext } from "../context/MorseContext";

export const Decode = () => {
  const { settings } = useContext(MorseContext);
  const { playMorse, isPlaying } = useMorseAudio();

  const [decodeWord, setDecodeWord] = useState("");
  const [morseWord, setMorseWord] = useState("");
  const [status, setStatus] = useState<Status[]>([]);
  const [guess, setGuess] = useState<string[]>([]);
  const [decodeIndex, setDecodeIndex] = useState(0);

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
    setDecodeIndex(0);
    setDecodeWord(word);
    setMorseWord(newMorseWord.join(" "));
  }

  useEffect(() => {
    newWord(getRandomWord());
  }, []);

  useEffect(() => {
    let newIndex = status.findIndex((s) => ["empty", "incorrect"].includes(s));

    if (newIndex === -1) {
      newIndex = guess.findIndex((s) => s === "");
    }

    setDecodeIndex(newIndex);

    if (
      settings.difficulty === Difficulty.Easy &&
      decodeWord[decodeIndex] !== undefined
    ) {
      playMorse(alphaToMorse[decodeWord[newIndex]]);
    }

    if (
      status.length !== 0 &&
      status.find((val) => val !== "correct") === undefined
    ) {
      newWord("LOREM");
    }
  }, [status, guess]);

  function checkGuesses() {
    let newStatus = [...status];

    for (let i = 0; i < decodeWord.length; i++) {
      if (status[i] === "correct" || guess[i] === "") continue;

      if (guess[i] === decodeWord[i]) {
        newStatus[i] = "correct";
      } else {
        newStatus[i] = "incorrect";
      }
    }

    setStatus(newStatus);
  }

  function pressKey(key: string) {
    let newGuess = [...guess];
    let newStatus = [...status];

    newGuess[decodeIndex] = key;
    newStatus[decodeIndex] = "guess";

    setGuess(newGuess);
    setStatus(newStatus);
  }

  return (
    <div className="decode">
      <div className="decode__word">
        <Word
          word={decodeWord}
          status={status}
          guess={guess}
          index={decodeIndex}
          setIndex={setDecodeIndex}
        />
      </div>
      <div className="decode__buttons">
        <button
          className="btn btn--outlined"
          onClick={() => {
            playMorse(morseWord);
          }}
          disabled={isPlaying}
        >
          <SpeakerIcon />
          <span>Word</span>
        </button>
        <button
          className="btn btn--outlined"
          onClick={() => {
            playMorse(alphaToMorse[decodeWord[decodeIndex]]);
          }}
          disabled={isPlaying}
        >
          <SpeakerIcon />
          <span>Letter</span>
        </button>
        <button
          className="btn btn--full"
          onClick={() => {
            checkGuesses();
          }}
        >
          <ReturnIcon />
          <span>Submit</span>
        </button>
      </div>

      <Keyboard onPress={pressKey} />
    </div>
  );
};
