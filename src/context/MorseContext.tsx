import React, { createContext } from "react";
import { DecodeIcon } from "../icons/DecodeIcon";
import { EncodeIcon } from "../icons/EncodeIcon";
import { MorseMachineIcon } from "../icons/MorseMachineIcon";
import { TranslateIcon } from "../icons/TranslateIcon";
import { DictionaryIcon } from "../icons/DictionaryIcon";
import { Settings } from "../components/Settings";

export enum Difficulty {
  Easy = "Easy",
  Moderate = "Moderate",
  Hard = "Hard",
}

export type Settings = {
  unitTime: number;
  frequency: number;
  volume: number;
  difficulty: Difficulty;
  keyType: KeyTypes;
  farnsworthSpeed: number;
};

export enum Menus {
  None = "None",
  Menu = "Menu",
  Settings = "Settings",
}

export enum Modes {
  Home = "Home",
  Encode = "Encode",
  Decode = "Decode",
  Dictionary = "Dictionary",
  Translate = "Translate",
  Simulator = "Simulator",
}

export const ModeIcons: Record<Modes, React.ReactNode> = {
  [Modes.Home]: <DecodeIcon />,
  [Modes.Encode]: <EncodeIcon />,
  [Modes.Decode]: <DecodeIcon />,
  [Modes.Dictionary]: <DictionaryIcon />,
  [Modes.Translate]: <TranslateIcon />,
  [Modes.Simulator]: <MorseMachineIcon />,
};

export enum KeyTypes {
  Straight = "Straight",
  IambicA = "IambicA",
  IambicB = "IambicB",
}

export const KeyTypesNames: Record<KeyTypes, string> = {
  [KeyTypes.Straight]: "Straight Keys",
  [KeyTypes.IambicA]: "Iambic A",
  [KeyTypes.IambicB]: "Iambic B",
};

export const KeyTypesDescription: Record<KeyTypes, string> = {
  [KeyTypes.Straight]: "One key, non-repeating",
  [KeyTypes.IambicA]: "Two keys, first pressed key repeats?",
  [KeyTypes.IambicB]: "Two keys, first pressed key repeats?",
};

export const defaultSettings: Settings = {
  unitTime: 80,
  frequency: 600,
  volume: 30,
  difficulty: Difficulty.Easy,
  keyType: KeyTypes.Straight,
  farnsworthSpeed: 2,
};

export const settingsRange = {
  volume: {
    min: 0,
    max: 100,
    step: 5,
  },
  frequency: {
    min: 50,
    max: 800,
    step: 10,
  },
  unitTime: {
    min: 30,
    max: 200,
    step: 2,
  },
  farnsworthSpeed: {
    min: 1,
    max: 10,
    step: 1,
  },
};

interface ContextProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  selectedMenu: Menus;
  setSelectedMenu: (menu: Menus) => void;
  selectedMode: Modes;
  setSelectedMode: (mode: Modes) => void;
  lastSelectedMode: Modes;
  setLastSelectedMode: (mode: Modes) => void;
  isPlayingTone: boolean;
  setIsPlayingTone: (playing: boolean) => void;
  audioInitialized: boolean;
  setAudioInitialized: (initialized: boolean) => void;
}

export const MorseContext = createContext<ContextProps>({
  settings: defaultSettings,
  setSettings: () => {},
  selectedMenu: Menus.None,
  setSelectedMenu: () => {},
  selectedMode: Modes.Home,
  setSelectedMode: () => {},
  lastSelectedMode: Modes.Home,
  setLastSelectedMode: () => {},
  isPlayingTone: false,
  setIsPlayingTone: () => {},
  audioInitialized: false,
  setAudioInitialized: () => {},
});
