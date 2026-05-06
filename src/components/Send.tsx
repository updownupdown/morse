import { useContext, useEffect } from "react";
import "./Send.scss";
import { MorseKeys } from "./MorseKeys";
import { SendSources } from "../data/DataSources";
import { MorseContext, Setting } from "../context/MorseContext";
import { clamp } from "../utils/utils";
import { initCode, useAudio } from "../hooks/useAudio";
import { ProgressBar, useQuiz } from "../hooks/useQuiz";
import { Word } from "./Word";
import { alphaToMorse } from "../data/alphaToMorse";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const Send = () => {
  const { settings } = useContext(MorseContext);
  const { playMorse, stopMorse } = useAudio();

  const {
    setPhase,
    stats,
    setGuess,
    setQuizSource,
    phase,
    word,
    letterIndex,
    guess,
  } = useQuiz();

  const [sendSource, setSendSource] = useLocalStorage<SendSources>(
    "sendSource",
    SendSources.Words,
  );

  useEffect(() => {
    setQuizSource(sendSource);
  }, [sendSource]);

  return (
    <div className="quiz quiz--send">
      <div className="quiz__menu">
        <div className="button-menu">
          {Object.entries(SendSources).map(([key, val]) => {
            return (
              <button
                key={key}
                className={`btn-menu-item btn-menu-item--${sendSource === val ? "selected" : "not-selected"}`}
                onClick={() => {
                  stopMorse();
                  setPhase("standby");
                  setSendSource(val as SendSources);
                }}
              >
                {val}
              </button>
            );
          })}
        </div>
      </div>

      <div className="quiz__content">
        {settings[Setting.ShowStats] && phase === "guess" && (
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
          <div className="quiz__content__word">
            <Word guess={guess} word={word} letterIndex={letterIndex} />
          </div>
        )}
      </div>

      <div className="quiz__bottom">
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
    </div>
  );
};
