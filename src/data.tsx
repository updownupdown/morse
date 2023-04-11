export const Telegrams = {
  "Titanic sinking":
    "We are sinking fast. Passengers are being put into boats. Titanic.",
  "Simple SOS": "SOS",
  "Royal Navy at the start of WWII": "Winston is back.",
  "First telegram ever sent": "What hath God wrought?",
  "From journalist in Venice to his editor":
    "Streets full of water - please advise.",
  "Oscar Wilde's response": "The reports of my death are greatly exaggerated.",
  "First hydrogen bomb": "It's a boy.",
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

export interface IProsign {
  prosign: string;
  voice: string;
  code: string;
  details: string;
}

export const prosigns: IProsign[] = [
  {
    prosign: "<AA>",
    voice: "UNKNOWN STATION",
    code: ".-.-",
    details:
      "This is only used for directional signal lights. It is never used in radio telegraphy, where it represents an accented letter ä or á.",
  },
  {
    prosign: "R",
    voice: "ROGER",
    code: ".-.",
    details:
      "Means the last transmission has been received, but does not necessarilly indicate the message was understood or will be complied with.",
  },
  {
    prosign: "K",
    voice: "OVER",
    code: "-.-",
    details: "Invitation to transmit after terminating the call signal.",
  },
  {
    prosign: "<AR>",
    voice: "OUT",
    code: ".-.-.",
    details:
      'End of transmission / End of message / End of telegram. (Same as ec "end copy", and character +.)',
  },
  {
    prosign: "<AS>",
    voice: "WAIT",
    code: ".-...",
    details:
      '"I must pause for a few minutes." Also means "I am engaged in a contact with another station [that you may not hear]; please wait quietly."',
  },
  {
    prosign: "<AS><AR>",
    voice: "WAIT OUT",
    code: "..-... .-.-.",
    details: "I must pause for more than a few minutes.",
  },
  {
    prosign: "<VE>",
    voice: "VERIFIED",
    code: "...-.",
    details: "Message is verified.",
  },
  {
    prosign: "?",
    voice: "SAY AGAIN?",
    code: "..--..",
    details:
      "When standing alone, a note of interrogation or request for repetition of the immediate prior transmission that was not understood. When ? is placed after a coded signal, modifies the code to be a question or request.",
  },
  {
    prosign: "<INT>",
    voice: "INTERROGATIVE",
    code: "..-.-",
    details:
      "Military replacement for the ? prosign; equivalent to Spanish ¿ punctuation mark. When placed before a signal, modifies the signal to be a question/request.",
  },
  {
    prosign: "<HH> ...",
    voice: "CORRECTION",
    code: "........",
    details:
      "Preceding text was in error. The following is the corrected text. (Same as eeeeeeee.)",
  },
  {
    prosign: "<HH><AR>",
    voice: "DISREGARD THIS TRANSMISSION OUT",
    code: "........ .-.-.",
    details:
      "he entire message just sent is in error, disregard it. (Same as eeeeeeee ar.)",
  },
  {
    prosign: "<BT>",
    voice: "BREAK",
    code: "-...-",
    details: "Start new section of message. Same as character = or - -.",
  },
  {
    prosign: "<KA>",
    voice: "ATTENTION",
    code: "-.-.-",
    details:
      "Message begins / Start of work / New message (Starting signal that precedes every transmission session. Sometimes written as ct.)",
  },
  {
    prosign: "<SK>",
    voice: "OVER AND OUT",
    code: "...-.-",
    details:
      "End of contact / End of work / Line is now free / Frequency no longer in use (Ending signal that follows every transmission session. Occasionally written va.)",
  },
  {
    prosign: "DE ...",
    voice: "[THIS IS] FROM",
    code: "-.. .",
    details:
      "Used to precede the name or other identification of the calling station (Morse abbreviation).",
  },
  {
    prosign: "NIL",
    voice: "NOTHING HEARD",
    code: "-. .. .-..",
    details:
      'General-purpose response to any request or inquiry for which the answer is "nothing" or "none" or "not available". Also means "I have no messages for you."',
  },
  {
    prosign: "CL",
    voice: "CLOSING",
    code: "-.-. .-..",
    details: "Announcing station shutdown.",
  },
  {
    prosign: "CQ",
    voice: "CALLING",
    code: "-.-. --.-",
    details: "General call to any station.",
  },
  {
    prosign: "CP ... ...",
    voice: "CALLING FOR",
    code: "-.-. .--.",
    details: "Specific call to two or more named stations.",
  },
  {
    prosign: "CS ...",
    voice: "CALLING STATION",
    code: "-.-. ...",
    details: "Specific call to exactly one named station.",
  },
  {
    prosign: "CS?",
    voice: "WHO?",
    code: "-.-. ... ..--..",
    details:
      "What is the name or identity signal of your station? In many contexts, the question mark is optional.",
  },
  {
    prosign: "WA ...",
    voice: "WORD AFTER",
    code: ".-- .-",
    details: "",
  },
  {
    prosign: "WB ...",
    voice: "WORD BEFORE",
    code: ".-- -...",
    details: "",
  },
  {
    prosign: "AA ...",
    voice: "ALL AFTER",
    code: "-. -.",
    details:
      "The portion of the message to which I refer is all that follows the text ...",
  },
  {
    prosign: "AB ...",
    voice: "ALL BEFORE",
    code: "-. -...",
    details:
      "The portion of the message to which I refer is all that precedes the text ...",
  },
  {
    prosign: "BN ... ...",
    voice: "ALL BETWEEN",
    code: "-... -.",
    details:
      "The portion of the message to which I refer is all that falls between ... and ...",
  },
  {
    prosign: "C",
    voice: "CORRECT / YES / AFFIRMATIVE / CONFIRM",
    code: "-.-.",
    details: 'Answer to prior question is "yes".',
  },
  {
    prosign: "N",
    voice: "NO / NEGATIVE",
    code: "-.",
    details: 'Answer to prior question is "no".',
  },
  {
    prosign: "ZWF ...",
    voice: "WRONG",
    code: "--.. .-- ..-.",
    details: "Your last transmission was wrong. The correct version is ...",
  },
  {
    prosign: "QTR?",
    voice: "REQUEST TIME CHECK",
    code: "--.- - .-. ..--..",
    details:
      "Time-check request. / What is the correct time? (Time is always UTC, unless explicitly requested otherwise, e.g. qtr hst ?)",
  },
  {
    prosign: "QTR ...",
    voice: "TIME IS",
    code: "--.- - .-.",
    details: "The following is the correct UTC in HHMM 24 hour format",
  },
  {
    prosign: "BK",
    voice: "BREAK-IN",
    code: "-... -.-",
    details:
      "Signal used to interrupt a transmission already in progress. In military networks ---- (TTTT) is used instead.",
  },
  {
    prosign: "CFM",
    voice: "CONFIRM / I ACKNOWLEDGE",
    code: "-.-. ..-. --",
    details: "Message received. (Same as R.)",
  },
  {
    prosign: "WX ...",
    voice: "WEATHER IS",
    code: ".-- -..-",
    details: "Weather report follows.",
  },
  {
    prosign: "INTERCO",
    voice: "INTERCO",
    code: ".. -. - . .-. -.- ---",
    details: "International Code of Signals groups follow.",
  },
];
