import React, { useContext, useEffect, useState } from "react";
import { Keyboard } from "./Keyboard";
import "./Decode.scss";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import { alphaToMorse } from "../data/alphaToMorse";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { Status, Word } from "./Word";
import { Difficulty, MorseContext } from "../context/MorseContext";
import { StopIcon } from "../icons/StopIcon";
import { getRandomSource, Sources } from "../data/dataSources";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const Decode = () => {
  const { settings, isPlayingTone } = useContext(MorseContext);
  const { playMorse, stopMorse } = useMorseAudio();

  const [source, setSource] = useLocalStorage<Sources>(
    "decodeSource",
    Sources.Words,
  );
  const [decodeWord, setDecodeWord] = useState("");
  const [morseWord, setMorseWord] = useState("");
  const [status, setStatus] = useState<Status[]>([]);
  const [wordIndex, setWordIndex] = useState(0);

  // Set/reset word
  useEffect(() => {
    if (decodeWord.length !== 0) return;

    let newWord = getRandomSource(source);
    let newStatus: Status[] = [];
    let newMorseWord: string[] = [];

    for (let i = 0; i < newWord.length; i++) {
      newStatus.push(newWord[i] === " " ? "space" : "empty");
      newMorseWord.push(alphaToMorse(newWord[i]));
    }

    setWordIndex(0);
    setDecodeWord(newWord);
    setMorseWord(newMorseWord.join(" "));
    setStatus(newStatus);
  }, [decodeWord]);

  // Update on status change (key press)
  useEffect(() => {
    if (status.length === 0) {
      return;
    } else if (
      status.find((val) => !["correct", "space"].includes(val)) === undefined
    ) {
      // Word done! Reset it.
      setDecodeWord("");
      return;
    }

    const newIndex = status.findIndex((s) =>
      ["empty", "incorrect"].includes(s),
    );

    // Play letter on index change (will trigger on auto index change, but not on manual)
    if (
      newIndex !== -1 &&
      settings.difficulty !== Difficulty.Hard &&
      decodeWord[newIndex] !== undefined
    ) {
      playMorse(alphaToMorse(decodeWord[newIndex]));
    }

    setWordIndex(newIndex);
  }, [status]);

  function pressKey(key: string) {
    // Update status
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
      <div className="decode__buttons">
        <div className="button-menu button-menu--small">
          {Object.entries(Sources).map(([key, val]) => {
            return (
              <button
                key={key}
                className={`btn-menu-item btn-menu-item--${source === val ? "selected" : "not-selected"}`}
                onClick={() => {
                  setDecodeWord("");
                  setSource(val as Sources);
                }}
              >
                {val}
              </button>
            );
          })}
        </div>
      </div>

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
            if (isPlayingTone) {
              stopMorse();
            } else {
              playMorse(morseWord);
            }
          }}
        >
          {isPlayingTone ? <StopIcon /> : <SpeakerIcon />}
          <span>{isPlayingTone ? "Stop" : "Word"}</span>
        </button>
        <button
          className="btn btn--outlined"
          onClick={() => {
            playMorse(alphaToMorse(decodeWord[wordIndex]));
          }}
          disabled={isPlayingTone}
        >
          <SpeakerIcon />
          <span>Letter</span>
        </button>
      </div>

      <Keyboard
        onPress={pressKey}
        isSpecialChars={source === Sources.SpecialChars}
      />
    </div>
  );
};
