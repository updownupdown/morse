import React, { useContext } from "react";
import clsx from "clsx";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { alphaToMorse } from "../data/alphaToMorse";
import "./Word.scss";
import { MorseContext } from "../context/MorseContext";

export type Status = "empty" | "correct" | "incorrect" | "neutral" | "space";

interface Props {
  word: string;
  index?: number;
  setIndex?: (i: number) => void;
  status?: Status[];
}

export const Word = ({ word, status, index, setIndex }: Props) => {
  const { isPlayingTone } = useContext(MorseContext);
  const { playMorse } = useMorseAudio();

  let letterSize = word.length > 30 ? "sm" : word.length > 2 ? "md" : "lg";

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
                status && i === index && "letter--current",
              )}
              onClick={() => {
                playMorse(alphaToMorse(letter));

                if (setIndex && thisStatus !== "correct") {
                  setIndex(i);
                }
              }}
              disabled={isPlayingTone}
            >
              <span>{word[i]}</span>
            </button>
          );
        })}
    </div>
  );
};
