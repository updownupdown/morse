import {
  alphaToMorse,
  calculateMorseUnitLength,
  unitLengths,
} from "../data/alphaToMorse";
import { defaultStats, Stats } from "../data/DataSources";
import { calculateWPM } from "../utils/utils";

// A round of the Send or Receive quiz as one plain value. Every guess goes
// through `applyGuess`, which returns the next state; nothing here touches
// React, audio or storage.
export type QuizState = {
  words: string[];
  wordIndex: number;
  letterIndex: number;
  // Whether the character being asked has already been missed
  missed: boolean;
  stats: Stats;
  startedAt: number;
  done: boolean;
  // What the last guess was, for anything that reacts to it
  last?: {
    guess: string;
    // The character that was being asked
    char: string;
    correct: boolean;
    // Right without an earlier miss on this character
    firstTry: boolean;
  };
};

export function startQuiz(source: string[], now: number): QuizState {
  const words = source.map((word) => word.toUpperCase());

  return {
    words,
    wordIndex: 0,
    letterIndex: 0,
    missed: false,
    stats: {
      ...defaultStats,
      // Spaces are stepped over, never asked
      charsTotal: words.reduce(
        (total, word) => total + word.replace(/ /g, "").length,
        0,
      ),
    },
    startedAt: now,
    done: words.length === 0,
  };
}

export const currentWord = (state: QuizState): string | undefined =>
  state.words[state.wordIndex];

export const currentChar = (state: QuizState): string | undefined =>
  state.done ? undefined : currentWord(state)?.[state.letterIndex];

export function applyGuess(
  state: QuizState,
  guess: string,
  now: number,
): QuizState {
  const word = currentWord(state);
  const char = currentChar(state);
  if (state.done || word === undefined || char === undefined) return state;

  const stats = { ...state.stats };
  const correct = guess === char;

  if (!correct) {
    stats.incorrect += 1;
    stats.accuracy = accuracy(stats);

    return {
      ...state,
      stats,
      missed: true,
      last: { guess, char, correct: false, firstTry: false },
    };
  }

  stats.correct += 1;
  stats.charsDone += 1;
  stats.unitLength += calculateMorseUnitLength(alphaToMorse(char));

  // On to the next character that needs keying, over any spaces
  let letterIndex = state.letterIndex + 1;
  while (word[letterIndex] === " ") letterIndex += 1;

  // The gap that follows, unless this was the word's last character
  if (letterIndex < word.length) stats.unitLength += unitLengths[" "];

  stats.wpm = calculateWPM(now - state.startedAt, stats.unitLength);
  stats.accuracy = accuracy(stats);

  const last = { guess, char, correct: true, firstTry: !state.missed };
  const next = { ...state, stats, missed: false, last };

  if (letterIndex < word.length) return { ...next, letterIndex };

  if (state.wordIndex === state.words.length - 1) {
    return { ...next, letterIndex, done: true };
  }
  return { ...next, wordIndex: state.wordIndex + 1, letterIndex: 0 };
}

function accuracy(stats: Stats) {
  return (stats.correct / (stats.correct + stats.incorrect)) * 100;
}
