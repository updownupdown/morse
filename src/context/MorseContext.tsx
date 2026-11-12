import React, { createContext } from "react";
import { ReceiveIcon } from "../icons/ReceiveIcon";
import { HomeIcon } from "../icons/HomeIcon";
import { GamesIcon } from "../icons/GamesIcon";
import { SendIcon } from "../icons/SendIcon";
import { MorseMachineIcon } from "../icons/MorseMachineIcon";
import { TranslateIcon } from "../icons/TranslateIcon";
import { DictionaryIcon } from "../icons/DictionaryIcon";
import { Themes } from "../data/themes";
import { Sources, Stats } from "../data/DataSources";
import { Phase } from "../hooks/useQuiz";

export enum Hints {
  // Shown for new characters, delayed while learning, hidden once known
  Auto = "Auto",
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
  Vibrate = "Vibrate",
  Flash = "Flash",
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
  [Setting.Vibrate]: boolean;
  [Setting.Flash]: boolean;
};

export const defaultSettings: Settings = {
  // Audio
  [Setting.UnitTime]: 80,
  [Setting.Farnsworth]: 2,
  [Setting.Frequency]: 550,
  [Setting.Volume]: 30,
  // Other
  [Setting.KeyType]: KeyTypes.Straight,
  [Setting.Hints]: Hints.Auto,
  [Setting.AutoPlay]: AutoPlay.Letter,
  [Setting.AutoWordBreak]: false,
  [Setting.Theme]: Themes.Teal,
  [Setting.Vibrate]: false,
  [Setting.Flash]: false,
};

// Settings saved by an older version keep their values; anything added
// since (or no longer valid) falls back to its default
export function normalizeSettings(stored: unknown): Settings {
  const saved = (stored ?? {}) as Record<string, unknown>;
  const settings: Record<string, unknown> = { ...defaultSettings };

  (Object.keys(defaultSettings) as Setting[]).forEach((key) => {
    const value = saved[key];
    const specs = settingsSpecs[key];

    if (typeof value !== typeof defaultSettings[key]) return;
    if (specs.values && !Object.values(specs.values).includes(value as never))
      return;
    if (key === Setting.Theme && !Object.values(Themes).includes(value as Themes))
      return;

    settings[key] = value;
  });

  return settings as Settings;
}

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
  [Setting.Vibrate]: {
    title: "Vibrate",
    hint: "Feel the code, on phones that support it",
  },
  [Setting.Flash]: {
    title: "Flash",
    hint: "A light on screen follows the code",
  },
  [Setting.AutoPlay]: {
    title: "Auto-play",
    values: AutoPlay,
  },
  [Setting.Hints]: {
    title: "Hints",
    values: Hints,
    hints: {
      [Hints.Auto]: "Fade out as you learn each character",
      [Hints.On]: "Always shown",
      [Hints.Delayed]: "Shown after a few seconds",
      [Hints.Off]: "Never shown",
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
  Settings = "Settings",
  Shortcuts = "Shortcuts",
  Info = "Info",
  Theme = "Theme",
  Vibrate = "Vibrate",
  Flash = "Flash",
}

export enum Modes {
  Home = "Home",
  Send = "Send",
  Receive = "Receive",
  OnAir = "On Air",
  Learn = "Learn",
  Play = "Play",
  Translate = "Translate",
}

export const ModeIcons: Record<Modes, React.ReactNode> = {
  [Modes.Home]: <HomeIcon />,
  [Modes.Send]: <MorseMachineIcon />,
  [Modes.Receive]: <ReceiveIcon />,
  [Modes.OnAir]: <SendIcon />,
  [Modes.Learn]: <DictionaryIcon />,
  [Modes.Play]: <GamesIcon />,
  [Modes.Translate]: <TranslateIcon />,
};

interface ContextProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  selectedMenu: Menus;
  setSelectedMenu: (menu: Menus) => void;
  selectedMode: Modes;
  // The rest of the address after the screen's own path (e.g. a game's id)
  routeParam: string | undefined;
  setSelectedMode: (mode: Modes, param?: string) => void;
  // Whichever of Send/Receive was used last; where the Practice tab leads
  lastPracticeMode: Modes;
  // False until the first visit to Send or Receive
  hasPracticed: boolean;
  quizSource: Sources | undefined;
  setQuizSource: (source: Sources) => void;
  quizQty: number | undefined;
  setQuizQty: (qty: number) => void;
  stats: Stats | undefined;
  setStats: (stats: Stats | undefined) => void;
  phase: Phase;
  setPhase: (phase: Phase) => void;
  // With hints on Auto: the level that suits the character being asked
  autoHints: Hints;
  setAutoHints: (hints: Hints) => void;
  // What the header shows while a session runs, e.g. ["On Air", "Small talk"].
  // Falls back to the quiz's own "Sending / Words".
  sessionLabel: [string, string] | undefined;
  setSessionLabel: (label: [string, string] | undefined) => void;
}

export const MorseContext = createContext<ContextProps>({
  settings: defaultSettings,
  setSettings: () => {},
  selectedMenu: Menus.None,
  setSelectedMenu: () => {},
  selectedMode: Modes.Home,
  routeParam: undefined,
  setSelectedMode: () => {},
  lastPracticeMode: Modes.Send,
  hasPracticed: false,
  phase: "standby",
  setPhase: () => {},
  autoHints: Hints.On,
  setAutoHints: () => {},
  sessionLabel: undefined,
  setSessionLabel: () => {},
  quizSource: undefined,
  setQuizSource: () => {},
  quizQty: undefined,
  setQuizQty: () => {},
  stats: undefined,
  setStats: () => {},
});
