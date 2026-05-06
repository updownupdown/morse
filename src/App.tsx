import "./css/styles.scss";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  Menus,
  Modes,
  MorseContext,
  defaultSettings,
  Setting,
  IsPlaying,
} from "./context/MorseContext";
import { Header } from "./components/Header";
import { SettingsModal } from "./components/SettingsModal";
import { Menu } from "./components/Menu";
import { Learn } from "./components/Learn";
import { Receive } from "./components/Receive";
import { Translate } from "./components/Translate";
import { Practice } from "./components/Practice";
import { Send } from "./components/Send";
import { useState } from "react";
import { Home } from "./components/Home";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { InfoModal } from "./components/InfoModal";

function App() {
  const [lastSelectedMode, setLastSelectedMode] = useLocalStorage(
    "lastSelectedMode",
    Modes.Home,
  );
  const [selectedMode, setSelectedMode] = useLocalStorage(
    "selectedMode",
    Modes.Home,
  );
  const [settings, setSettings] = useLocalStorage(
    "settingsv4",
    defaultSettings,
  );

  const [selectedMenu, setSelectedMenu] = useState(Menus.None);
  const [isPlaying, setIsPlaying] = useState<IsPlaying>(undefined);
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
        isPlaying,
        setIsPlaying,
        audioInitialized,
        setAudioInitialized,
      }}
    >
      <div
        className={`app app--mode-${selectedMode.replace(/[^a-zA-Z]/g, "").toLowerCase()} app--hints-${settings[Setting.Hints].toLowerCase()}`}
      >
        {selectedMenu === Menus.Menu && <Menu />}
        {selectedMenu === Menus.Settings && <SettingsModal />}
        {selectedMenu === Menus.Shortcuts && <KeyboardShortcuts />}
        {selectedMenu === Menus.Info && <InfoModal />}

        {selectedMode !== Modes.Home && <Header />}

        <div className="main">
          <div className="main__content">
            {selectedMode === Modes.Home && <Home />}
            {selectedMode === Modes.Send && <Send />}
            {selectedMode === Modes.Receive && <Receive />}
            {selectedMode === Modes.Learn && <Learn />}
            {selectedMode === Modes.Translate && <Translate />}
            {selectedMode === Modes.Practice && <Practice />}
          </div>
        </div>
      </div>
    </MorseContext.Provider>
  );
}

export default App;
