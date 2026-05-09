import "./css/styles.scss";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  Menus,
  Modes,
  MorseContext,
  defaultSettings,
  Setting,
} from "./context/MorseContext";
import { Header } from "./components/Header";
import { SettingsModal } from "./components/SettingsModal";
import { Menu } from "./components/Menu";
import { Learn } from "./components/Learn";
import { Receive } from "./components/Receive";
import { Translate } from "./components/Translate";
import { Send } from "./components/Send";
import { useEffect, useState } from "react";
import { updateMetaThemeColor } from "./components/ThemeModal";
import { Home } from "./components/Home";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { InfoModal } from "./components/InfoModal";
import { ThemeModal } from "./components/ThemeModal";
import { Sources, Stats } from "./data/DataSources";
import { Phase } from "./hooks/useQuiz";
import { formatForCSSClass } from "./utils/utils";
import { AudioProvider } from "./context/AudioContext";

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
    "settingsv5",
    defaultSettings,
  );

  const [selectedMenu, setSelectedMenu] = useState(Menus.None);

  const [quizSource, setQuizSource] = useState<Sources | undefined>(undefined);
  const [quizQty, setQuizQty] = useState<number | undefined>(undefined);
  const [stats, setStats] = useState<Stats | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>("standby");

  // Reset stats on mode change
  useEffect(() => {
    setStats(undefined);
  }, [selectedMode]);

  useEffect(() => {
    // Update theme-color meta tag on init
    updateMetaThemeColor();

    // Prevent context menu for long presses
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    return () => {
      document.removeEventListener("contextmenu", (e) => e.preventDefault());
    };
  }, []);

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
      <AudioProvider>
        <div
          className={`app app--theme-${formatForCSSClass(settings[Setting.Theme])} app--mode-${formatForCSSClass(selectedMode)} app--hints-${formatForCSSClass(settings[Setting.Hints])}`}
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
              </div>
            </div>
          </div>
        </div>
      </AudioProvider>
    </MorseContext.Provider>
  );
}

export default App;
