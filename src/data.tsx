export const Telegrams = {
  "Titanic sinking":
    "We are sinking fast. Passengers are being put into boats. Titanic.",
  "Simple SOS": "SOS",
  "Royal Navy at the start of WWII": "Winston is back.",
  "First telegram ever sent": "What hath God wrought?",
  "From journalist in Venice to his editor":
    "Streets full of water – please advise.",
  "Oscar Wilde's response": "The reports of my death are greatly exaggerated.",
  "First hydrogen bomb": "It’s a boy.",
  "From a husband upstairs":
    "I would like a boiled egg, two slices of toast and a cup of tea. Thank you very much, Spike.",
};

interface Dictionary {
  [letter: string]: string;
}

export const dictionaryLists = [
  ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"],
  ["N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  [".", ",", ":", ";", "?", "!", "&", "@"],
  ["/", "+", "-", "=", "'", '"', "(", ")"],
];

export const alphaToMorse: Dictionary = {
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

// interface IProsign {
//   prosign: string;
//   voice: string;
//   code: string;
//   details: string;
// }
