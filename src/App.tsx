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
import { useEffect, useState } from "react";
import { Home } from "./components/Home";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { InfoModal } from "./components/InfoModal";
import { ThemeModal } from "./components/ThemeModal";
import {
  defaultStats,
  ReceiveSources,
  SendSources,
  Stats,
} from "./data/DataSources";
import { Phase } from "./hooks/useQuiz";

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

  const [quizSource, setQuizSource] = useState<
    SendSources | ReceiveSources | undefined
  >(undefined);
  const [quizQty, setQuizQty] = useState<number | undefined>(undefined);
  const [stats, setStats] = useState<Stats | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>("standby");

  // Reset stats on mode change
  useEffect(() => {
    setStats(undefined);
  }, [selectedMode]);

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
        quizSource,
        setQuizSource,
        quizQty,
        setQuizQty,
        stats,
        setStats,
        phase,
        setPhase,
      }}
    >
      <div
        className={`app app--theme-${settings[Setting.Theme].toLowerCase()} app--mode-${selectedMode.replace(/[^a-zA-Z]/g, "").toLowerCase()} app--hints-${settings[Setting.Hints].toLowerCase()}`}
      >
        <div className="app-center">
          {selectedMenu === Menus.Menu && <Menu />}
          {selectedMenu === Menus.Settings && <SettingsModal />}
          {selectedMenu === Menus.Shortcuts && <KeyboardShortcuts />}
          {selectedMenu === Menus.Info && <InfoModal />}
          {selectedMenu === Menus.Theme && <ThemeModal />}

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
      </div>
    </MorseContext.Provider>
  );
}

export default App;
