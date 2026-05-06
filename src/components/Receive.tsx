import React, { useContext, useEffect, useState } from "react";
import { Keyboard } from "./Keyboard";
import "./Receive.scss";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import { alphaToMorse } from "../data/alphaToMorse";
import { initCode, useAudio } from "../hooks/useAudio";
import { MorseContext, Setting } from "../context/MorseContext";
import { StopIcon } from "../icons/StopIcon";
import clsx from "clsx";
import { ReceiveSources } from "../data/DataSources";
import { clamp } from "../utils/utils";
import { ProgressBar, useQuiz } from "../hooks/useQuiz";
import { Word } from "./Word";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const Receive = () => {
  const { settings, isPlaying, selectedMenu } = useContext(MorseContext);
  const { playMorse, stopMorse } = useAudio();

  const {
    setPhase,
    stats,
    setGuess,
    word,
    letterIndex,
    setQuizSource,
    phase,
    guess,
  } = useQuiz();

  const [receiveSource, setReceiveSource] = useLocalStorage<ReceiveSources>(
    "receiveSource",
    ReceiveSources.Words,
  );

  useEffect(() => {
    setQuizSource(receiveSource);
  }, [receiveSource]);

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
      <div className="quiz__menu">
        <div className="button-menu">
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
      </div>

      <div className="quiz__content">
        {phase === "guess" && (
          <>
            {settings[Setting.ShowStats] && (
              <div className="quiz__content__progress-stats">
                <ProgressBar
                  title="Progress"
                  progress={(stats.charsDone / stats.charsTotal) * 100}
                />
                <ProgressBar
                  title={`Acc.${Math.round(stats.accuracy)}%`}
                  progress={stats.accuracy}
                  useStatusColor
                />
                <ProgressBar
                  title={`${Math.round(stats.wpm)} WPM`}
                  progress={clamp((stats.wpm / 30) * 100, 0, 30)}
                />
              </div>
            )}

            {phase === "guess" && (
              <div className="quiz__content__word">
                <Word guess={guess} word={word} letterIndex={letterIndex} />
              </div>
            )}

            <div className="quiz__content__action-buttons">
              <button
                className={clsx(
                  "btn btn--outlined",
                  wordBtnIsStop() && "btn--outlined-stop",
                )}
                onClick={playPauseWord}
                disabled={letterBtnIsStop()}
              >
                {wordBtnIsStop() ? <StopIcon /> : <SpeakerIcon />}
                <span>{wordBtnIsStop() ? "Stop" : "Word"}</span>
              </button>

              <button
                className={clsx(
                  "btn btn--outlined",
                  letterBtnIsStop() && "btn--outlined-stop",
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

        {phase === "standby" && (
          <span className="quiz-instructions">
            Send each character in morse code.
          </span>
        )}

        {phase === "stats" && (
          <>
            <div className="quiz-done-stats">
              <div>
                <span>{Math.round(stats.accuracy)}%</span>
                <span>Accuracy</span>
              </div>

              <div>
                <span>{stats.incorrect}</span>
                <span>Mistake{stats.incorrect === 1 ? "" : "s"}</span>
              </div>

              <div>
                <span>{Math.round(stats.wpm)}</span>
                <span>WPM</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="quiz__bottom">
        {["standby", "stats"].includes(phase) && (
          <button
            className="btn btn--large-orange"
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
