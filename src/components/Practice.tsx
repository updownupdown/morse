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
import { SettingToggle } from "./SettingsModal";

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
  const { settings } = useContext(MorseContext);
  const { playMorse, stopMorse, isPlaying } = useAudioContext();

  const [isWordEmpty, setIsWordEmpty] = useState(true);
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isPlayingSymbol, setIsPlayingSymbol] = useState(false);
  const addWordBreakAfterTimeoutRef = useRef(false);

  useEffect(() => {
    setIsWordEmpty(practiceWord.length === 0);
  }, [practiceWord]);

  const timeoutRef = useRef<number | null>(null);
  const wordbreakDelay =
    settings[Setting.UnitTime] *
    unitLengths["/"] *
    settings[Setting.Farnsworth];

  const [showWordbreakProgress, setShowWordbreakProgress] = useState(false);

  async function cancelWorkbreak() {
    setShowWordbreakProgress(false);
    addWordBreakAfterTimeoutRef.current = false;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  async function startWordbreak() {
    await cancelWorkbreak();
    setTimeout(() => setShowWordbreakProgress(true), 10);
    addWordBreakAfterTimeoutRef.current = true;

    timeoutRef.current = setTimeout(() => {
      if (addWordBreakAfterTimeoutRef.current) {
        addPracticeCharacter(" ");
        cancelWorkbreak();
      }
    }, wordbreakDelay);
  }

  useEffect(() => {
    // Update isPlayingWord for "stop" button states
    setIsPlayingWord(isPlaying === "word");
    setIsPlayingSymbol(isPlaying === "symbol");

    // Auto-add wordbreak?
    const autoWordbreak = settings[Setting.AutoWordBreak];
    if (!autoWordbreak) return;

    if (isPlaying === "symbol") {
      // When playing a character or word, cancel wordbreak
      cancelWorkbreak();
    } else if (isPlaying === undefined && isPlayingSymbol) {
      // When playing a symbol, start a new timeout (which also cancels the previous)
      setIsPlayingSymbol(false);
      startWordbreak();
    }
  }, [isPlaying, settings]);

  useEffect(() => {
    return () => {
      cancelWorkbreak();
    };
  }, []);

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
  }, []);

  return (
    <div className="practice">
      <SettingToggle setting={Setting.AutoWordBreak} />

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
          className="btn btn--flex btn--outlined btn--auto-wordbreak"
          onClick={addSlash}
          disabled={addSlashDisabled}
        >
          <SlashIcon />
          {!addSlashDisabled && showWordbreakProgress && (
            <div
              className="btn-auto-progress"
              style={{ animationDuration: `${wordbreakDelay}ms` }}
            />
          )}
        </button>
      </div>
    </div>
  );
};
