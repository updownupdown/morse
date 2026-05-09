import { words } from "./words";
import { specialChars, letters } from "./chars";
import { pangrams } from "./pangrams";

export enum Sources {
  Words = "Words",
  Pangrams = "Pangrams",
  AllChars = "Characters",
  Practice = "Practice",
  Letters = "Letters",
  SpecialChars = "Special Characters",
}

export const sendSources = [
  Sources.Words,
  Sources.Pangrams,
  Sources.AllChars,
  Sources.Practice,
];
export const receiveSources = [
  Sources.Words,
  Sources.Pangrams,
  Sources.Letters,
  Sources.SpecialChars,
];

export const defaultSourceQty: Record<Sources, number> = {
  [Sources.Words]: 8,
  [Sources.Pangrams]: 2,
  [Sources.AllChars]: 52,
  [Sources.Practice]: 1,
  [Sources.Letters]: 26,
  [Sources.SpecialChars]: 26,
};

export const maxSourceQty: Record<Sources, number> = {
  [Sources.Words]: 30,
  [Sources.Pangrams]: 10,
  [Sources.AllChars]: 52,
  [Sources.Practice]: 1,
  [Sources.Letters]: 26,
  [Sources.SpecialChars]: 26,
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

function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const useWordSets = () => {
  function getWordSet(source: Sources, qty: number) {
    let data: string[] = [];
    let chunkSize = 0;

    switch (source) {
      case Sources.Words:
        data = words;
        break;
      case Sources.Pangrams:
        data = pangrams;
        break;
      case Sources.AllChars:
        data = [...letters, ...specialChars];
        chunkSize = 5;
        break;
      case Sources.Letters:
        data = letters;
        chunkSize = 5;
        break;
      case Sources.SpecialChars:
        data = specialChars;
        chunkSize = 5;
        break;
    }

    shuffle(data);

    data = data.slice(0, qty);

    if (chunkSize !== 0) {
      const chunkedData = [];

      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        chunkedData.push(chunk.join(""));
      }

      data = chunkedData;
    }

    return data;
  }

  return { getWordSet };
};
