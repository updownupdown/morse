import { GameDef, GameGroup } from "./types";
import { LV3 } from "./common";
import { Rain } from "./Rain";
import { TimeAttack } from "./TimeAttack";
import { Echo } from "./Echo";
import { Intercept } from "./Intercept";
import { interceptCases } from "./interceptCases";

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

export const gameGroups: GameGroup[] = [
  { title: "Quick fire", games: [rain, timeAttack, echo] },
  { title: "Stories and puzzles", games: [intercept] },
];

export const games: GameDef[] = gameGroups.flatMap((group) => group.games);
