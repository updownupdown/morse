import React, { useContext } from "react";
import { MenuLinks } from "./Menu";
import "./Home.scss";
import { Menus, ModeIcons, Modes, MorseContext } from "../context/MorseContext";
import { Settings as SettingsIcon } from "../icons/Settings";
import { initCode, useMorseAudio } from "../hooks/useMorseAudio";

export const Home = () => {
  const { settings, setSelectedMenu, lastSelectedMode, setSelectedMode } =
    useContext(MorseContext);
  const { playMorse } = useMorseAudio();

  return (
    <div className="home">
      <div className="home__header">
        <h3>
          Morse<span>ED</span>
        </h3>
        <span>by James Carmichael</span>
        <a href="https://github.com/updownupdown/morse" target="_blank">
          GitHub
        </a>
      </div>

      <MenuLinks />

      <div className="home__settings">
        <div className="home__settings__list">
          <div>
            <span>Difficulty</span>
            <span>{settings.difficulty}</span>
          </div>
          <div>
            <span>Units Time</span>
            <span>{settings.unitTime}ms</span>
          </div>
          <div>
            <span>Frequency</span>
            <span>{settings.frequency}Hz</span>
          </div>
          <div>
            <span>Keys</span>
            <span>{settings.keyType}</span>
          </div>
          <div>
            <span>Volume</span>
            <span>{settings.volume}%</span>
          </div>
        </div>

        <button onClick={() => setSelectedMenu(Menus.Settings)}>
          <span>Settings</span>
          <SettingsIcon />
        </button>
      </div>

      {lastSelectedMode !== Modes.Home && (
        <button
          className="home-resume"
          onClick={() => {
            playMorse(initCode);
            setSelectedMode(lastSelectedMode);
          }}
        >
          <span className="home-resume__resume">Resume</span>

          <span className="home-resume__last">
            <span>{lastSelectedMode}</span>
            {ModeIcons[lastSelectedMode]}
          </span>
        </button>
      )}
    </div>
  );
};
