import React, { useContext } from "react";
import { Menu as MenuIcon } from "../icons/Menu";
import { Settings as SettingsIcon } from "../icons/Settings";
import "./Header.scss";
import { Difficulty, Menus, MorseContext } from "../context/MorseContext";

export const Header = () => {
  const { settings, setSelectedMenu, selectedMode } = useContext(MorseContext);

  return (
    <div className="header">
      <button onClick={() => setSelectedMenu(Menus.Menu)}>
        <MenuIcon />
      </button>

      <span className="header__mode">{selectedMode}</span>

      <span className="header__settings">
        <span>{settings.difficulty}</span>
      </span>

      <button onClick={() => setSelectedMenu(Menus.Settings)}>
        <SettingsIcon />
      </button>
    </div>
  );
};
