export type Question = { q: string; a: string };

// Answers are single words, keyed in Morse
export const trivia: Question[] = [
  { q: "The three-letter distress call, adopted in 1906.", a: "SOS" },
  { q: "The surname of the man the code is named after.", a: "MORSE" },
  { q: "The shortest letter in Morse: a single dit.", a: "E" },
  { q: "A single dah stands for this letter.", a: "T" },
  { q: "The standard word used to measure sending speed.", a: "PARIS" },
  {
    q: "The liner whose 1912 distress calls made wireless famous.",
    a: "TITANIC",
  },
  {
    q: "The inventor credited with the first transatlantic radio signal.",
    a: "MARCONI",
  },
  { q: "The machine that sent Morse along wires.", a: "TELEGRAPH" },
  { q: "A Morse operator's nickname for their sending style.", a: "FIST" },
  { q: "The short element of Morse code.", a: "DIT" },
  { q: "The long element of Morse code.", a: "DAH" },
  { q: "The hobby radio service whose members are called hams.", a: "AMATEUR" },
  { q: "The planet the Voyager probes left from.", a: "EARTH" },
  { q: "The metal in most telegraph wire.", a: "COPPER" },
  {
    q: "A lamp used to flash Morse between ships is named after him.",
    a: "ALDIS",
  },
  { q: "Number of dits in the letter H.", a: "FOUR" },
  { q: "Number of elements in every Morse digit.", a: "FIVE" },
  { q: "The ocean first crossed by a telegraph cable in 1858.", a: "ATLANTIC" },
  {
    q: "The spoken distress word that took over from SOS on voice radio.",
    a: "MAYDAY",
  },
  { q: "Morse's partner, who helped shape the code.", a: "VAIL" },
  { q: "The prosign K invites the other station to do this.", a: "SEND" },
  { q: "A long dah is this many times the length of a dit.", a: "THREE" },
  { q: "The gap between two words lasts this many units.", a: "SEVEN" },
  {
    q: "The city where the first public telegram ended its journey from Washington.",
    a: "BALTIMORE",
  },
];

export const riddles: Question[] = [
  {
    q: "I have keys but open no locks. I have space but no room.",
    a: "KEYBOARD",
  },
  { q: "The more you take, the more you leave behind.", a: "STEPS" },
  { q: "I speak without a mouth and hear without ears.", a: "ECHO" },
  { q: "I have hands but cannot clap.", a: "CLOCK" },
  { q: "I'm full of holes, yet I hold water.", a: "SPONGE" },
  { q: "I go up but never come down.", a: "AGE" },
  { q: "I have a neck but no head.", a: "BOTTLE" },
  { q: "The more of me there is, the less you see.", a: "DARK" },
  { q: "I have cities but no houses, and rivers but no water.", a: "MAP" },
  { q: "I get wetter the more I dry.", a: "TOWEL" },
  { q: "I have one eye but cannot see.", a: "NEEDLE" },
  {
    q: "I'm light as a feather, yet no one can hold me for long.",
    a: "BREATH",
  },
  { q: "I run but never walk, and have a bed but never sleep.", a: "RIVER" },
  { q: "I have teeth but cannot bite.", a: "COMB" },
  { q: "Break me and I'm more useful.", a: "EGG" },
  { q: "I follow you all day and vanish at night.", a: "SHADOW" },
  { q: "I'm always ahead of you but can never be seen.", a: "FUTURE" },
  {
    q: "I fall but never break. My partner breaks but never falls.",
    a: "NIGHT",
  },
  { q: "I have a ring but no finger.", a: "PHONE" },
  { q: "Feed me and I live. Give me a drink and I die.", a: "FIRE" },
  {
    q: "I'm taken from a mine and shut in a wooden case, yet almost everyone uses me.",
    a: "PENCIL",
  },
  { q: "I have a spine but no bones.", a: "BOOK" },
  { q: "I travel the world while staying in one corner.", a: "STAMP" },
  { q: "I can be cracked, made, told and played.", a: "JOKE" },
];
