import React, { createContext } from "react";
import { ReceiveIcon } from "../icons/ReceiveIcon";
import { SendIcon } from "../icons/SendIcon";
import { MorseMachineIcon } from "../icons/MorseMachineIcon";
import { TranslateIcon } from "../icons/TranslateIcon";
import { DictionaryIcon } from "../icons/DictionaryIcon";

export enum Difficulty {
  Easy = "Easy",
  Moderate = "Moderate",
  Hard = "Hard",
}

export enum KeyTypes {
  Straight = "Straight",
  IambicA = "Iambic A",
  IambicB = "Iambic B",
  Ultimatic = "Ultimatic",
}

type SettingsValues = typeof Difficulty | typeof KeyTypes;

export const KeyTypesNames: Record<KeyTypes, string> = {
  [KeyTypes.Straight]: "Straight Key",
  [KeyTypes.IambicA]: "Iambic A",
  [KeyTypes.IambicB]: "Iambic B",
  [KeyTypes.Ultimatic]: "Ultimatic",
};

export enum Setting {
  Difficulty = "Difficulty",
  KeyType = "KeyType",
  UnitTime = "UnitTime",
  Farnsworth = "Farnsworth",
  Frequency = "Frequency",
  Volume = "Volume",
}

export type Settings = {
  [Setting.Difficulty]: Difficulty;
  [Setting.KeyType]: KeyTypes;
  [Setting.UnitTime]: number;
  [Setting.Farnsworth]: number;
  [Setting.Frequency]: number;
  [Setting.Volume]: number;
};

export const defaultSettings: Settings = {
  [Setting.Difficulty]: Difficulty.Easy,
  [Setting.KeyType]: KeyTypes.Straight,
  [Setting.UnitTime]: 100,
  [Setting.Farnsworth]: 2,
  [Setting.Frequency]: 600,
  [Setting.Volume]: 30,
};

export const settingsSpecs: Record<
  Setting,
  {
    title: string;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
    values?: SettingsValues;
    hints?: Record<string, string>;
  }
> = {
  // Buttons
  [Setting.Difficulty]: {
    title: "Difficulty",
    values: Difficulty,
    hints: {
      [Difficulty.Easy]: "Shows hints quickly",
      [Difficulty.Moderate]: "Shows hints slowly",
      [Difficulty.Hard]: "No hints shown",
    },
  },
  [Setting.KeyType]: {
    title: "Key",
    values: KeyTypes,
    hints: {
      [KeyTypes.Straight]: "One key, non-repeating",
      [KeyTypes.IambicA]: "First squeeze key repeats",
      [KeyTypes.IambicB]:
        "First squeeze key repeats; additional symbol on release",
      [KeyTypes.Ultimatic]: "Last squeezed key repeats",
    },
  },
  // Ranges
  [Setting.UnitTime]: {
    title: "Unit Time",
    unit: "ms",
    min: 20,
    max: 200,
    step: 2,
  },
  [Setting.Farnsworth]: {
    title: "Farnsworth",
    unit: "x",
    min: 1,
    max: 10,
    step: 1,
  },
  [Setting.Frequency]: {
    title: "Frequency",
    unit: "Hz",
    min: 50,
    max: 800,
    step: 10,
  },
  [Setting.Volume]: {
    title: "Volume",
    unit: "%",
    min: 0,
    max: 100,
    step: 2,
  },
};

export enum Menus {
  None = "None",
  Menu = "Menu",
  Settings = "Settings",
}

export enum Modes {
  Home = "Home",
  Send = "Send",
  Receive = "Receive",
  Study = "Study",
  Translate = "Translate",
  Practice = "Practice",
}

export const ModeIcons: Record<Modes, React.ReactNode> = {
  [Modes.Home]: <SendIcon />,
  [Modes.Send]: <SendIcon />,
  [Modes.Receive]: <ReceiveIcon />,
  [Modes.Study]: <DictionaryIcon />,
  [Modes.Translate]: <TranslateIcon />,
  [Modes.Practice]: <MorseMachineIcon />,
};

export type IsPlaying = "symbol" | "charOrWord" | undefined;

interface ContextProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  selectedMenu: Menus;
  setSelectedMenu: (menu: Menus) => void;
  selectedMode: Modes;
  setSelectedMode: (mode: Modes) => void;
  lastSelectedMode: Modes;
  setLastSelectedMode: (mode: Modes) => void;
  isPlaying: IsPlaying;
  setIsPlaying: (playing: IsPlaying) => void;
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
  isPlaying: undefined,
  setIsPlaying: () => {},
  audioInitialized: false,
  setAudioInitialized: () => {},
});
