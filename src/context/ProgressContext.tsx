import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  advanceLesson,
  defaultProgress,
  normalizeProgress,
  Progress,
  recordAttempt,
  Skill,
} from "../progress/progress";

interface ProgressContextProps {
  progress: Progress;
  // Log one attempt at a character
  record: (skill: Skill, char: string, correct: boolean) => void;
  // After a lesson round; returns the character unlocked, if any
  completeLesson: (skill: Skill, accuracy: number) => string | undefined;
  // Saves a score if it beats the stored best (higher is better unless
  // `lowerIsBetter`); returns true for a new best
  submitBest: (id: string, score: number, lowerIsBetter?: boolean) => boolean;
  // Stores a value outright (e.g. how far through a set of cases)
  setBest: (id: string, value: number) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextProps | null>(null);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [progress, setProgress] = useLocalStorage<Progress>(
    "progressv1",
    defaultProgress,
    normalizeProgress,
  );

  const record = useCallback(
    (skill: Skill, char: string, correct: boolean) => {
      setProgress((prev) => recordAttempt(prev, skill, char, correct));
    },
    [setProgress],
  );

  const completeLesson = useCallback(
    (skill: Skill, accuracy: number) => {
      const { progress: next, unlocked } = advanceLesson(
        progress,
        skill,
        accuracy,
      );
      if (unlocked) {
        setProgress((prev) => advanceLesson(prev, skill, accuracy).progress);
      }
      return unlocked;
    },
    [progress, setProgress],
  );

  const submitBest = useCallback(
    (id: string, score: number, lowerIsBetter = false) => {
      const best = progress.bests[id];
      const isBest =
        best === undefined || (lowerIsBetter ? score < best : score > best);

      if (isBest) {
        setProgress((prev) => ({
          ...prev,
          bests: { ...prev.bests, [id]: score },
        }));
      }
      return isBest;
    },
    [progress, setProgress],
  );

  const setBest = useCallback(
    (id: string, value: number) => {
      setProgress((prev) => ({
        ...prev,
        bests: { ...prev.bests, [id]: value },
      }));
    },
    [setProgress],
  );

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress);
  }, [setProgress]);

  const value = useMemo(
    () => ({
      progress,
      record,
      completeLesson,
      submitBest,
      setBest,
      resetProgress,
    }),
    [progress, record, completeLesson, submitBest, setBest, resetProgress],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
