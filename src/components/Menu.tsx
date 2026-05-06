import React, { useContext } from "react";
import { Modal } from "./Modal";
import "./Menu.scss";

import { Menus, ModeIcons, Modes, MorseContext } from "../context/MorseContext";
import { initCode, useAudio } from "../hooks/useAudio";
import { SettingsIcon } from "../icons/SettingsIcon";
import { HelpIcon } from "../icons/HelpIcon";
import { KeyboardIcon } from "../icons/KeyboardIcon";

export const MenuLinks = () => {
  const links = [
    {
      title: "Send",
      link: Modes.Send,
    },
    {
      title: "Receive",
      link: Modes.Receive,
    },
    {
      title: "Learn",
      link: Modes.Learn,
    },
    {
      title: "Translate",
      link: Modes.Translate,
    },
  ];

  const { setSelectedMode, setLastSelectedMode, setSelectedMenu } =
    useContext(MorseContext);
  const { playMorse } = useAudio();

  return (
    <>
      <div className="menu-header">
        <h3>
          Morse<span>Play</span>
        </h3>
        <span>
          by James Carmichael |{" "}
          <a href="https://github.com/updownupdown/morse" target="_blank">
            GitHub
          </a>
        </span>
      </div>

      <div className="menu-links">
        {links.map((link) => {
          return (
            <button
              key={link.title}
              className="link"
              onClick={() => {
                setSelectedMode(link.link);
                setLastSelectedMode(link.link);
                setSelectedMenu(Menus.None);
              }}
            >
              {ModeIcons[link.link]}
              <span>{link.title}</span>
            </button>
          );
        })}
      </div>

      <div className="secondary-menu-links">
        <button
          className="btn btn--outlined"
          onClick={() => setSelectedMenu(Menus.Settings)}
        >
          <SettingsIcon />
          <span>Settings</span>
        </button>

        {/* <button
          className="btn btn--outlined"
          onClick={() => setSelectedMenu(Menus.Info)}
        >
          <HelpIcon />
          <span>Info</span>
        </button> */}
        <button
          className="btn btn--outlined"
          onClick={() => setSelectedMenu(Menus.Shortcuts)}
        >
          <KeyboardIcon />
          <span>Shortcuts</span>
        </button>
      </div>
    </>
  );
};

export const Menu = () => {
  return (
    <Modal title="Menu" showTitle={false}>
      <div className="menu">
        <MenuLinks />
      </div>
    </Modal>
  );
};
