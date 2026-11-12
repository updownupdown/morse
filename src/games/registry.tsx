import { GameDef, GameGroup } from "./types";
import { LV3 } from "./common";
import { Rain } from "./Rain";
import { TimeAttack } from "./TimeAttack";
import { Echo } from "./Echo";
import { Intercept } from "./Intercept";
import { interceptCases } from "./interceptCases";
import { SoundAlikes } from "./SoundAlikes";
import { SteadyHand } from "./SteadyHand";
import { Mordle } from "./Mordle";
import { Snowman } from "./Snowman";
import { Memory } from "./Memory";
import { Trivia } from "./Trivia";

const rain: GameDef = {
  id: "rain",
  name: "Morse Rain",
  desc: "Letters fall. Key each one before it lands.",
  trains: "Sending",
  levels: LV3,
  help: [
    "Key the code for a falling letter to clear it. The lowest match goes first.",
    "Three letters reaching the ground ends the game.",
    "It speeds up every ten catches, and short words start to fall.",
    "Easy uses the commonest letters and shows their codes. Hard adds numbers.",
  ],
  scoreUnit: "caught",
  component: Rain,
};

const timeAttack: GameDef = {
  id: "time-attack",
  name: "Time Attack",
  desc: "Sixty seconds. As many letters as you can.",
  trains: "Both",
  levels: [
    ["key", "On the key"],
    ["ear", "By ear"],
  ],
  levelName: "Mode",
  help: [
    "On the key: a letter appears, and you key its code.",
    "By ear: a code plays, and you type its letter. Space plays it again.",
    "Letters you find hard come up more often.",
  ],
  scoreUnit: "letters",
  component: TimeAttack,
};

const echo: GameDef = {
  id: "echo",
  name: "Echo",
  desc: "The station sends a run of letters. Key it back, one longer each round.",
  trains: "Both",
  levels: [
    ["easy", "Shown"],
    ["hard", "By ear"],
  ],
  levelName: "Mode",
  help: [
    "Listen to the sequence, then key it back in order.",
    "Each round adds one more letter. One wrong letter ends the game.",
    "Shown displays the letters as they play. By ear leaves you to copy them.",
  ],
  scoreUnit: "letters in a row",
  component: Echo,
};

const intercept: GameDef = {
  id: "intercept",
  name: "Intercept",
  desc: "Copy incoming messages word by word and follow the story.",
  trains: "Receiving",
  levels: interceptCases.map((c) => [c.id, c.name]),
  levelName: "Case",
  help: [
    "Each word of the message plays in Morse. Type it letter by letter.",
    "Space, or the button, plays the word again as often as you like.",
    "A clean copy earns three stars. Slips cost stars, never the message.",
    "The Cipher Room includes numbers.",
  ],
  scoreUnit: "stars",
  component: Intercept,
};

const soundAlikes: GameDef = {
  id: "sound-alikes",
  name: "Sound-alikes",
  desc: "Tell apart the letters that are easy to confuse by ear.",
  trains: "Receiving",
  levels: LV3,
  help: [
    "A code plays. Pick which of the similar letters it was.",
    "Their codes are shown once you've answered, so you can compare.",
    "Easy offers pairs, such as E and I. Medium offers larger groups. Hard mixes in numbers.",
    "Each game is twenty rounds.",
  ],
  scoreUnit: "right",
  component: SoundAlikes,
};

const steadyHand: GameDef = {
  id: "steady-hand",
  name: "Steady Hand",
  desc: "Key a phrase and be scored on rhythm, not speed.",
  trains: "Sending",
  levels: [
    ["easy", "Short"],
    ["medium", "Words"],
    ["hard", "Phrases"],
  ],
  levelName: "Length",
  help: [
    "Key the phrase on the single key: hold it, or use the full stop or space bar.",
    "A dah should last three dits. Gaps are one dit inside a letter, three between letters and seven between words.",
    "Your presses are drawn against the ideal, with a score out of 100.",
    "Go at any pace. Only evenness and proportion count.",
  ],
  scoreUnit: "out of 100",
  component: SteadyHand,
};

const mordle: GameDef = {
  id: "mordle",
  name: "Mordle",
  desc: "Find the hidden word in six guesses, keyed in Morse.",
  trains: "Sending",
  levels: [
    ["5", "5 letters"],
    ["4", "4 letters"],
  ],
  levelName: "Word length",
  help: [
    "Key a word letter by letter, then press Guess.",
    "A filled square is the right letter in the right place. An outlined one is in the word, but elsewhere. A dim one is not in the word.",
    "You have six guesses. Fewer is better.",
  ],
  scoreUnit: "guesses",
  lowerIsBetter: true,
  component: Mordle,
};

const snowman: GameDef = {
  id: "snowman",
  name: "Snowman",
  desc: "Guess words a letter at a time before the snowman melts.",
  trains: "Both",
  levels: LV3,
  help: [
    "Key a letter to guess it. A wrong letter melts part of the snowman.",
    "Solve a word to win a part back and move on to the next.",
    "Hear a letter plays the code of a missing letter, twice per word: copy it, then key it.",
    "Words get longer on Medium and Hard.",
  ],
  scoreUnit: "words",
  component: Snowman,
};

const memory: GameDef = {
  id: "memory",
  name: "Memory",
  desc: "Turn over cards to pair each letter with its code.",
  trains: "Receiving",
  levels: [
    ["easy", "6 pairs"],
    ["medium", "8 pairs"],
    ["hard", "By ear"],
  ],
  help: [
    "Turn over two cards. A letter and its code make a pair.",
    "Code cards play as they turn.",
    "By ear hides the dits and dahs, so you match on sound alone.",
    "Fewer moves is better.",
  ],
  scoreUnit: "moves",
  lowerIsBetter: true,
  component: Memory,
};

const trivia: GameDef = {
  id: "trivia",
  name: "Trivia and Riddles",
  desc: "Answer in Morse. Five questions a round.",
  trains: "Sending",
  levels: [
    ["trivia", "Trivia"],
    ["riddles", "Riddles"],
  ],
  levelName: "Questions",
  help: [
    "Read the question and key its one-word answer, letter by letter.",
    "Show a letter reveals the next letter and its code, at the cost of a star.",
    "Each answer is worth up to three stars.",
  ],
  scoreUnit: "stars",
  component: Trivia,
};

export const gameGroups: GameGroup[] = [
  { title: "Quick fire", games: [rain, timeAttack, echo, soundAlikes] },
  { title: "Skill", games: [steadyHand, memory] },
  {
    title: "Words and stories",
    games: [intercept, mordle, snowman, trivia],
  },
];

export const games: GameDef[] = gameGroups.flatMap((group) => group.games);
