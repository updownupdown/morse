import React, { createContext } from "react";
import { ReceiveIcon } from "../icons/ReceiveIcon";
import { SendIcon } from "../icons/SendIcon";
import { MorseMachineIcon } from "../icons/MorseMachineIcon";
import { TranslateIcon } from "../icons/TranslateIcon";
import { DictionaryIcon } from "../icons/DictionaryIcon";
import { Themes } from "../components/ThemeModal";
import { Sources, Stats } from "../data/DataSources";
import { Phase } from "../hooks/useQuiz";

export enum Hints {
  On = "On",
  Delayed = "Delayed",
  Off = "Off",
}

export enum AutoPlay {
  Letter = "Letter",
  Word = "Word",
  Off = "Off",
}

export enum KeyTypes {
  Straight = "Straight",
  IambicA = "Iambic A",
  IambicB = "Iambic B",
  Ultimatic = "Ultimatic",
}

type SettingsValues = typeof Hints | typeof KeyTypes | typeof AutoPlay;

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
  AutoPlay = "AutoPlay", // on receive
  AutoWordBreak = "AutoWordBreak", // off by default, for free play only?
  Theme = "Theme",
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
  [Setting.AutoPlay]: AutoPlay;
  [Setting.AutoWordBreak]: boolean;
  [Setting.Theme]: Themes;
};

export const defaultSettings: Settings = {
  // Audio
  [Setting.UnitTime]: 80,
  [Setting.Farnsworth]: 2,
  [Setting.Frequency]: 550,
  [Setting.Volume]: 30,
  // Other
  [Setting.KeyType]: KeyTypes.Straight,
  [Setting.Hints]: Hints.On,
  [Setting.AutoPlay]: AutoPlay.Letter,
  [Setting.AutoWordBreak]: false,
  [Setting.Theme]: Themes.Teal,
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
  [Setting.Theme]: {
    title: "Themes",
  },
  [Setting.AutoWordBreak]: {
    title: "Auto-add wordbreaks",
  },
  [Setting.AutoPlay]: {
    title: "Auto-play",
    values: AutoPlay,
  },
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
    max: 8,
    step: 1,
  },
  [Setting.Frequency]: {
    title: "Frequency",
    unit: "Hz",
    min: 350,
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
  Theme = "Theme",
}

export enum Modes {
  Home = "Home",
  Send = "Send",
  Receive = "Receive",
  Learn = "Learn",
  Translate = "Translate",
}

export const ModeIcons: Record<Modes, React.ReactNode> = {
  [Modes.Home]: <SendIcon />,
  [Modes.Send]: <MorseMachineIcon />,
  [Modes.Receive]: <ReceiveIcon />,
  [Modes.Learn]: <DictionaryIcon />,
  [Modes.Translate]: <TranslateIcon />,
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
  quizSource: Sources | undefined;
  setQuizSource: (source: Sources) => void;
  quizQty: number | undefined;
  setQuizQty: (qty: number) => void;
  stats: Stats | undefined;
  setStats: (stats: Stats | undefined) => void;
  phase: Phase;
  setPhase: (phase: Phase) => void;
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
  phase: "standby",
  setPhase: () => {},
  quizSource: undefined,
  setQuizSource: () => {},
  quizQty: undefined,
  setQuizQty: () => {},
  stats: undefined,
  setStats: () => {},
});
