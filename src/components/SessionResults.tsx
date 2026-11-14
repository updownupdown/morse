import { useContext } from "react";
import "./SessionResults.scss";
import { MorseContext } from "../context/MorseContext";
import { alphaToMorse } from "../data/alphaToMorse";

// The score from the session just finished, above its setup
export const SessionResults = () => {
  const { stats, phase } = useContext(MorseContext);

  if (phase !== "stats" || !stats) return null;

  const accuracy = Math.round(stats.accuracy);
  const radius = 26;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="session-results" aria-live="polite">
      <div className="session-results__ring">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r={radius} />
          <circle
            cx="32"
            cy="32"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - accuracy / 100)}
          />
        </svg>
        <span>{accuracy}%</span>
      </div>

      <div className="session-results__text">
        <span>Session complete</span>
        <div className="session-results__figures">
          <div>
            <b>{Math.round(stats.wpm)}</b>
            <small>WPM</small>
          </div>
          <div>
            <b>{stats.incorrect}</b>
            <small>mistake{stats.incorrect === 1 ? "" : "s"}</small>
          </div>
          <div>
            <b>{stats.correct}</b>
            <small>correct</small>
          </div>
        </div>
      </div>
    </div>
  );
};

// Live readouts while a session runs
export const SessionMeters = () => {
  const { stats } = useContext(MorseContext);
  const s = stats;

  return (
    <div className="session-meters" aria-live="off">
      <div>
        <b>{s ? Math.round(s.wpm) : 0}</b>
        <small>WPM</small>
      </div>
      <div>
        <b>{s && s.correct + s.incorrect > 0 ? Math.round(s.accuracy) : "–"}</b>
        <small>accuracy %</small>
      </div>
      <div>
        <b>{s ? s.charsDone : 0}</b>
        <small>characters</small>
      </div>
    </div>
  );
};

// Shown once Auto practice brings in a new character
export const UnlockedNotice = ({ char }: { char?: string }) => {
  if (!char) return null;

  return (
    <div className="unlocked-notice" role="status">
      <span className="unlocked-notice__led" aria-hidden="true" />
      <span>
        New character: <b>{char}</b>
      </span>
      <span className="unlocked-notice__code">
        {alphaToMorse(char).replace(/\./g, "·").replace(/-/g, "–")}
      </span>
    </div>
  );
};
