import { useState } from "react";
import clsx from "clsx";
import { words } from "../data/words";
import { letters } from "../data/chars";
import { MorseKeys } from "../components/MorseKeys";
import { pick, useFlash, useTyping } from "./common";
import { GameProps } from "./types";
import { letterMarks, markGuess } from "./mordle";
import { BackspaceIcon } from "../icons/BackspaceIcon";
import { ReturnIcon } from "../icons/ReturnIcon";

const tries = 6;

export const Mordle = ({ level, onEnd }: GameProps) => {
  const length = level === "4" ? 4 : 5;

  const [answer] = useState(() =>
    pick(words.filter((w) => w.length === length)).toUpperCase(),
  );
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [finished, setFinished] = useState(false);
  const [flash, triggerFlash] = useFlash();

  const marks = letterMarks(guesses, answer);

  function onChar(char: string) {
    if (finished) return;
    if (!/^[A-Z]$/.test(char) || current.length === length) {
      triggerFlash("bad");
      return;
    }
    setCurrent(current + char);
  }

  function backspace() {
    if (!finished) setCurrent(current.slice(0, -1));
  }

  function submit() {
    if (finished) return;
    if (current.length < length) {
      triggerFlash("bad");
      return;
    }

    const next = [...guesses, current];
    setGuesses(next);
    setCurrent("");

    const won = current === answer;
    if (!won && next.length < tries) return;

    setFinished(true);
    // A moment to see the last row before the result
    window.setTimeout(
      () =>
        onEnd(
          won
            ? { score: next.length, summary: `The word was ${answer}` }
            : { score: 0, lost: answer, summary: "That was the word" },
        ),
      1400,
    );
  }

  useTyping(() => {}, { Backspace: backspace, Enter: submit });

  return (
    <div className="game game--mordle">
      <div className="game__stage">
        <div
          className={clsx("mordle-grid", flash === "bad" && "mordle-grid--bad")}
        >
          {Array.from({ length: tries }, (_, row) => {
            const guess = guesses[row];
            const rowMarks = guess ? markGuess(guess, answer) : undefined;
            const text = guess ?? (row === guesses.length ? current : "");

            return (
              <div className="mordle-row" key={row}>
                {Array.from({ length }, (_, i) => (
                  <span
                    key={i}
                    className={clsx(
                      "mordle-cell",
                      rowMarks && `mordle-cell--${rowMarks[i]}`,
                      !rowMarks &&
                        row === guesses.length &&
                        i === current.length &&
                        !finished &&
                        "mordle-cell--next",
                    )}
                  >
                    {text[i] ?? ""}
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        <div className="mordle-letters" aria-label="Letters tried">
          {letters.map((letter) => (
            <span
              key={letter}
              className={clsx(marks[letter] && `mordle-cell--${marks[letter]}`)}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      <div className="game__bottom">
        <div className="game__actions">
          <button
            className="btn btn--outlined"
            onClick={backspace}
            disabled={current.length === 0 || finished}
          >
            <BackspaceIcon />
            <span>Delete</span>
          </button>
          <button
            className="btn btn--outlined"
            onClick={submit}
            disabled={current.length < length || finished}
          >
            <ReturnIcon />
            <span>Guess</span>
          </button>
        </div>
        <MorseKeys setGuess={onChar} onInvalid={() => triggerFlash("bad")} />
      </div>
    </div>
  );
};
