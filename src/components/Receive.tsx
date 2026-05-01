import React, { useContext, useEffect, useState } from "react";
import { Keyboard } from "./Keyboard";
import "./Receive.scss";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import { alphaToMorse } from "../data/alphaToMorse";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { Status, Word } from "./Word";
import { Difficulty, MorseContext } from "../context/MorseContext";
import { StopIcon } from "../icons/StopIcon";
import { getRandomSource, Sources } from "../data/dataSources";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const Receive = () => {
  const { settings, isPlayingTone } = useContext(MorseContext);
  const { playMorse, stopMorse } = useMorseAudio();

  const [source, setSource] = useLocalStorage<Sources>(
    "receiveSource",
    Sources.Words,
  );
  const [wordAlpha, setWordAlpha] = useState("");
  const [wordMorse, setWordMorse] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [status, setStatus] = useState<Status[]>([]);

  // Set/reset word
  useEffect(() => {
    if (wordAlpha.length !== 0) return;

    let newWord = getRandomSource(source);
    let newStatus: Status[] = [];
    let newMorseWord: string[] = [];

    for (let i = 0; i < newWord.length; i++) {
      newStatus.push(newWord[i] === " " ? "space" : "empty");
      newMorseWord.push(alphaToMorse(newWord[i]));
    }

    setWordIndex(0);
    setWordAlpha(newWord);
    setWordMorse(newMorseWord.join(" "));
    setStatus(newStatus);
  }, [wordAlpha]);

  // Update on status change (key press)
  useEffect(() => {
    if (status.length === 0) {
      return;
    } else if (
      status.find((val) => !["correct", "space"].includes(val)) === undefined
    ) {
      // Word done! Reset it.
      setWordAlpha("");
      return;
    }

    const newIndex = status.findIndex((s) =>
      ["empty", "incorrect"].includes(s),
    );

    // Play letter on index change (will trigger on auto index change, but not on manual)
    if (
      newIndex !== -1 &&
      settings.difficulty !== Difficulty.Hard &&
      wordAlpha[newIndex] !== undefined
    ) {
      playMorse(alphaToMorse(wordAlpha[newIndex]));
    }

    setWordIndex(newIndex);
  }, [status]);

  function pressKey(key: string) {
    // Update status
    let newStatus = [...status];

    if (key === wordAlpha[wordIndex]) {
      newStatus[wordIndex] = "correct";
    } else {
      newStatus[wordIndex] = "incorrect";
    }

    setStatus(newStatus);
  }

  return (
    <div className="receive">
      <div className="receive__buttons">
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
      </div>

      <div className="receive__word">
        <Word
          word={wordAlpha}
          status={status}
          index={wordIndex}
          setIndex={setWordIndex}
        />
      </div>
      <div className="receive__buttons">
        <button
          className="btn btn--outlined"
          onClick={() => {
            if (isPlayingTone) {
              stopMorse();
            } else {
              playMorse(wordMorse);
            }
          }}
        >
          {isPlayingTone ? <StopIcon /> : <SpeakerIcon />}
          <span>{isPlayingTone ? "Stop" : "Word"}</span>
        </button>
        <button
          className="btn btn--outlined"
          onClick={() => {
            playMorse(alphaToMorse(wordAlpha[wordIndex]));
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
