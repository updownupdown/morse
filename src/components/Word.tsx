import React from "react";
import clsx from "clsx";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { alphaToMorse } from "../data";
import "./Word.scss";

export type Status = "empty" | "correct" | "incorrect" | "guess" | "neutral";

interface MorseCharProps {
  morse: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const MorseChar = ({ morse, size }: MorseCharProps) => {
  const morseSplit = morse.split("");

  return (
    <div className={`morse-char morse-char--${size}`}>
      {morseSplit.map((char, index) => (
        <span
          key={index}
          className={`dit-dah dit-dah--${char === " " ? "space" : char === "." ? "dit" : "dah"}`}
        />
      ))}
    </div>
  );
};

interface Props {
  word: string;
  index?: number;
  setIndex?: (i: number) => void;
  guess?: string[];
  status?: Status[];
}

export const Word = ({ word, status, guess, index, setIndex }: Props) => {
  const { playMorse, isPlaying } = useMorseAudio();

  return (
    <div className="word">
      {word.length > 0 &&
        word.split("").map((letter, i) => {
          const thisStatus = status ? status[i] : "neutral";
          const thisGuess = guess && guess[i];

          let showChar = word[i];

          if (status && thisGuess) {
            showChar =
              thisStatus !== "empty" ? thisGuess : i === index ? "?" : "-";
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
                `letter--${thisStatus}`,
                status && i === index && "letter--current",
              )}
              onClick={() => {
                playMorse(alphaToMorse[letter.toUpperCase()]);

                if (setIndex && thisStatus && thisStatus !== "correct") {
                  setIndex(i);
                }
              }}
              disabled={isPlaying}
            >
              <div className="letter__value">{showChar}</div>
              <div className="letter__morse">
                <MorseChar
                  morse={alphaToMorse[letter.toUpperCase()]}
                  size="md"
                />
              </div>
            </button>
          );
        })}
    </div>
  );
};
