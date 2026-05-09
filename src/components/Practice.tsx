import React, { useContext, useEffect, useState } from "react";
import "./Practice.scss";
import { Word } from "./Word";
import { alphaToMorse } from "../data/alphaToMorse";
import { StopIcon } from "../icons/StopIcon";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import { MorseContext } from "../context/MorseContext";
import { DeleteIcon } from "../icons/DeleteIcon";
import { BackspaceIcon } from "../icons/BackspaceIcon";
import { SlashIcon } from "../icons/SlashIcon";
import clsx from "clsx";
import { useAudioContext } from "../context/AudioContext";

interface PracticeProps {
  practiceWord: string;
  setPracticeWord: (word: string) => void;
  addPracticeCharacter: (char: string) => void;
}

export const Practice = ({
  practiceWord,
  setPracticeWord,
  addPracticeCharacter,
}: PracticeProps) => {
  const { setPhase } = useContext(MorseContext);
  const { playMorse, stopMorse, isPlaying } = useAudioContext();

  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isWordEmpty, setIsWordEmpty] = useState(true);

  useEffect(() => {
    setIsWordEmpty(practiceWord.length === 0);
  }, [practiceWord]);

  useEffect(() => {
    setIsPlayingWord(isPlaying === "charOrWord");
  }, [isPlaying]);

  const playPauseIsDisabled = isWordEmpty;

  function playPause() {
    if (!playPauseIsDisabled) {
      if (isPlayingWord) {
        stopMorse();
      } else {
        playMorse(alphaToMorse(practiceWord));
      }
    }
  }

  const deleteAllIsDisabled = isWordEmpty || isPlayingWord;
  function deleteAll() {
    if (!deleteAllIsDisabled) {
      setPracticeWord("");
    }
  }

  const backspaceIsDisabled = isWordEmpty || isPlayingWord;
  function backspaceChar() {
    if (!backspaceIsDisabled) {
      setPracticeWord(practiceWord.slice(0, -1));
    }
  }

  const addSlashDisabled =
    practiceWord.charAt(practiceWord.length - 1) === " " ||
    isWordEmpty ||
    isPlayingWord;

  function addSlash() {
    if (!addSlashDisabled) {
      setPracticeWord(practiceWord + " ");
    }
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey || e.repeat) return;

      if (e.key === "Backspace") {
        backspaceChar();
        e.preventDefault();
      } else if (e.key === "Delete") {
        deleteAll();
        e.preventDefault();
      } else if (e.key === "/") {
        addSlash();
        e.preventDefault();
      } else if (e.key === " ") {
        playPause();
        e.preventDefault();
      } else if (/^[a-z]$/i.test(e.key)) {
        addPracticeCharacter(e.key.toUpperCase());
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [practiceWord, isPlayingWord, isWordEmpty]);

  return (
    <div className="practice">
      <div className="practice__stop">
        <button
          className="btn btn--flex btn--outlined"
          onClick={() => {
            setPhase("standby");
          }}
        >
          <span>Leave Practice</span>
        </button>
      </div>
      <div className="practice__word">
        <Word word={practiceWord} />
      </div>

      <div className="practice__buttons">
        {/* Play word */}
        <button
          className={clsx(
            "btn btn--flex btn--outlined",
            isPlayingWord && "btn--stop",
          )}
          onClick={playPause}
          disabled={playPauseIsDisabled}
        >
          {isPlayingWord ? <StopIcon /> : <SpeakerIcon />}
        </button>

        {/* Delete */}
        <button
          className="btn btn--flex btn--outlined"
          onClick={deleteAll}
          disabled={deleteAllIsDisabled}
        >
          <DeleteIcon />
        </button>

        {/* Backspace */}
        <button
          className="btn btn--flex btn--outlined"
          onClick={backspaceChar}
          disabled={backspaceIsDisabled}
        >
          <BackspaceIcon />
        </button>

        {/* Wordbreak */}
        <button
          className="btn btn--flex btn--outlined"
          onClick={addSlash}
          disabled={addSlashDisabled}
        >
          <SlashIcon />
        </button>
      </div>
    </div>
  );
};
