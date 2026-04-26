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
import { Menu, MenuLinks } from "./components/Menu";
import { Dictionary } from "./components/Dictionary";
import { Decode } from "./components/Decode";
import { Translate } from "./components/Translate";
import { Simulator } from "./components/Simulator";
import { Encode } from "./components/Encode";

function App() {
  const [selectedMenu, setSelectedMenu] = useLocalStorage("menu", Menus.None);
  const [selectedMode, setSelectedMode] = useLocalStorage("mode", Modes.Home);
  const [settings, setSettings] = useLocalStorage("settings", defaultSettings);

  return (
    <MorseContext.Provider
      value={{
        settings,
        setSettings,
        selectedMenu,
        setSelectedMenu,
        selectedMode,
        setSelectedMode,
      }}
    >
      <div
        className={`app app--mode-${selectedMode.replace(/[^a-zA-Z]/g, "").toLowerCase()} app--diff-${settings.difficulty.toLowerCase()}`}
      >
        {selectedMenu === Menus.Menu && <Menu />}
        {selectedMenu === Menus.Settings && <Settings />}

        <Header
          selectedMenu={selectedMenu}
          setSelectedMenu={setSelectedMenu}
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
        />

        <div className="main">
          <div className="main__content">
            {selectedMode === Modes.Home && <MenuLinks />}
            {selectedMode === Modes.Encode && <Encode />}
            {selectedMode === Modes.Decode && <Decode />}
            {selectedMode === Modes.Dictionary && <Dictionary />}
            {selectedMode === Modes.Translate && <Translate />}
            {selectedMode === Modes.Simulator && <Simulator />}
          </div>
        </div>
      </div>
    </MorseContext.Provider>
  );
}

export default App;
