import React, { useContext } from "react";
import { MenuIcon } from "../icons/MenuIcon";
import { SettingsIcon } from "../icons/SettingsIcon";
import "./Header.scss";
import { Menus, Modes, MorseContext, Setting } from "../context/MorseContext";
import { KeyboardIcon } from "../icons/KeyboardIcon";

export const Header = () => {
  const { setSelectedMenu, selectedMode, settings } = useContext(MorseContext);

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
        className="header__right-btn header__right-btn--settings"
        onClick={() => setSelectedMenu(Menus.Settings)}
      >
        <span className="header-diff">
          {[Modes.Receive, Modes.Send].includes(selectedMode) && (
            <>[{settings[Setting.Difficulty]}]</>
          )}
        </span>
        <SettingsIcon />
      </button>

      <button
        className="header__right-btn header__right-btn--shortcuts"
        onClick={() => setSelectedMenu(Menus.Shortcuts)}
      >
        <KeyboardIcon />
      </button>
    </div>
  );
};
