import React, { useContext, useEffect } from "react";
import clsx from "clsx";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { alphaToMorse } from "../data/alphaToMorse";
import "./Word.scss";
import { MorseContext } from "../context/MorseContext";

export type Status = "empty" | "correct" | "incorrect" | "neutral" | "space";

interface Props {
  word: string;
  index?: number;
  status?: Status[];
}

export const Word = ({ word, status, index }: Props) => {
  const { isPlaying, selectedMenu } = useContext(MorseContext);
  const { playMorse, stopMorse } = useMorseAudio();

  useEffect(() => {
    stopMorse();
  }, [selectedMenu]);

  let letterSize = "sm";

  if (word.length < 2) {
    letterSize = "lg";
  } else if (word.length < 30) {
    letterSize = "md";
  }

  return (
    <div className={`word word--size-${letterSize}`}>
      {word.length > 0 &&
        word.split("").map((letter, i) => {
          const thisStatus = status ? status[i] : "neutral";

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
                `letter--${thisStatus ?? "none"}`,
                status && i === index && "letter--current beep-glow",
              )}
              onClick={() => {
                if (status && i !== index) return;

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
