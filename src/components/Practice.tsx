import React, { useContext, useEffect, useRef, useState } from "react";
import "./Practice.scss";
import { Word } from "./Word";
import { alphaToMorse, unitLengths } from "../data/alphaToMorse";
import { StopIcon } from "../icons/StopIcon";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import { MorseContext, Setting } from "../context/MorseContext";
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
  const { setPhase, settings } = useContext(MorseContext);
  const { playMorse, stopMorse, isPlaying } = useAudioContext();

  const [isWordEmpty, setIsWordEmpty] = useState(true);
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const addWordBreakAfterTimeoutRef = useRef(false);

  useEffect(() => {
    setIsWordEmpty(practiceWord.length === 0);
  }, [practiceWord]);

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Update isPlayingWord for "stop" button states
    setIsPlayingWord(isPlaying === "charOrWord");

    // Auto-add wordbreak
    const autoWordbreak = settings[Setting.AutoWordBreak];

    // Cancel any previous timeout if isPlaying changes
    if (timeoutRef.current && !autoWordbreak) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!autoWordbreak) return;

    if (isPlaying !== undefined) {
      addWordBreakAfterTimeoutRef.current = isPlaying === "symbol";
    }

    timeoutRef.current = setTimeout(
      () => {
        if (addWordBreakAfterTimeoutRef.current) {
          addPracticeCharacter(" ");
          addWordBreakAfterTimeoutRef.current = false;
        }
      },
      settings[Setting.UnitTime] *
        unitLengths["/"] *
        settings[Setting.Farnsworth],
    );

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isPlaying, settings]);

  function playPause() {
    if (!isWordEmpty) {
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
      addPracticeCharacter(" ");
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
          disabled={isWordEmpty}
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
