import "./css/styles.scss";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  Menus,
  Modes,
  MorseContext,
  defaultSettings,
  normalizeSettings,
  Hints,
  Setting,
} from "./context/MorseContext";
import { Header } from "./components/Header";
import { SettingsModal } from "./components/SettingsModal";
import { TabBar, practiceModes } from "./components/TabBar";
import { useHashRoute } from "./hooks/useHashRoute";
import { Learn } from "./components/Learn";
import { Receive } from "./components/Receive";
import { Translate } from "./components/Translate";
import { Send } from "./components/Send";
import { useCallback, useEffect, useState } from "react";
import { updateMetaThemeColor } from "./components/ThemeModal";
import { Home } from "./components/Home";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { InfoModal } from "./components/InfoModal";
import { ThemeModal } from "./components/ThemeModal";
import { Sources, Stats } from "./data/DataSources";
import { Phase } from "./hooks/useQuiz";
import { formatForCSSClass } from "./utils/utils";
import { AudioProvider } from "./context/AudioContext";
import { ProgressProvider } from "./context/ProgressContext";

function App() {
  const [storedPracticeMode, setStoredPracticeMode] = useLocalStorage<
    Modes | null
  >("lastPracticeMode", null);
  const lastPracticeMode =
    storedPracticeMode !== null && practiceModes.includes(storedPracticeMode)
      ? storedPracticeMode
      : Modes.Send;

  const [route, setRoute] = useHashRoute(lastPracticeMode);
  const selectedMode = route.mode;
  const setSelectedMode = useCallback(
    (mode: Modes, param?: string) => setRoute({ mode, param }),
    [setRoute],
  );
  const [settings, setSettings] = useLocalStorage(
    "settingsv6",
    defaultSettings,
    normalizeSettings,
  );
  const [autoHints, setAutoHints] = useState(Hints.On);
  const shownHints =
    settings[Setting.Hints] === Hints.Auto ? autoHints : settings[Setting.Hints];

  const [selectedMenu, setSelectedMenu] = useState(Menus.None);

  const [quizSource, setQuizSource] = useState<Sources | undefined>(undefined);
  const [quizQty, setQuizQty] = useState<number | undefined>(undefined);
  const [stats, setStats] = useState<Stats | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>("standby");

  // On mode change (including the browser's back/forward buttons):
  // end any running session, reset stats, and remember the practice mode
  useEffect(() => {
    setStats(undefined);
    setPhase("standby");
    setSelectedMenu(Menus.None);

    if (
      practiceModes.includes(selectedMode) &&
      selectedMode !== storedPracticeMode
    ) {
      setStoredPracticeMode(selectedMode);
    }
  }, [selectedMode]);

  useEffect(() => {
    // Update theme-color meta tag on init
    updateMetaThemeColor();

    // Prevent context menu for long presses
    // (but leave it alone in text fields, where it's needed for paste)
    const preventContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("textarea, input")) return;
      e.preventDefault();
    };

    document.addEventListener("contextmenu", preventContextMenu);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
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
        routeParam: route.param,
        setSelectedMode,
        lastPracticeMode,
        hasPracticed: storedPracticeMode !== null,
        quizSource,
        setQuizSource,
        quizQty,
        setQuizQty,
        stats,
        setStats,
        phase,
        setPhase,
        autoHints,
        setAutoHints,
      }}
    >
      <ProgressProvider>
      <AudioProvider>
        <div
          className={`app app--theme-${formatForCSSClass(settings[Setting.Theme])} app--mode-${formatForCSSClass(selectedMode)} app--hints-${formatForCSSClass(shownHints)}`}
        >
          {selectedMenu !== Menus.None && <div className="modal-mask" />}

          <div className="app-center">
            {selectedMenu === Menus.Settings && <SettingsModal />}
            {selectedMenu === Menus.Shortcuts && <KeyboardShortcuts />}
            {selectedMenu === Menus.Info && <InfoModal />}
            {selectedMenu === Menus.Theme && <ThemeModal />}

            <Header />

            <div className="main">
              <div className="main__content">
                {selectedMode === Modes.Home && <Home />}
                {selectedMode === Modes.Send && <Send />}
                {selectedMode === Modes.Receive && <Receive />}
                {selectedMode === Modes.Learn && <Learn />}
                {selectedMode === Modes.Translate && <Translate />}
              </div>
            </div>

            <TabBar placement="bottom" />
          </div>
        </div>
      </AudioProvider>
      </ProgressProvider>
    </MorseContext.Provider>
  );
}

export default App;
