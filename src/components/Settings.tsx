import { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";
import "./Settings.scss";

export const Settings = () => {
  const { wordsPerMin, setWordsPerMin, addWordBreaks, setAddWordBreaks } =
    useContext(SettingsContext);

  return (
    <div className="timing">
      <div>
        <input
          type="checkbox"
          checked={addWordBreaks}
          onChange={() => {
            setAddWordBreaks(!addWordBreaks);
          }}
        />
        <label>Add Word Breaks</label>
      </div>
      <div>
        <label>Word per min</label>
        <input
          type="number"
          min="10"
          max="1000"
          value={wordsPerMin}
          onChange={(e) => setWordsPerMin(Number(e.target.value))}
        />
      </div>
    </div>
  );
};
