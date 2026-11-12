import { useContext, useEffect } from "react";
import { TabBar } from "./TabBar";
import { SettingsIcon } from "../icons/SettingsIcon";
import "./Header.scss";
import { Menus, Modes, MorseContext } from "../context/MorseContext";
import { StopIcon } from "../icons/StopIcon";
import clsx from "clsx";
import { useAudioContext } from "../context/AudioContext";
import { initCode } from "../hooks/useAudio";

export const Header = () => {
  const {
    setSelectedMenu,
    selectedMode,
    selectedMenu,
    quizSource,
    phase,
    setPhase,
    stats,
    sessionLabel,
  } = useContext(MorseContext);

  const { playMorse, stopMorse } = useAudioContext();

  const label = sessionLabel ?? [
    selectedMode === Modes.Send ? "Sending" : "Receiving",
    quizSource ?? "",
  ];

  useEffect(() => {
    if (selectedMenu !== undefined) {
      stopMorse();
    }
  }, [selectedMenu]);

  return (
    <div className="header">
      {/* Balances the settings button, so the title stays centred */}
      <div className="header-spacer" />

      <h1 className="header-title">
        {selectedMode === Modes.Home ? (
          <>
            Morse<b>Play</b>
          </>
        ) : (
          selectedMode
        )}
      </h1>

      <TabBar placement="top" />

      <button
        className="header-btn"
        aria-label="Settings"
        onClick={() => {
          playMorse(initCode);
          setSelectedMenu(Menus.Settings);
        }}
      >
        <SettingsIcon />
      </button>

      {/* Stats (progress) */}
      <div
        className={clsx(
          "quiz-stats",
          (phase === "guess" || phase === "practice") && "quiz-stats--visible",
        )}
      >
        <>
          {stats && (
            <>
              <div className="quiz-progress-text">
                <span>{label[0]}</span>
                <span>{label[1]}</span>
              </div>
              <div
                className="quiz-stats-progress"
                style={{
                  width: `${phase === "guess" && stats.charsTotal > 0 ? Math.min(stats.charsDone / stats.charsTotal, 1) * 100 : 0}%`,
                }}
              />

              <button
                className="btn btn--outlined"
                onClick={() => {
                  setPhase("standby");
                }}
              >
                <StopIcon />
                <span>Stop</span>
              </button>
            </>
          )}

          {phase === "practice" && (
            <>
              <div className="quiz-progress-text">
                <span>{label[0]}</span>
                <span>{label[1]}</span>
              </div>

              <button
                className="btn btn--outlined"
                onClick={() => {
                  setPhase("standby");
                }}
              >
                <StopIcon />
                <span>Stop</span>
              </button>
            </>
          )}
        </>
      </div>

      {/* Stats (results) */}
      {stats && (
        <div
          className={clsx(
            "quiz-stats",
            phase === "stats" && "quiz-stats--visible",
          )}
        >
          <div className="quiz-stats-results">
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
        </div>
      )}
    </div>
  );
};
