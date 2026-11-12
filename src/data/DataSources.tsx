import { words } from "./words";
import { specialChars, letters } from "./chars";
import { pangrams } from "./pangrams";
import { abbreviations } from "./abbreviations";
import {
  buildLesson,
  pickWeighted,
  Progress,
  Skill,
  weightedOrder,
} from "../progress/progress";

export enum Sources {
  Lesson = "Lesson",
  Words = "Words",
  Pangrams = "Pangrams",
  AllChars = "Characters",
  Practice = "Free key",
  Letters = "Letters",
  SpecialChars = "Special Characters",
  Numbers = "Numbers",
  Abbreviations = "Abbreviations",
}

export const sendSources = [
  Sources.Lesson,
  Sources.Words,
  Sources.Pangrams,
  Sources.AllChars,
  Sources.Numbers,
  Sources.Abbreviations,
  Sources.Practice,
];
export const receiveSources = [
  Sources.Lesson,
  Sources.Words,
  Sources.Pangrams,
  Sources.Letters,
  Sources.Numbers,
  Sources.SpecialChars,
  Sources.Abbreviations,
];

// Shorter names where the list is tight
export const sourceLabels: Partial<Record<Sources, string>> = {
  [Sources.SpecialChars]: "Symbols",
  [Sources.Abbreviations]: "Abbrev.",
};

// What a "quantity" of each source is called
export const sourceUnits: Record<Sources, string> = {
  [Sources.Lesson]: "groups",
  [Sources.Words]: "words",
  [Sources.Pangrams]: "pangrams",
  [Sources.AllChars]: "characters",
  [Sources.Practice]: "",
  [Sources.Letters]: "letters",
  [Sources.SpecialChars]: "characters",
  [Sources.Numbers]: "groups",
  [Sources.Abbreviations]: "abbreviations",
};

export const defaultSourceQty: Record<Sources, number> = {
  [Sources.Lesson]: 6,
  [Sources.Words]: 8,
  [Sources.Pangrams]: 2,
  [Sources.AllChars]: 52,
  [Sources.Practice]: 1,
  [Sources.Letters]: 26,
  [Sources.SpecialChars]: 26,
  [Sources.Numbers]: 5,
  [Sources.Abbreviations]: 10,
};

export const maxSourceQty: Record<Sources, number> = {
  [Sources.Lesson]: 20,
  [Sources.Words]: 30,
  [Sources.Pangrams]: 10,
  [Sources.AllChars]: 52,
  [Sources.Practice]: 1,
  [Sources.Letters]: 26,
  [Sources.SpecialChars]: 26,
  [Sources.Numbers]: 20,
  [Sources.Abbreviations]: 30,
};

export type Stats = {
  correct: number;
  incorrect: number;
  unitLength: number;
  accuracy: number;
  wpm: number;
  charsTotal: number;
  charsDone: number;
};

export const defaultStats: Stats = {
  correct: 0,
  incorrect: 0,
  unitLength: 0,
  accuracy: 0,
  wpm: 0,
  charsTotal: 0,
  charsDone: 0,
};

// Returns a shuffled copy (the shared lists are left untouched)
export function shuffle<T>(source: T[]) {
  const array = [...source];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function chunk(chars: string[], size: number) {
  const chunks: string[] = [];
  for (let i = 0; i < chars.length; i += size) {
    chunks.push(chars.slice(i, i + size).join(""));
  }
  return chunks;
}

const digits = "0123456789".split("");

// Builds the set of words (or groups of characters) for a round.
// Character drills lean towards the ones you find hardest.
export function getWordSet(
  source: Sources,
  qty: number,
  skill: Skill,
  progress: Progress,
): string[] {
  const stats = progress[skill];

  switch (source) {
    case Sources.Lesson:
      return buildLesson(progress.lesson[skill], stats, words, qty);
    case Sources.Words:
      return shuffle(words).slice(0, qty);
    case Sources.Pangrams:
      return shuffle(pangrams).slice(0, qty);
    case Sources.Abbreviations:
      return shuffle(abbreviations.map((a) => a.code)).slice(0, qty);
    case Sources.Numbers:
      return Array.from({ length: qty }, () =>
        Array.from({ length: 5 }, () => pickWeighted(digits, stats)).join(""),
      );
    case Sources.AllChars:
      return chunk(
        weightedOrder([...letters, ...specialChars], stats).slice(0, qty),
        5,
      );
    case Sources.Letters:
      return chunk(weightedOrder(letters, stats).slice(0, qty), 5);
    case Sources.SpecialChars:
      return chunk(weightedOrder(specialChars, stats).slice(0, qty), 5);
    default:
      return [];
  }
}
