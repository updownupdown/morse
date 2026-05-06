import React, { useContext, useEffect } from "react";
import clsx from "clsx";
import { useAudio } from "../hooks/useAudio";
import { alphaToMorse } from "../data/alphaToMorse";
import "./Word.scss";
import { MorseContext } from "../context/MorseContext";

export type Status = "empty" | "correct" | "incorrect" | "space";

interface Props {
  word: string | undefined;
  guess?: string | undefined;
  letterIndex?: number | undefined;
}

export const Word = ({ word, guess, letterIndex }: Props) => {
  const { isPlaying, selectedMenu } = useContext(MorseContext);
  const { playMorse, stopMorse } = useAudio();

  useEffect(() => {
    stopMorse();
  }, [selectedMenu]);

  let letterSize = "sm";

  if (word === undefined || letterIndex === undefined) return null;

  if (word.length < 2) {
    letterSize = "lg";
  } else if (word.length < 30) {
    letterSize = "md";
  }

  return (
    <div className={`word word--size-${letterSize}`}>
      {word.length > 0 &&
        word.split("").map((letter, i) => {
          let statusClass = "";

          if (letter === " ") {
            statusClass = "space";
          } else if (i > letterIndex) {
            statusClass = "empty";
          } else if (i < letterIndex) {
            statusClass = "correct";
          } else if (guess !== undefined && guess !== letter) {
            statusClass = "incorrect";
          }

          if (letter === " ") {
            return (
              <div key={i} className="slash">
                /
              </div>
            );
          }

          return (
            <button
              key={i}
              className={clsx(
                "letter",
                `letter--${statusClass}`,
                i === letterIndex && "letter--current beep-glow",
              )}
              onClick={() => {
                if (i !== letterIndex) return;

                playMorse(alphaToMorse(letter));
              }}
              disabled={isPlaying !== undefined}
            >
              <span>{word[i]}</span>
            </button>
          );
        })}
    </div>
  );
};
