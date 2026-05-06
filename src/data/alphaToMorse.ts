export const maxCodeLength = 6;
export const invalidCharText = "Invalid";

interface DictionaryListing {
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
        alpha.push(match ?? "�");
      }
    });
  }

  return alpha.join("");
}

export type Unit = "." | "-" | " " | "/" | "dit" | "dah" | "autoCharBreak";

export const unitLengths: Record<Unit, number> = {
  dit: 1,
  dah: 3,
  autoCharBreak: 2.3,
  ".": 1,
  "-": 3,
  " ": 3,
  "/": 7,
};

export function calculateMorseUnitLength(morse: string) {
  let processedMorsed = sanitizeMorse(morse);

  // Don't overcount spaces around slashes
  processedMorsed = processedMorsed.replace(" / ", "/");
  processedMorsed.split("");

  let totalLength = 0;

  for (let i = 0; i < processedMorsed.length; i++) {
    totalLength += unitLengths[processedMorsed[i] as Unit];

    // Add unit length if this and the next character are a dot or dash
    if (
      [".", "-"].includes(processedMorsed[i]) &&
      [".", "-"].includes(processedMorsed[i + 1])
    ) {
      totalLength += 1;
    }
  }

  return totalLength;
}

export const alphaToMorseDict: DictionaryListing = {
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
  ".": ".-.-.-",
  ";": "-.-.-.",
  ":": "---...",
  ",": "--..--",
  "!": "-.-.--",
  "?": "..--..",
  "&": ".-...",
  "@": ".--.-.",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "+": ".-.-.",
  "-": "-....-",
  "=": "-...-",
  "'": ".----.",
  '"': ".-..-.",
};
