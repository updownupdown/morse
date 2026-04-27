import React, { useContext, useEffect, useState } from "react";
import { Keyboard } from "./Keyboard";
import "./Decode.scss";
import { Speaker as SpeakerIcon } from "../icons/Speaker";
import { alphaToMorse } from "../data";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { getRandomWord } from "../data/words";
import { Status, Word } from "./Word";
import { Difficulty, MorseContext } from "../context/MorseContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const Decode = () => {
  const { settings, isPlayingTone } = useContext(MorseContext);
  const { playMorse } = useMorseAudio();

  const [decodeWord, setDecodeWord] = useLocalStorage("decodeWord", "");
  const [morseWord, setMorseWord] = useState("");
  const [status, setStatus] = useState<Status[]>([]);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    let currentWord = decodeWord;

    if (decodeWord.length === 0) {
      currentWord = getRandomWord();
    }

    let newStatus: Status[] = [];
    let newMorseWord: string[] = [];

    for (let i = 0; i < currentWord.length; i++) {
      newStatus.push("empty");
      newMorseWord.push(alphaToMorse[currentWord[i]]);
    }

    setStatus(newStatus);
    setWordIndex(0);
    setDecodeWord(currentWord);
    setMorseWord(newMorseWord.join(" "));

    // playMorse(newMorseWord.join(" "));
  }, [decodeWord]);

  useEffect(() => {
    const newIndex = status.findIndex((s) =>
      ["empty", "incorrect"].includes(s),
    );

    setWordIndex(newIndex);

    // Play next letter
    if (
      settings.difficulty !== Difficulty.Hard &&
      decodeWord[wordIndex] !== undefined &&
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
  }, [status]);

  function pressKey(key: string) {
    let newStatus = [...status];

    if (key === decodeWord[wordIndex]) {
      newStatus[wordIndex] = "correct";
    } else {
      newStatus[wordIndex] = "incorrect";
    }

    setStatus(newStatus);
  }

  return (
    <div className="decode">
      <div className="decode__word">
        <Word
          word={decodeWord}
          status={status}
          index={wordIndex}
          setIndex={setWordIndex}
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
            playMorse(alphaToMorse[decodeWord[wordIndex]]);
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
