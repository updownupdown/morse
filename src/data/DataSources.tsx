import { words } from "./words";
import { specialChars, letters } from "./chars";
import { pangrams } from "./pangrams";
import { abbreviations } from "./abbreviations";
import {
  buildLesson,
  kochOrder,
  pickWeighted,
  Progress,
  Skill,
  weightedOrder,
} from "../progress/progress";

export enum Sources {
  Auto = "Auto",
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
  Sources.Auto,
  Sources.Words,
  Sources.Pangrams,
  Sources.AllChars,
  Sources.Numbers,
  Sources.Abbreviations,
  Sources.Practice,
];
export const receiveSources = [
  Sources.Auto,
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

// How much each batch holds. Practice is continuous: a new batch follows
// as soon as one is finished, until you go back.
export const batchQty: Record<Sources, number> = {
  [Sources.Auto]: 6,
  [Sources.Words]: 5,
  [Sources.Pangrams]: 1,
  [Sources.AllChars]: 10,
  [Sources.Practice]: 1,
  [Sources.Letters]: 10,
  [Sources.SpecialChars]: 10,
  [Sources.Numbers]: 3,
  [Sources.Abbreviations]: 5,
};

const digits = "0123456789".split("");

// The characters each source draws on, for its "known" count
export function sourceChars(source: Sources): string[] {
  switch (source) {
    case Sources.Auto:
      return kochOrder;
    case Sources.Words:
    case Sources.Pangrams:
    case Sources.Letters:
      return letters;
    case Sources.AllChars:
      return [...letters, ...specialChars];
    case Sources.SpecialChars:
      return specialChars;
    case Sources.Numbers:
      return digits;
    case Sources.Abbreviations:
      return [...letters, ...digits];
    default:
      return [];
  }
}

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

// Builds the set of words (or groups of characters) for a round.
// Character drills lean towards the ones you find hardest.
export function getWordSet(
  source: Sources,
  skill: Skill,
  progress: Progress,
): string[] {
  const stats = progress[skill];
  const qty = batchQty[source];

  switch (source) {
    case Sources.Auto:
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
