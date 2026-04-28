import { words } from "./words";
import { specialChars, letters } from "./chars";
import { pangrams } from "./pangrams";

export enum Sources {
  Words = "Words",
  Letters = "Letters",
  SpecialChars = "123!?&",
  Pangrams = "Pangrams",
}

const random = (min: number, max: number) =>
  Math.floor(min + Math.random() * (max - min + 1));

export function getRandomSource(source: Sources) {
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
