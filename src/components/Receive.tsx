import { useContext, useEffect, useState } from "react";
import { Keyboard } from "./Keyboard";
import "./Receive.scss";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import { alphaToMorse } from "../data/alphaToMorse";
import { initCode, useAudio } from "../hooks/useAudio";
import { MorseContext } from "../context/MorseContext";
import { StopIcon } from "../icons/StopIcon";
import clsx from "clsx";
import {
  defaultReceiveSourceQty,
  maxReceiveSourceQty,
  ReceiveSources,
} from "../data/DataSources";
import { useQuiz } from "../hooks/useQuiz";
import { Word } from "./Word";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { MinusIcon } from "../icons/MinusIcon";
import { conditionalPluralize } from "../utils/utils";
import { PlusIcon } from "../icons/PlusIcon";

export const Receive = () => {
  const {
    isPlaying,
    selectedMenu,
    setPhase,
    phase,
    setQuizSource,
    quizQty,
    setQuizQty,
  } = useContext(MorseContext);

  const { playMorse, stopMorse } = useAudio();

  const { stats, setGuess, word, letterIndex, guess } = useQuiz();

  const [receiveSource, setReceiveSource] = useLocalStorage<ReceiveSources>(
    "receiveSource",
    ReceiveSources.Words,
  );

  const [receiveSourceQuantities, setReceiveSourceQuantities] = useLocalStorage<
    Record<ReceiveSources, number>
  >("receiveSourceQty", defaultReceiveSourceQty);

  useEffect(() => {
    setQuizSource(receiveSource);
    setQuizQty(receiveSourceQuantities[receiveSource]);
  }, [receiveSource]);

  useEffect(() => {
    setReceiveSourceQuantities({
      ...receiveSourceQuantities,
      [receiveSource]: quizQty,
    });
  }, [quizQty]);

  const [lastPlayBtnPressed, setLastPlayBtnPressed] = useState<
    "word" | "letter"
  >("letter");

  const wordBtnIsStop = () => isPlaying && lastPlayBtnPressed === "word";
  const letterBtnIsStop = () => isPlaying && lastPlayBtnPressed === "letter";

  function playPauseWord() {
    if (word === undefined) return;

    setLastPlayBtnPressed("word");

    if (wordBtnIsStop()) {
      stopMorse();
    } else {
      playMorse(alphaToMorse(word));
    }
  }

  useEffect(() => {
    if (isPlaying) {
      stopMorse();
    }
  }, [selectedMenu]);

  function playPauseLetter() {
    if (word === undefined || letterIndex === undefined) return;

    setLastPlayBtnPressed("letter");

    if (letterBtnIsStop()) {
      stopMorse();
    } else {
      playMorse(alphaToMorse(word[letterIndex]));
    }
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey || e.repeat) return;

      if (e.key === " " && !letterBtnIsStop()) {
        playPauseWord();
        e.preventDefault();
      } else if (e.code === "ArrowRight" && !wordBtnIsStop()) {
        playPauseLetter();
        e.preventDefault();
      } else if (/^[a-z]$/i.test(e.key)) {
        setGuess(e.key.toUpperCase());
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [stats]);

  return (
    <div className="quiz quiz--receive">
      <div className="quiz__content">
        {["standby", "stats"].includes(phase) && quizQty && (
          <>
            <div className="button-menu button-menu--vertical">
              {Object.entries(ReceiveSources).map(([key, val]) => {
                return (
                  <button
                    key={key}
                    className={`btn-menu-item btn-menu-item--${receiveSource === val ? "selected" : "not-selected"}`}
                    onClick={() => {
                      stopMorse();
                      setPhase("standby");
                      setReceiveSource(val as ReceiveSources);
                    }}
                  >
                    {val}
                  </button>
                );
              })}
            </div>

            <span className="quiz__content__qty">
              <button
                className="btn btn--outlined"
                onClick={() => {
                  if (quizQty) {
                    setQuizQty(quizQty - 1);
                  }
                }}
                disabled={quizQty === 1}
              >
                <MinusIcon />
              </button>

              <div className="quiz__content__qty__desc">
                <span>{quizQty}</span>
                <span>{conditionalPluralize(receiveSource, quizQty)}</span>
              </div>
              <button
                className="btn btn--outlined"
                onClick={() => {
                  if (quizQty) {
                    setQuizQty(quizQty + 1);
                  }
                }}
                disabled={quizQty === maxReceiveSourceQty[receiveSource]}
              >
                <PlusIcon />
              </button>
            </span>
          </>
        )}

        {phase === "guess" && (
          <>
            <div className="quiz__content__word">
              <Word guess={guess} word={word} letterIndex={letterIndex} />
            </div>

            <div className="quiz__content__action-buttons">
              <button
                className={clsx(
                  "btn btn--flex btn--outlined",
                  wordBtnIsStop() && "btn--stop",
                )}
                onClick={playPauseWord}
                disabled={letterBtnIsStop()}
              >
                {wordBtnIsStop() ? <StopIcon /> : <SpeakerIcon />}
                <span>{wordBtnIsStop() ? "Stop" : "Word"}</span>
              </button>

              <button
                className={clsx(
                  "btn btn--flex btn--outlined",
                  letterBtnIsStop() && "btn--stop",
                )}
                onClick={playPauseLetter}
                disabled={wordBtnIsStop()}
              >
                {letterBtnIsStop() ? <StopIcon /> : <SpeakerIcon />}
                <span>Letter</span>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="quiz__bottom">
        {["standby", "stats"].includes(phase) && (
          <button
            className="btn btn--large"
            onClick={() => {
              playMorse(initCode);
              setPhase("prepare");
            }}
          >
            <span>Start</span>
          </button>
        )}

        {phase === "guess" && (
          <Keyboard
            setGuess={setGuess}
            isSpecialChars={receiveSource === ReceiveSources.SpecialChars}
          />
        )}
      </div>
    </div>
  );
};
