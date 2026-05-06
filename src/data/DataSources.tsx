import { words } from "./words";
import { specialChars, letters } from "./chars";
import { pangrams } from "./pangrams";

export enum SendSources {
  Words = "Words",
  Pangrams = "Pangrams",
  AllChars = "Characters",
}

export enum ReceiveSources {
  Pangrams = "Pangrams",
  Words = "Words",
  Letters = "Letters",
  SpecialChars = "123!?&",
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

function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const useWordSets = () => {
  function getWordSet(source: SendSources | ReceiveSources) {
    let data: string[] = [];
    let num = 0;
    let chunkSize = 0;

    switch (source) {
      case SendSources.Words:
      case ReceiveSources.Words:
        data = words;
        num = 10;
        break;
      case SendSources.Pangrams:
      case ReceiveSources.Pangrams:
        data = pangrams;
        num = 2;
        break;
      case SendSources.AllChars:
        data = [...letters, ...specialChars];
        num = 25;
        chunkSize = 5;
        break;
      case ReceiveSources.Letters:
        data = letters;
        num = 25;
        chunkSize = 5;
        break;
      case ReceiveSources.SpecialChars:
        data = specialChars;
        num = 25;
        chunkSize = 5;
        break;
    }

    shuffle(data);

    if (num !== 0) {
      data = data.slice(0, num);
    }

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
