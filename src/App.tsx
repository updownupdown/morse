import "./css/styles.scss";
import { Dictionary } from "./components/Dictionary";
import { Telegraph } from "./components/Telegraph";
import { Converter } from "./components/Converter";
import clsx from "clsx";
import { Receive } from "./components/Receive";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { Settings } from "./components/Settings";
import { SettingsContext, defaultSettings } from "./context/SettingsContext";
import paperTexture from "./images/paper-texture.jpg";

const Tabs = {
  Send: "Send",
  Receive: "Receive",
  Convert: "Convert",
  Study: "Study",
};

function App() {
  const [selectedTab, setSelectedTab] = useLocalStorage("tab", Tabs.Send);
  const [wordsPerMin, setWordsPerMin] = useLocalStorage(
    "wordsPerMin",
    defaultSettings.wordsPerMin
  );
  const [shortDashDuration, setShortDashDuration] = useLocalStorage(
    "shortDashDuration",
    defaultSettings.shortDashDuration
  );
  const [addWordBreaks, setAddWordBreaks] = useLocalStorage(
    "addWordBreaks",
    defaultSettings.addWordBreaks
  );

  return (
    <SettingsContext.Provider
      value={{
        wordsPerMin,
        setWordsPerMin,
        addWordBreaks,
        setAddWordBreaks,
        shortDashDuration,
        setShortDashDuration,
      }}
    >
      <div
        className="main"
        style={{
          backgroundImage: `url(${paperTexture})`,
        }}
      >
        <div className="main__content">
          <div className="tabs">
            {Object.values(Tabs).map((tab) => (
              <button
                key={tab}
                className={clsx("tab", selectedTab === tab && "tab--selected")}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {(selectedTab === Tabs.Send || selectedTab === Tabs.Receive) && (
            <Settings />
          )}

          <div className="main__content__middle">
            {selectedTab === Tabs.Send && <Telegraph />}
            {selectedTab === Tabs.Receive && <Receive />}
            {selectedTab === Tabs.Convert && <Converter />}
            {selectedTab === Tabs.Study && <Dictionary />}
          </div>
        </div>
      </div>
    </SettingsContext.Provider>
  );
}

export default App;
