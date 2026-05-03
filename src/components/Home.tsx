import React, { useContext, useEffect } from "react";
import { MenuLinks } from "./Menu";
import "./Home.scss";
import {
  Menus,
  ModeIcons,
  Modes,
  MorseContext,
  Setting,
  settingsSpecs,
} from "../context/MorseContext";
import { SettingsIcon } from "../icons/SettingsIcon";
import { initCode, useMorseAudio } from "../hooks/useMorseAudio";
import { SettingButtons } from "./SettingsModal";

export const Home = () => {
  const { settings, setSelectedMenu, lastSelectedMode, setSelectedMode } =
    useContext(MorseContext);
  const { playMorse } = useMorseAudio();

  function resume() {
    playMorse(initCode);
    setSelectedMode(lastSelectedMode);
  }

  const showResumeButton = lastSelectedMode !== Modes.Home;

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey || e.repeat) return;

      if ([" ", ".", "[", "]"].includes(e.key)) {
        resume();
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="home">
      <div className="home__header">
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

      <MenuLinks />

      <div className="home__settings">
        <div className="home__settings__list">
          {Object.values(Setting).map((key) => {
            const specs = settingsSpecs[key];
            const currentValue = settings[key];

            return (
              <div key={key}>
                <span>{specs.title}</span>
                <span>
                  {currentValue}
                  {specs.unit}
                </span>
              </div>
            );
          })}
        </div>

        <button onClick={() => setSelectedMenu(Menus.Settings)}>
          <span>Settings</span>
          <SettingsIcon />
        </button>
      </div>

      {showResumeButton && (
        <button className="home-resume" onClick={resume}>
          <span>
            Resume <span>{lastSelectedMode}</span>
          </span>
          {ModeIcons[lastSelectedMode]}
        </button>
      )}
    </div>
  );
};
