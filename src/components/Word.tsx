import React, { useContext } from "react";
import clsx from "clsx";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { alphaToMorse } from "../data";
import "./Word.scss";
import { MorseContext } from "../context/MorseContext";

export type Status = "empty" | "correct" | "incorrect" | "guess" | "neutral";

interface MorseCharProps {
  morse: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const inProgressChar = "in-progress";

export const MorseChar = ({ morse, size }: MorseCharProps) => {
  const { settings } = useContext(MorseContext);
  const morseSplit = morse.split("");
  const inProgress = morse === inProgressChar;

  return (
    <div className={`morse-char morse-char--${size}`}>
      {inProgress ? (
        <span
          className={`dit-dah dit-dah--in-progress`}
          style={{ animationDuration: `${settings.unitTime * 3}ms` }}
        />
      ) : (
        morseSplit.map((char, index) => (
          <span
            key={index}
            className={`dit-dah dit-dah--${char === " " ? "space" : char === "." ? "dit" : "dah"}`}
          />
        ))
      )}
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
  const { isPlayingTone } = useContext(MorseContext);
  const { playMorse } = useMorseAudio();

  return (
    <div className="word">
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
                playMorse(alphaToMorse[letter.toUpperCase()]);

                if (setIndex && thisStatus !== "correct") {
                  setIndex(i);
                }
              }}
              disabled={isPlayingTone}
            >
              <div className="letter__value">{word[i]}</div>
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
