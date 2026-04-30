import React, { useContext } from "react";
import { Modal } from "./Modal";
import "./Menu.scss";

import { Menus, ModeIcons, Modes, MorseContext } from "../context/MorseContext";
import { initCode, useMorseAudio } from "../hooks/useMorseAudio";

export const MenuLinks = () => {
  const links = [
    {
      title: "Encode",
      link: Modes.Encode,
    },
    {
      title: "Decode",
      link: Modes.Decode,
    },
    {
      title: "Dictionary",
      link: Modes.Dictionary,
    },
    {
      title: "Translate",
      link: Modes.Translate,
    },
    {
      title: "Simulator",
      link: Modes.Simulator,
    },
  ];

  const { setSelectedMode, setLastSelectedMode, setSelectedMenu } =
    useContext(MorseContext);
  const { playMorse } = useMorseAudio();

  return (
    <div className="menu-links">
      {links.map((link) => {
        return (
          <button
            key={link.title}
            className="link"
            onClick={() => {
              playMorse(initCode);
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
  );
};

export const Menu = () => {
  const { selectedMode } = useContext(MorseContext);

  return (
    <Modal title="Menu" showTitle={selectedMode !== Modes.Home}>
      <div className="menu">
        <MenuLinks />
      </div>
    </Modal>
  );
};
