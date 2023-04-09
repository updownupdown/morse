import { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";

export function useTiming() {
  const { wordsPerMin } = useContext(SettingsContext);

  const unitLength = (60 / (50 * wordsPerMin)) * 1000;

  const gaps = {
    short: 1,
    long: 3,
    shortLongThreshold: 2,
    gapElements: 1,
    gapLetters: 3,
    gapWords: 7,
  };

  const timing = {
    short: unitLength * gaps.short,
    long: unitLength * gaps.long,
    shortLongThreshold: unitLength * gaps.shortLongThreshold,
    gapElements: unitLength * gaps.gapElements,
    gapLetters: unitLength * gaps.gapLetters,
    gapWords: unitLength * gaps.gapWords,
  };

  return { gaps, timing } as const;
}
