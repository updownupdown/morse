import React, { useContext, useEffect, useState } from "react";
import { Keyboard } from "./Keyboard";
import "./Decode.scss";
import { Speaker as SpeakerIcon } from "../icons/Speaker";
import { alphaToMorse } from "../data/alphaToMorse";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { Status, Word } from "./Word";
import { Difficulty, MorseContext } from "../context/MorseContext";
import { Stop as StopIcon } from "../icons/Stop";
import { getRandomSource, Sources } from "../data/dataSources";

export const Decode = () => {
  const { settings, isPlayingTone } = useContext(MorseContext);
  const { playMorse, stopMorse } = useMorseAudio();

  const [source, setSource] = useState<Sources>(Sources.Words);
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
      newStatus.push("empty");
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
    } else if (status.find((val) => val !== "correct") === undefined) {
      setDecodeWord("");
      return;
    }

    const newIndex = status.findIndex((s) =>
      ["empty", "incorrect"].includes(s),
    );

    setWordIndex(newIndex);
  }, [status]);

  // Play letter on index change
  useEffect(() => {
    if (
      wordIndex === -1 ||
      settings.difficulty === Difficulty.Hard ||
      decodeWord[wordIndex] === undefined
    ) {
      return;
    }

    playMorse(alphaToMorse(decodeWord[wordIndex]));
  }, [decodeWord, wordIndex]);

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
          playOnPress={false}
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
