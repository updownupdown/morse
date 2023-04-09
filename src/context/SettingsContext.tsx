import { createContext } from "react";

export const defaultSettings = {
  wordsPerMin: 20,
  addWordBreaks: false,
};

interface ContextProps {
  wordsPerMin: number;
  setWordsPerMin: (val: number) => void;
  addWordBreaks: boolean;
  setAddWordBreaks: (val: boolean) => void;
}

export const SettingsContext = createContext<ContextProps>({
  wordsPerMin: defaultSettings.wordsPerMin,
  setWordsPerMin: () => {},
  addWordBreaks: defaultSettings.addWordBreaks,
  setAddWordBreaks: () => {},
});
