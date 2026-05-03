import React, { useContext, useEffect, useRef, useState } from "react";
import { Keyboard } from "./Keyboard";
import "./Receive.scss";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import { alphaToMorse } from "../data/alphaToMorse";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { Status, Word } from "./Word";
import { Difficulty, MorseContext, Setting } from "../context/MorseContext";
import { StopIcon } from "../icons/StopIcon";
import { getRandomSource, Sources } from "../data/dataSources";
import { useLocalStorage } from "../hooks/useLocalStorage";
import clsx from "clsx";

export const Receive = () => {
  const { settings, isPlaying: isPlaying } = useContext(MorseContext);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const { playMorse, stopMorse } = useMorseAudio();

  const [source, setSource] = useLocalStorage<Sources>(
    "receiveSource",
    Sources.Words,
  );
  const [wordAlpha, setWordAlpha] = useState("");
  const [wordMorse, setWordMorse] = useState("");

  const [wordIndex, setWordIndex] = useState(0);
  const [status, setStatus] = useState<Status[]>([]);

  const [lastPlayBtnPressed, setLastPlayBtnPressed] = useState<
    "word" | "letter"
  >("letter");
  const lastPlayBtnPressedRef = useRef(lastPlayBtnPressed);
  lastPlayBtnPressedRef.current = lastPlayBtnPressed;

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
      settings[Setting.Difficulty] !== Difficulty.Hard &&
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

  const wordBtnIsStop = () =>
    isPlayingRef.current && lastPlayBtnPressedRef.current === "word";

  const letterBtnIsStop = () =>
    isPlayingRef.current && lastPlayBtnPressedRef.current === "letter";

  function playPauseWord() {
    setLastPlayBtnPressed("word");

    if (wordBtnIsStop()) {
      stopMorse();
    } else {
      playMorse(wordMorse);
    }
  }

  function playPauseLetter() {
    setLastPlayBtnPressed("letter");

    if (letterBtnIsStop()) {
      stopMorse();
    } else {
      playMorse(alphaToMorse(wordAlpha[wordIndex]));
    }
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey || e.repeat) return;

      if (e.key === " " && !letterBtnIsStop()) {
        playPauseWord();
        e.preventDefault();
      } else if (e.code === "ArrowRight" && !wordBtnIsStop()) {
        playPauseLetter();
        e.preventDefault();
      } else if (/^[a-z]$/i.test(e.key)) {
        pressKey(e.key.toUpperCase());
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [wordAlpha, wordIndex, wordMorse]);

  return (
    <div className="receive">
      <div className="receive__buttons">
        <div className="button-menu">
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
        <Word word={wordAlpha} status={status} index={wordIndex} />
      </div>
      <div className="receive__buttons">
        <button
          className={clsx(
            "btn btn--outlined",
            wordBtnIsStop() && "btn--outlined-stop",
          )}
          onClick={playPauseWord}
          disabled={letterBtnIsStop()}
        >
          {wordBtnIsStop() ? <StopIcon /> : <SpeakerIcon />}
          <span>{wordBtnIsStop() ? "Stop" : "Word"}</span>
        </button>
        <button
          className={clsx(
            "btn btn--outlined",
            letterBtnIsStop() && "btn--outlined-stop",
          )}
          onClick={playPauseLetter}
          disabled={wordBtnIsStop()}
        >
          {letterBtnIsStop() ? <StopIcon /> : <SpeakerIcon />}
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
