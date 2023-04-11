import { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";
import "./Settings.scss";

export const Settings = () => {
  const {
    wordsPerMin,
    setWordsPerMin,
    addWordBreaks,
    setAddWordBreaks,
    shortDashDuration,
    setShortDashDuration,
  } = useContext(SettingsContext);

  return (
    <div className="settings">
      <div className="setting">
        <input
          type="checkbox"
          checked={addWordBreaks}
          onChange={() => {
            setAddWordBreaks(!addWordBreaks);
          }}
        />
        <label>Auto word breaks</label>
      </div>
      <div className="setting">
        <label>Dot duration</label>
        <input
          type="number"
          min="10"
          max="1000"
          value={shortDashDuration}
          onChange={(e) => setShortDashDuration(Number(e.target.value))}
        />
        <div className="unit">ms</div>
      </div>
      <div className="setting">
        <label>Speed</label>
        <input
          type="number"
          min="10"
          max="1000"
          value={wordsPerMin}
          onChange={(e) => setWordsPerMin(Number(e.target.value))}
        />
        <div className="unit">wpm</div>
      </div>
    </div>
  );
};
