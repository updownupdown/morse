import "./css/styles.scss";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  Menus,
  Modes,
  MorseContext,
  defaultSettings,
} from "./context/MorseContext";
import { Header } from "./components/Header";
import { Settings } from "./components/Settings";
import { Menu } from "./components/Menu";
import { Dictionary } from "./components/Dictionary";
import { Decode } from "./components/Decode";
import { Translate } from "./components/Translate";
import { Simulator } from "./components/Simulator";
import { Encode } from "./components/Encode";
import { useState } from "react";
import { Home } from "./components/Home";

function App() {
  const [lastSelectedMode, setLastSelectedMode] = useLocalStorage(
    "lastMode",
    Modes.Home,
  );
  const [selectedMode, setSelectedMode] = useState(Modes.Home);
  const [settings, setSettings] = useLocalStorage("settings", defaultSettings);

  const [selectedMenu, setSelectedMenu] = useState(Menus.None);
  const [isPlayingTone, setIsPlayingTone] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);

  return (
    <MorseContext.Provider
      value={{
        settings,
        setSettings,
        selectedMenu,
        setSelectedMenu,
        selectedMode,
        setSelectedMode,
        lastSelectedMode,
        setLastSelectedMode,
        isPlayingTone,
        setIsPlayingTone,
        audioInitialized,
        setAudioInitialized,
      }}
    >
      <div
        className={`app app--mode-${selectedMode.replace(/[^a-zA-Z]/g, "").toLowerCase()} app--diff-${settings.difficulty.toLowerCase()}`}
      >
        {selectedMenu === Menus.Menu && <Menu />}
        {selectedMenu === Menus.Settings && <Settings />}

        {selectedMode !== Modes.Home && <Header />}

        <div className="main">
          <div className="main__content">
            {!audioInitialized && <Home />}
            {audioInitialized && selectedMenu === Menus.None && (
              <>
                {selectedMode === Modes.Home && <Home />}
                {selectedMode === Modes.Encode && <Encode />}
                {selectedMode === Modes.Decode && <Decode />}
                {selectedMode === Modes.Dictionary && <Dictionary />}
                {selectedMode === Modes.Translate && <Translate />}
                {selectedMode === Modes.Simulator && <Simulator />}
              </>
            )}
          </div>
        </div>
      </div>
    </MorseContext.Provider>
  );
}

export default App;
