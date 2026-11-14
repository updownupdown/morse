import { useContext, useEffect } from "react";
import { TabBar, isSessionPhase, practiceModes } from "./TabBar";
import "./Header.scss";
import { Menus, Modes, MorseContext } from "../context/MorseContext";
import { useAudioContext } from "../context/AudioContext";
import { initCode } from "../hooks/useAudio";
import { games } from "../games/registry";
import { ChevronLeftIcon, SlidersIcon } from "../icons/LineIcons";

// One header for every screen: "Back" on the left when there's somewhere
// to go back to, the screen's title in the middle (the tabs, on wider
// screens), and settings on the right.
export const Header = () => {
  const {
    setSelectedMenu,
    selectedMode,
    setSelectedMode,
    routeParam,
    selectedMenu,
    quizSource,
    phase,
    setPhase,
    stats,
    sessionLabel,
  } = useContext(MorseContext);

  const { playMorse, stopMorse } = useAudioContext();

  const game =
    selectedMode === Modes.Play
      ? games.find((g) => g.id === routeParam)
      : undefined;
  const inSession = isSessionPhase(phase);
  const canGoBack = inSession || game !== undefined;

  useEffect(() => {
    if (selectedMenu !== undefined) {
      stopMorse();
    }
  }, [selectedMenu]);

  function goBack() {
    stopMorse();

    if (inSession) {
      // Ends the session or round, back to its setup: with the results,
      // for a practice session that got anywhere
      const attempted = stats && stats.correct + stats.incorrect > 0;
      setPhase(
        phase === "guess" && practiceModes.includes(selectedMode) && attempted
          ? "stats"
          : "standby",
      );
    } else if (game) {
      setSelectedMode(Modes.Play);
    }
  }

  // What the title says
  let title: React.ReactNode;
  let subtitle: string | undefined;

  if (game) {
    title = game.name;
  } else if (inSession && practiceModes.includes(selectedMode)) {
    const label = sessionLabel ?? [
      selectedMode === Modes.Send ? "Sending" : "Receiving",
      quizSource ?? "",
    ];
    subtitle = label[0];
    title = label[1];
  } else if (selectedMode === Modes.Home) {
    title = (
      <>
        Morse<b>Play</b>
      </>
    );
  } else if (practiceModes.includes(selectedMode)) {
    title = "Practice";
  } else {
    title = selectedMode;
  }

  return (
    <header className={`header${canGoBack ? " header--sub" : ""}`}>
      <div className="header__side">
        {canGoBack && (
          <button className="header-back" onClick={goBack}>
            <ChevronLeftIcon />
            <span>Back</span>
          </button>
        )}
      </div>

      <h1 className="header-title">
        {subtitle && <small>{subtitle}</small>}
        <span>{title}</span>
      </h1>

      {!canGoBack && <TabBar placement="top" />}

      <div className="header__side header__side--end">
        <button
          className="header-settings"
          aria-label="Settings"
          onClick={() => {
            playMorse(initCode);
            setSelectedMenu(Menus.Settings);
          }}
        >
          <SlidersIcon />
        </button>
      </div>
    </header>
  );
};
