import { useContext } from "react";
import clsx from "clsx";
import "./TabBar.scss";
import { Modes, MorseContext } from "../context/MorseContext";
import { modeToHash } from "../hooks/useHashRoute";
import { HomeIcon } from "../icons/HomeIcon";
import { DictionaryIcon } from "../icons/DictionaryIcon";
import { MorseMachineIcon } from "../icons/MorseMachineIcon";
import { TranslateIcon } from "../icons/TranslateIcon";
import { GamesIcon } from "../icons/GamesIcon";

export const practiceModes = [Modes.Send, Modes.Receive, Modes.OnAir];

// A session is running: the tab bar gets out of the way of the key
export function isSessionPhase(phase: string) {
  return ["prepare", "guess", "practice", "play"].includes(phase);
}

interface Props {
  placement: "top" | "bottom";
}

export const TabBar = ({ placement }: Props) => {
  const { selectedMode, setSelectedMode, lastPracticeMode, phase } =
    useContext(MorseContext);

  const tabs = [
    { title: "Home", mode: Modes.Home, icon: <HomeIcon /> },
    { title: "Learn", mode: Modes.Learn, icon: <DictionaryIcon /> },
    { title: "Practice", mode: lastPracticeMode, icon: <MorseMachineIcon /> },
    { title: "Play", mode: Modes.Play, icon: <GamesIcon /> },
    { title: "Translate", mode: Modes.Translate, icon: <TranslateIcon /> },
  ];

  const hidden = isSessionPhase(phase);

  return (
    <nav
      className={clsx(
        "tab-bar",
        `tab-bar--${placement}`,
        hidden && "tab-bar--hidden",
      )}
      aria-label="Main"
      aria-hidden={hidden}
    >
      {tabs.map((tab) => {
        const isActive =
          tab.title === "Practice"
            ? practiceModes.includes(selectedMode)
            : selectedMode === tab.mode;

        return (
          <a
            key={tab.title}
            href={modeToHash(tab.mode)}
            className={clsx("tab", isActive && "tab--active")}
            aria-current={isActive ? "page" : undefined}
            tabIndex={hidden ? -1 : undefined}
            onClick={(e) => {
              e.preventDefault();
              setSelectedMode(tab.mode);
            }}
          >
            {tab.icon}
            <span>{tab.title}</span>
          </a>
        );
      })}
    </nav>
  );
};
