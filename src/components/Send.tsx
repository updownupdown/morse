import { useContext } from "react";
import "./Send.scss";
import { MorseKeys } from "./MorseKeys";
import { SendSources } from "../data/DataSources";
import { MorseContext, Setting } from "../context/MorseContext";
import { clamp } from "../utils/utils";
import { initCode, useAudio } from "../hooks/useAudio";
import { ProgressBar, useQuiz } from "../hooks/useQuiz";
import { Word } from "./Word";
import { alphaToMorse } from "../data/alphaToMorse";

export const Send = () => {
  const { settings } = useContext(MorseContext);
  const { playMorse, stopMorse } = useAudio();

  const {
    setPhase,
    stats,
    setGuess,
    source,
    setSource,
    phase,
    word,
    letterIndex,
    guess,
  } = useQuiz();

  return (
    <div className="send">
      <div className="button-menu">
        {Object.entries(SendSources).map(([key, val]) => {
          return (
            <button
              key={key}
              className={`btn-menu-item btn-menu-item--${source === val ? "selected" : "not-selected"}`}
              onClick={() => {
                stopMorse();
                setSource(val as SendSources);
              }}
            >
              {val}
            </button>
          );
        })}
      </div>

      {settings[Setting.ShowStats] && phase === "guess" && (
        <div className="quiz-progress-stats">
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

      {phase === "guess" && (
        <div className="send__word">
          <Word guess={guess} word={word} letterIndex={letterIndex} />
        </div>
      )}

      <MorseKeys
        hint={
          phase === "guess" && word !== undefined && letterIndex !== undefined
            ? alphaToMorse(word.charAt(letterIndex).toUpperCase())
            : undefined
        }
        setGuess={setGuess}
      />

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
    </div>
  );
};
