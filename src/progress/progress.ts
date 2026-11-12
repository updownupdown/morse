// What the app remembers about how you're doing. Pure functions over a
// plain object, which lives in localStorage (see ProgressContext).

export type Skill = "send" | "receive";

export type CharStat = {
  attempts: number;
  correct: number;
  // Recent accuracy, 0-1; newer attempts weigh more
  score: number;
};

export type Mastery = "new" | "learning" | "known";

export type Progress = {
  send: Record<string, CharStat>;
  receive: Record<string, CharStat>;
  // How many characters of the Koch order are unlocked, per skill
  lesson: Record<Skill, number>;
  // Days with any practice, as YYYY-MM-DD, oldest first
  days: string[];
  // Best scores, by game or drill id
  bests: Record<string, number>;
};

// The Koch method's usual order: start with two characters at full speed,
// add one more each time accuracy passes 90%
export const kochOrder = "KMRSUAPTLOWI.NJEF0Y,VG5/Q9ZH38B?427C1D6X".split("");

export const minLesson = 2;
export const maxLesson = kochOrder.length;
export const lessonPassAccuracy = 90;

export const defaultProgress: Progress = {
  send: {},
  receive: {},
  lesson: { send: minLesson, receive: minLesson },
  days: [],
  bests: {},
};

// Fills in anything missing from stored data (older versions, bad edits)
export function normalizeProgress(stored: unknown): Progress {
  const p = (stored ?? {}) as Partial<Progress>;
  const lesson = (skill: Skill) =>
    Math.min(
      Math.max(Math.round(Number(p.lesson?.[skill]) || minLesson), minLesson),
      maxLesson,
    );

  return {
    send: p.send ?? {},
    receive: p.receive ?? {},
    lesson: { send: lesson("send"), receive: lesson("receive") },
    days: Array.isArray(p.days) ? p.days : [],
    bests: p.bests ?? {},
  };
}

const scoreRate = 0.2;
const knownAttempts = 8;
const knownScore = 0.85;

export function dayKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function recordAttempt(
  progress: Progress,
  skill: Skill,
  char: string,
  correct: boolean,
  today: Date = new Date(),
): Progress {
  const key = char.toUpperCase();
  const prev = progress[skill][key] ?? { attempts: 0, correct: 0, score: 0 };
  const hit = correct ? 1 : 0;

  const stat: CharStat = {
    attempts: prev.attempts + 1,
    correct: prev.correct + hit,
    // The first attempt sets the score outright
    score:
      prev.attempts === 0 ? hit : prev.score + (hit - prev.score) * scoreRate,
  };

  const day = dayKey(today);
  const days =
    progress.days[progress.days.length - 1] === day
      ? progress.days
      : [...progress.days, day].slice(-400);

  return {
    ...progress,
    [skill]: { ...progress[skill], [key]: stat },
    days,
  };
}

export function mastery(stat: CharStat | undefined): Mastery {
  if (!stat || stat.attempts === 0) return "new";
  if (stat.attempts >= knownAttempts && stat.score >= knownScore) {
    return "known";
  }
  return "learning";
}

export function charMastery(progress: Progress, skill: Skill, char: string) {
  return mastery(progress[skill][char.toUpperCase()]);
}

// A character counts as known once it's known for either skill
export function knownCount(progress: Progress, chars: string[]) {
  return chars.filter(
    (char) =>
      charMastery(progress, "send", char) === "known" ||
      charMastery(progress, "receive", char) === "known",
  ).length;
}

// Consecutive days of practice ending today (or yesterday, so the streak
// doesn't read as broken before today's session)
export function streak(days: string[], today: Date = new Date()) {
  const set = new Set(days);
  const cursor = new Date(today);

  if (!set.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let count = 0;
  while (set.has(dayKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

// ========== Lessons ========== //
export function lessonChars(level: number) {
  return kochOrder.slice(0, Math.min(Math.max(level, minLesson), maxLesson));
}

// The character the next lesson would add, if any
export function nextLessonChar(level: number): string | undefined {
  return kochOrder[level];
}

export function advanceLesson(
  progress: Progress,
  skill: Skill,
  accuracy: number,
): { progress: Progress; unlocked: string | undefined } {
  const level = progress.lesson[skill];

  if (accuracy < lessonPassAccuracy || level >= maxLesson) {
    return { progress, unlocked: undefined };
  }

  return {
    progress: {
      ...progress,
      lesson: { ...progress.lesson, [skill]: level + 1 },
    },
    unlocked: kochOrder[level],
  };
}

// ========== Adaptive picking ========== //
// Weak and unseen characters come up more often
export function charWeight(stat: CharStat | undefined) {
  if (!stat || stat.attempts === 0) return 3;
  return 1 + 3 * (1 - stat.score);
}

// Weighted order without repeats: weak characters tend to come first
export function weightedOrder(
  chars: string[],
  stats: Record<string, CharStat>,
  random: () => number = Math.random,
) {
  return chars
    .map((char) => ({
      char,
      // Efraimidis-Spirakis: larger weights give keys closer to 1
      key: Math.pow(random(), 1 / charWeight(stats[char.toUpperCase()])),
    }))
    .sort((a, b) => b.key - a.key)
    .map(({ char }) => char);
}

export function pickWeighted(
  chars: string[],
  stats: Record<string, CharStat>,
  random: () => number = Math.random,
  boost?: string,
) {
  const weights = chars.map(
    (char) => charWeight(stats[char.toUpperCase()]) * (char === boost ? 2 : 1),
  );
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = random() * total;

  for (let i = 0; i < chars.length; i++) {
    roll -= weights[i];
    if (roll < 0) return chars[i];
  }
  return chars[chars.length - 1];
}

// Words that can be spelt with these characters alone
export function wordsFromChars(words: string[], chars: string[]) {
  const allowed = new Set(chars.map((c) => c.toUpperCase()));
  return words.filter(
    (word) =>
      word.length > 1 && [...word.toUpperCase()].every((c) => allowed.has(c)),
  );
}

// A round for a lesson: mostly groups of characters weighted towards the
// weak and the newest, with real words mixed in once enough can be spelt
export function buildLesson(
  level: number,
  stats: Record<string, CharStat>,
  words: string[],
  groups: number,
  random: () => number = Math.random,
) {
  const chars = lessonChars(level);
  const newest = chars[chars.length - 1];
  const spellable = wordsFromChars(words, chars);
  const useWords = spellable.length >= 8;
  const set: string[] = [];

  for (let i = 0; i < groups; i++) {
    if (useWords && i % 2 === 1) {
      set.push(spellable[Math.floor(random() * spellable.length)].toUpperCase());
      continue;
    }

    let group = "";
    for (let j = 0; j < 5; j++) {
      group += pickWeighted(chars, stats, random, newest);
    }
    set.push(group);
  }

  // The newest character always appears at least once
  if (!set.some((item) => item.includes(newest))) {
    set[0] = newest + set[0].slice(1);
  }

  return set;
}
