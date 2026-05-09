import { words } from "./words";
import { specialChars, letters } from "./chars";
import { pangrams } from "./pangrams";

export enum SendSources {
  Words = "Words",
  Pangrams = "Pangrams",
  AllChars = "Characters",
}

export enum ReceiveSources {
  Words = "Words",
  Pangrams = "Pangrams",
  Letters = "Letters",
  SpecialChars = "Special Characters",
}

export const defaultSendSourceQty: Record<SendSources, number> = {
  [SendSources.Words]: 8,
  [SendSources.Pangrams]: 2,
  [SendSources.AllChars]: 52,
};
export const defaultReceiveSourceQty: Record<ReceiveSources, number> = {
  [ReceiveSources.Pangrams]: 2,
  [ReceiveSources.Words]: 8,
  [ReceiveSources.Letters]: 26,
  [ReceiveSources.SpecialChars]: 26,
};

export const maxSendSourceQty: Record<SendSources, number> = {
  [SendSources.Words]: words.length,
  [SendSources.Pangrams]: pangrams.length,
  [SendSources.AllChars]: 52,
};
export const maxReceiveSourceQty: Record<ReceiveSources, number> = {
  [ReceiveSources.Pangrams]: pangrams.length,
  [ReceiveSources.Words]: words.length,
  [ReceiveSources.Letters]: 26,
  [ReceiveSources.SpecialChars]: 26,
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
  function getWordSet(source: SendSources | ReceiveSources, qty: number) {
    let data: string[] = [];
    let chunkSize = 0;

    switch (source) {
      case SendSources.Words:
      case ReceiveSources.Words:
        data = words;
        break;
      case SendSources.Pangrams:
      case ReceiveSources.Pangrams:
        data = pangrams;
        break;
      case SendSources.AllChars:
        data = [...letters, ...specialChars];
        chunkSize = 5;
        break;
      case ReceiveSources.Letters:
        data = letters;
        chunkSize = 5;
        break;
      case ReceiveSources.SpecialChars:
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
