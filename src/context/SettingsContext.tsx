import { createContext } from "react";

export const defaultSettings = {
  wordsPerMin: 15,
  addWordBreaks: false,
  shortDashDuration: 100,
};

interface ContextProps {
  wordsPerMin: number;
  setWordsPerMin: (val: number) => void;
  addWordBreaks: boolean;
  setAddWordBreaks: (val: boolean) => void;
  shortDashDuration: number;
  setShortDashDuration: (val: number) => void;
}

export const SettingsContext = createContext<ContextProps>({
  wordsPerMin: defaultSettings.wordsPerMin,
  setWordsPerMin: () => {},
  addWordBreaks: defaultSettings.addWordBreaks,
  setAddWordBreaks: () => {},
  shortDashDuration: defaultSettings.shortDashDuration,
  setShortDashDuration: () => {},
});
