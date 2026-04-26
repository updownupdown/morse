import React, { useContext } from "react";
import { Menu as MenuIcon } from "../icons/Menu";
import { Settings as SettingsIcon } from "../icons/Settings";
import "./Header.scss";
import {
  Difficulty,
  Menus,
  Modes,
  MorseContext,
} from "../context/MorseContext";

interface Props {
  selectedMenu: Menus;
  setSelectedMenu: (menu: Menus) => void;
  selectedMode: Modes;
  setSelectedMode: (mode: Modes) => void;
}

export const Header = ({
  selectedMenu,
  setSelectedMenu,
  selectedMode,
  setSelectedMode,
}: Props) => {
  const { settings } = useContext(MorseContext);

  return (
    <div className="header">
      <button onClick={() => setSelectedMenu(Menus.Menu)}>
        <MenuIcon />
      </button>

      <div className="header__center">
        <span className="header__center__title">MORSE-ED</span>
        <span className="header__center__mode">{selectedMode ?? "???"}</span>
        <span className="header__center__settings">
          <span>{settings.unitTime}ms</span>
          <span>
            {settings.frequency}Hz
            {settings.difficulty === Difficulty.Easy && "*"}
          </span>
          <span>{settings.difficulty}</span>
        </span>
      </div>

      <button onClick={() => setSelectedMenu(Menus.Settings)}>
        <SettingsIcon />
      </button>
    </div>
  );
};
