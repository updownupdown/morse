import { useState } from "react";
import clsx from "clsx";
import { alphaToMorse } from "../data/alphaToMorse";
import { MorseKeys } from "../components/MorseKeys";
import { MorseChar } from "../components/MorseChar";
import { useProgress } from "../context/ProgressContext";
import { shuffle } from "../data/DataSources";
import { GameStats, Slots, Stars, starsFor, Stat, useFlash } from "./common";
import { GameProps } from "./types";
import { riddles, trivia } from "./quizData";

const perRound = 5;

export const Trivia = ({ level, onEnd }: GameProps) => {
  const { record } = useProgress();
  const [flash, triggerFlash] = useFlash();

  const [questions] = useState(() =>
    shuffle(level === "riddles" ? riddles : trivia).slice(0, perRound),
  );
  const [index, setIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [slips, setSlips] = useState(0);
  const [reveals, setReveals] = useState(0);
  const [stars, setStars] = useState(0);
  // Stars won for this question once it's answered; 0 if given up
  const [earned, setEarned] = useState<number | undefined>(undefined);
  // Whether the next letter's code is on show
  const [showCode, setShowCode] = useState(false);

  const question = questions[index];
  const answer = question.a;
  const answered = earned !== undefined;

  function finish(won: number) {
    setEarned(won);
    setStars(stars + won);
    setLetterIndex(answer.length);
    setShowCode(false);
  }

  function onChar(char: string) {
    if (answered) return;
    const expected = answer[letterIndex];

    if (char !== expected) {
      setSlips(slips + 1);
      triggerFlash("bad");
      return;
    }

    record("send", expected, !showCode);
    setShowCode(false);

    if (letterIndex + 1 === answer.length) {
      triggerFlash("good");
      finish(starsFor(slips + reveals * 2));
    } else {
      setLetterIndex(letterIndex + 1);
    }
  }

  function next() {
    if (index + 1 === questions.length) {
      onEnd({ score: stars, summary: `out of ${perRound * 3}` });
      return;
    }
    setIndex(index + 1);
    setLetterIndex(0);
    setSlips(0);
    setReveals(0);
    setEarned(undefined);
    setShowCode(false);
  }

  return (
    <div className="game game--trivia">
      <GameStats
        left={
          <Stat label="Question" value={`${index + 1}/${questions.length}`} />
        }
        centre={<Stat label="Stars" value={stars} />}
        right={<Stat label="Slips" value={slips} />}
      />

      <div className="game__stage">
        <p className="trivia-question">{question.q}</p>

        <div className={clsx("game-card", flash && `game-card--${flash}`)}>
          <Slots
            word={answer}
            shown={(i) => i < letterIndex}
            current={answered ? undefined : letterIndex}
          />
        </div>

        {answered ? (
          <>
            {earned > 0 ? (
              <Stars count={earned} />
            ) : (
              <p className="game__prompt">No stars this time</p>
            )}
            <button className="btn btn--large" onClick={next}>
              <span>
                {index + 1 === questions.length ? "Finish" : "Next question"}
              </span>
            </button>
          </>
        ) : showCode ? (
          <div className="trivia-code">
            <span>Next letter: {answer[letterIndex]}</span>
            <MorseChar morse={alphaToMorse(answer[letterIndex])} size="md" />
          </div>
        ) : (
          <p className="game__prompt">Key the answer, letter by letter</p>
        )}
      </div>

      <div className="game__bottom">
        {!answered && (
          <div className="game__actions">
            <button
              className="btn btn--outlined"
              onClick={() => {
                setReveals(reveals + 1);
                setShowCode(true);
              }}
              disabled={showCode}
            >
              <span>Show a letter</span>
            </button>
            <button className="btn btn--outlined" onClick={() => finish(0)}>
              <span>Give up</span>
            </button>
          </div>
        )}
        <MorseKeys setGuess={onChar} onInvalid={() => triggerFlash("bad")} />
      </div>
    </div>
  );
};
