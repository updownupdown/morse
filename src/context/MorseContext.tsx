import { createContext } from "react";

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

export const defaultSettings: Settings = {
  unitTime: 80,
  frequency: 600,
  volume: 0.2,
  difficulty: Difficulty.Easy,
};

interface ContextProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  selectedMenu: Menus;
  setSelectedMenu: (menu: Menus) => void;
  selectedMode: Modes;
  setSelectedMode: (mode: Modes) => void;
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
  selectedMode: Modes.Decode,
  setSelectedMode: () => {},
  isPlayingTone: false,
  setIsPlayingTone: () => {},
  audioInitialized: false,
  setAudioInitialized: () => {},
});
