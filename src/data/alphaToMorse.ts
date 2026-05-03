export const maxCodeLength = 6;
export const invalidCharText = "Invalid";

interface Study {
  [letter: string]: string;
}

export function alphaToMorse(alpha: string) {
  const splitAlpha = alpha.split("");
  let morse: string[] = [];

  if (splitAlpha.length !== 0) {
    splitAlpha.forEach((char) => {
      if (char === " ") {
        morse.push("/");
      } else {
        const match = alphaToMorseDict[char.toUpperCase()];
        morse.push(match ?? "�");
      }
    });
  }

  return morse.join(" ");
}

export const regexCleanup = /[^-. /]/g;
export const regexTest = /^[/. -]*$/;

export function sanitizeMorse(morse: string) {
  return morse
    .replace(regexCleanup, "")
    .replace(/\/+/g, "/")
    .replace(/\s+/g, " ");
}

export function morseToAlpha(morse: string) {
  const splitMorse = sanitizeMorse(morse).split(" ");
  let alpha: string[] = [];

  if (splitMorse.length !== 0) {
    splitMorse.forEach((symbol) => {
      if (symbol === "/") {
        alpha.push(" ");
      } else {
        const match = Object.keys(alphaToMorseDict).find(
          (key) => alphaToMorseDict[key] === symbol,
        );
        alpha.push(match ?? "");
      }
    });
  }

  return splitMorse.join("");
}

export type Unit = "." | "-" | " " | "/" | "dit" | "dah";

export const unitLengths: Record<Unit, number> = {
  dit: 1,
  dah: 3,
  ".": 1,
  "-": 3,
  " ": 3,
  "/": 7,
};

export function calculateMorseUnitLength(morse: string) {
  let splitMorse = sanitizeMorse(morse);

  // Don't overcount spaces around slashes
  splitMorse.replaceAll(" / ", "");
  splitMorse.split("");

  let totalLength = 0;

  for (let i = 0; i < splitMorse.length; i++) {
    totalLength += unitLengths[splitMorse[i] as Unit];
  }

  return totalLength;
}

export const alphaToMorseDict: Study = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  "0": "-----",
  "&": ".-...",
  "'": ".----.",
  "@": ".--.-.",
  "(": "-.--.",
  ")": "-.--.-",
  ":": "---...",
  ",": "--..--",
  ".": ".-.-.-",
  "!": "-.-.--",
  "?": "..--..",
  ";": "-.-.-.",
  "/": "-..-.",
  "-": "-....-",
  '"': ".-..-.",
  "=": "-...-",
  "+": ".-.-.",
};
