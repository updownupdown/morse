import React, { useContext, useEffect, useState } from "react";
import "./Practice.scss";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Word } from "./Word";
import { MorseKeys } from "./MorseKeys";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { alphaToMorse } from "../data/alphaToMorse";
import { StopIcon } from "../icons/StopIcon";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import { MorseContext } from "../context/MorseContext";
import { DeleteIcon } from "../icons/DeleteIcon";
import { BackspaceIcon } from "../icons/BackspaceIcon";
import { SlashIcon } from "../icons/SlashIcon";
import clsx from "clsx";

export const Practice = () => {
  const { isPlaying, selectedMenu } = useContext(MorseContext);

  const { playMorse, stopMorse } = useMorseAudio();

  const [word, setWord] = useLocalStorage("practiceWord", "");
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isWordEmpty, setIsWordEmpty] = useState(true);

  useEffect(() => {
    setIsWordEmpty(word.length === 0);
  }, [word]);

  useEffect(() => {
    setIsPlayingWord(isPlaying === "charOrWord");
  }, [isPlaying]);

  function addCharacter(char: string) {
    setWord(word + char);
  }

  const playPauseIsDisabled = isWordEmpty;

  function playPause() {
    if (!playPauseIsDisabled) {
      if (isPlayingWord) {
        stopMorse();
      } else {
        playMorse(alphaToMorse(word));
      }
    }
  }

  useEffect(() => {
    stopMorse();
  }, [selectedMenu]);

  const deleteAllIsDisabled = isWordEmpty || isPlayingWord;
  function deleteAll() {
    if (!deleteAllIsDisabled) {
      setWord("");
    }
  }

  const backspaceIsDisabled = isWordEmpty || isPlayingWord;
  function backspaceChar() {
    if (!backspaceIsDisabled) {
      setWord(word.slice(0, -1));
    }
  }

  const addSlashDisabled =
    word.charAt(word.length - 1) === " " || isWordEmpty || isPlayingWord;

  function addSlash() {
    if (!addSlashDisabled) {
      setWord(word + " ");
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
        addCharacter(e.key.toUpperCase());
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [word, isPlayingWord, isWordEmpty]);

  return (
    <div className="practice">
      <div className="practice__word">
        <Word word={word} />
      </div>

      <div className="practice__buttons">
        {/* Play word */}
        <button
          className={clsx(
            "btn btn--outlined",
            isPlayingWord && "btn--outlined-stop",
          )}
          onClick={playPause}
          disabled={playPauseIsDisabled}
        >
          {isPlayingWord ? <StopIcon /> : <SpeakerIcon />}
        </button>

        {/* Delete */}
        <button
          className="btn btn--outlined"
          onClick={deleteAll}
          disabled={deleteAllIsDisabled}
        >
          <DeleteIcon />
        </button>

        {/* Backspace */}
        <button
          className="btn btn--outlined"
          onClick={backspaceChar}
          disabled={backspaceIsDisabled}
        >
          <BackspaceIcon />
        </button>

        {/* Wordbreak */}
        <button
          className="btn btn--outlined"
          onClick={addSlash}
          disabled={addSlashDisabled}
        >
          <SlashIcon />
        </button>
      </div>

      <MorseKeys submitChar={addCharacter} />
    </div>
  );
};
