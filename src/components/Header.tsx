import { useContext } from "react";
import { MenuIcon } from "../icons/MenuIcon";
import { SettingsIcon } from "../icons/SettingsIcon";
import "./Header.scss";
import { Menus, Modes, MorseContext } from "../context/MorseContext";
import { StopIcon } from "../icons/StopIcon";
import clsx from "clsx";

export const Header = () => {
  const { setSelectedMenu, selectedMode, quizSource, phase, setPhase, stats } =
    useContext(MorseContext);

  return (
    <div className="header">
      <button
        className="header-btn"
        onClick={() => setSelectedMenu(Menus.Menu)}
      >
        <MenuIcon />
      </button>

      <span>{selectedMode}</span>

      <button
        className="header-btn"
        onClick={() => setSelectedMenu(Menus.Settings)}
      >
        <SettingsIcon />
      </button>

      {/* Stats (progress) */}
      {stats && (
        <div
          className={clsx(
            "quiz-stats",
            phase === "guess" && "quiz-stats--visible",
          )}
        >
          <div className="quiz-progress-text">
            <span>{selectedMode === Modes.Send ? "Sending" : "Receiving"}</span>
            <span>{quizSource}</span>
          </div>
          <div
            className="quiz-stats-progress"
            style={{
              width: `${(stats.charsDone / stats.charsTotal) * 100}%`,
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
        </div>
      )}

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
