import React, { createContext } from "react";
import { ReceiveIcon } from "../icons/ReceiveIcon";
import { SendIcon } from "../icons/SendIcon";
import { MorseMachineIcon } from "../icons/MorseMachineIcon";
import { TranslateIcon } from "../icons/TranslateIcon";
import { DictionaryIcon } from "../icons/DictionaryIcon";
import { TouchIcon } from "../icons/TouchIcon";

export enum Hints {
  Generous = "Generous",
  Delayed = "Delayed",
  None = "None",
}

export enum KeyTypes {
  Straight = "Straight",
  IambicA = "Iambic A",
  IambicB = "Iambic B",
  Ultimatic = "Ultimatic",
}

type SettingsValues = typeof Hints | typeof KeyTypes;

export const KeyTypesNames: Record<KeyTypes, string> = {
  [KeyTypes.Straight]: "Straight Key",
  [KeyTypes.IambicA]: "Iambic A",
  [KeyTypes.IambicB]: "Iambic B",
  [KeyTypes.Ultimatic]: "Ultimatic",
};

export enum Setting {
  Hints = "Hints",
  KeyType = "KeyType",
  UnitTime = "UnitTime",
  Farnsworth = "Farnsworth",
  Frequency = "Frequency",
  Volume = "Volume",
  AutoPlayLetter = "AutoPlayLetter", // on receive
  AutoWordBreak = "AutoWordBreak", // off by default, for free play only?
  ShowStats = "ShowStats", // on by default
}

export type Settings = {
  // Audio
  [Setting.UnitTime]: number;
  [Setting.Farnsworth]: number;
  [Setting.Frequency]: number;
  [Setting.Volume]: number;
  // Other
  [Setting.KeyType]: KeyTypes;
  [Setting.Hints]: Hints;
  [Setting.AutoPlayLetter]: boolean;
  [Setting.AutoWordBreak]: boolean;
  [Setting.ShowStats]: boolean;
};

export const defaultSettings: Settings = {
  // Audio
  [Setting.UnitTime]: 100,
  [Setting.Farnsworth]: 2,
  [Setting.Frequency]: 550,
  [Setting.Volume]: 30,
  // Other
  [Setting.KeyType]: KeyTypes.Straight,
  [Setting.Hints]: Hints.Generous,
  [Setting.AutoPlayLetter]: true,
  [Setting.AutoWordBreak]: false,
  [Setting.ShowStats]: true,
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
    hint?: string;
  }
> = {
  // Toggles
  [Setting.AutoPlayLetter]: {
    title: "Auto-play next letter",
    // hint: 'Used in "Receive" mode',
  },
  [Setting.AutoWordBreak]: {
    title: "Auto-add wordbreak",
    // hint: 'Used in "Send" mode, free play',
  },
  [Setting.ShowStats]: {
    title: "Show WPM and accuracy",
    // hint: 'Used in "Send" mode',
  },
  // Buttons
  [Setting.Hints]: {
    title: "Hints",
    values: Hints,
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
    min: 200,
    max: 700,
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
  Shortcuts = "Shortcuts",
  Info = "Info",
}

export enum Modes {
  Home = "Home",
  Send = "Send",
  Receive = "Receive",
  Learn = "Learn",
  Translate = "Translate",
  Practice = "Practice",
}

export const ModeIcons: Record<Modes, React.ReactNode> = {
  [Modes.Home]: <SendIcon />,
  [Modes.Send]: <MorseMachineIcon />,
  [Modes.Receive]: <ReceiveIcon />,
  [Modes.Learn]: <DictionaryIcon />,
  [Modes.Translate]: <TranslateIcon />,
  [Modes.Practice]: <TouchIcon />,
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
