import React, { useContext, useEffect, useState } from "react";
import { Keyboard } from "./Keyboard";
import "./Decode.scss";
import { Speaker as SpeakerIcon } from "../icons/Speaker";
import { alphaToMorse } from "../data";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { getRandomWord } from "../data/words";
import { Status, Word } from "./Word";
import { Difficulty, MorseContext } from "../context/MorseContext";

export const Decode = () => {
  const { settings, isPlayingTone } = useContext(MorseContext);
  const { playMorse } = useMorseAudio();

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
    if (decodeWord.length === 0) {
      newWord(getRandomWord());
    }
  }, [decodeWord]);

  useEffect(() => {
    let newIndex = status.findIndex((s) => ["empty", "incorrect"].includes(s));

    if (newIndex === -1) {
      newIndex = guess.findIndex((s) => s === "");
    }

    setDecodeIndex(newIndex);

    // Play next letter
    if (
      settings.difficulty === Difficulty.Easy &&
      decodeWord[decodeIndex] !== undefined &&
      alphaToMorse[decodeWord[newIndex]]
    ) {
      playMorse(alphaToMorse[decodeWord[newIndex]]);
    }

    if (
      status.length !== 0 &&
      status.find((val) => val !== "correct") === undefined
    ) {
      setDecodeWord("");
    }
  }, [status, guess]);

  function pressKey(key: string) {
    let newGuess = [...guess];
    let newStatus = [...status];

    newGuess[decodeIndex] = key;

    if (key === decodeWord[decodeIndex]) {
      newStatus[decodeIndex] = "correct";
    } else {
      newStatus[decodeIndex] = "incorrect";
    }

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
          disabled={isPlayingTone}
        >
          <SpeakerIcon />
          <span>Word</span>
        </button>
        <button
          className="btn btn--outlined"
          onClick={() => {
            playMorse(alphaToMorse[decodeWord[decodeIndex]]);
          }}
          disabled={isPlayingTone}
        >
          <SpeakerIcon />
          <span>Letter</span>
        </button>
      </div>

      <Keyboard onPress={pressKey} />
    </div>
  );
};
