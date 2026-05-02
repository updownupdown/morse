import React, { useContext } from "react";
import { MenuIcon } from "../icons/MenuIcon";
import { SettingsIcon } from "../icons/SettingsIcon";
import "./Header.scss";
import { Menus, MorseContext, Setting } from "../context/MorseContext";

export const Header = () => {
  const { settings, setSelectedMenu, selectedMode } = useContext(MorseContext);

  return (
    <div className="header">
      <button
        className="header__menu-btn"
        onClick={() => setSelectedMenu(Menus.Menu)}
      >
        <MenuIcon />
        <span>{selectedMode}</span>
      </button>

      <button
        className="header__settings-btn"
        onClick={() => setSelectedMenu(Menus.Settings)}
      >
        <span>{settings[Setting.Difficulty]}</span>
        <SettingsIcon />
      </button>
    </div>
  );
};
