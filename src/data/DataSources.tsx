import { words } from "./words";
import { specialChars, letters } from "./chars";
import { pangrams } from "./pangrams";
import { useLocalStorage } from "../hooks/useLocalStorage";

export enum Sources {
  Words = "Words",
  Letters = "Letters",
  SpecialChars = "123!?&",
  Pangrams = "Pangrams",
}

const savedRecentWords = 12;
const maxAttemptsToFindUniqueWords = 50;

const random = (min: number, max: number) =>
  Math.floor(min + Math.random() * (max - min + 1));

export const useRandomWord = () => {
  const [recentWords, setRecentWords] = useLocalStorage<string[]>(
    "recentWords",
    [],
  );

  function getRandomSource(source: Sources) {
    let data = words;

    switch (source) {
      case Sources.Letters:
        data = letters;
        break;
      case Sources.SpecialChars:
        data = specialChars;
        break;
      case Sources.Pangrams:
        data = pangrams;
        break;
    }

    return data[random(0, data.length - 1)].toUpperCase();
  }

  // Returns a random word not in recentWords, and updates recentWords
  function getUniqueRandomWord(source: Sources) {
    let attempts = 0;
    let word = "";

    do {
      word = getRandomSource(source);
      attempts++;
    } while (
      recentWords.includes(word) &&
      attempts < maxAttemptsToFindUniqueWords
    );

    setRecentWords(
      [word, ...recentWords.filter((w) => w !== word)].slice(
        0,
        savedRecentWords,
      ),
    );

    return word;
  }

  return { getUniqueRandomWord };
};
