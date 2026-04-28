import React, { useContext } from "react";
import { Modal } from "./Modal";
import "./Menu.scss";
import { TextDown as EncodeIcon } from "../icons/TextDown";
import { TextUp as DecodeIcon } from "../icons/TextUp";
import { Book as BookIcon } from "../icons/Book";
import { Swap as SwapIcon } from "../icons/Swap";
import { Touch as TouchIcon } from "../icons/Touch";
import { Menus, Modes, MorseContext } from "../context/MorseContext";
import { initCode, useMorseAudio } from "../hooks/useMorseAudio";

export const MenuLinks = () => {
  const links = [
    {
      title: "Encode words",
      desc: "Type words into morse",
      icon: <EncodeIcon />,
      link: Modes.Encode,
    },
    {
      title: "Decode words",
      desc: "Guess words from morse sound",
      icon: <DecodeIcon />,
      link: Modes.Decode,
    },
    {
      title: "Dictionary",
      desc: "Study letters, symbols and codes",
      icon: <BookIcon />,
      link: Modes.Dictionary,
    },
    {
      title: "Translate",
      desc: "Translate text to morse or v.v.",
      icon: <SwapIcon />,
      link: Modes.Translate,
    },
    {
      title: "Simulator",
      desc: "Send out morse",
      icon: <TouchIcon />,
      link: Modes.Simulator,
    },
  ];

  const { setSelectedMode, setSelectedMenu } = useContext(MorseContext);
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
              setSelectedMenu(Menus.None);
            }}
          >
            <div className="link__text">
              <span className="link__text__title">{link.title}</span>
              <span className="link__text__desc">{link.desc}</span>
            </div>
            {link.icon}
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
