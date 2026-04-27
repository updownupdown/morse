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
import { useState } from "react";
import { Start } from "./components/Start";

function App() {
  const [selectedMenu, setSelectedMenu] = useState(Menus.Start);
  const [selectedMode, setSelectedMode] = useLocalStorage("mode", Modes.Home);
  const [settings, setSettings] = useLocalStorage("settings", defaultSettings);
  const [isPlayingTone, setIsPlayingTone] = useState(false);

  return (
    <MorseContext.Provider
      value={{
        settings,
        setSettings,
        selectedMenu,
        setSelectedMenu,
        selectedMode,
        setSelectedMode,
        isPlayingTone,
        setIsPlayingTone,
      }}
    >
      <div
        className={`app app--mode-${selectedMode.replace(/[^a-zA-Z]/g, "").toLowerCase()} app--diff-${settings.difficulty.toLowerCase()}`}
      >
        {selectedMenu === Menus.Start && <Start />}
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
            {selectedMenu === Menus.None && (
              <>
                {selectedMode === Modes.Home && <MenuLinks />}
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
