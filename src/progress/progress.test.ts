import { describe, expect, it } from "vitest";
import {
  advanceLesson,
  buildLesson,
  charMastery,
  defaultProgress,
  knownCount,
  lessonChars,
  normalizeProgress,
  recordAttempt,
  streak,
  weightedOrder,
  wordsFromChars,
} from "./progress";

const day = (s: string) => new Date(`${s}T12:00:00`);

// Deterministic pseudo-random numbers for the tests
function seeded(seed = 1) {
  let x = seed;
  return () => {
    x = (x * 16807) % 2147483647;
    return x / 2147483647;
  };
}

describe("recordAttempt", () => {
  it("moves a character from new to learning to known", () => {
    let p = defaultProgress;
    expect(charMastery(p, "send", "K")).toBe("new");

    p = recordAttempt(p, "send", "k", true);
    expect(charMastery(p, "send", "K")).toBe("learning");

    for (let i = 0; i < 8; i++) p = recordAttempt(p, "send", "K", true);
    expect(charMastery(p, "send", "K")).toBe("known");
    expect(charMastery(p, "receive", "K")).toBe("new");
    expect(knownCount(p, ["K", "M"])).toBe(1);
  });

  it("drops back to learning after a run of mistakes", () => {
    let p = defaultProgress;
    for (let i = 0; i < 10; i++) p = recordAttempt(p, "receive", "M", true);
    for (let i = 0; i < 3; i++) p = recordAttempt(p, "receive", "M", false);
    expect(charMastery(p, "receive", "M")).toBe("learning");
  });

  it("logs each practice day once", () => {
    let p = recordAttempt(defaultProgress, "send", "K", true, day("2026-11-10"));
    p = recordAttempt(p, "send", "K", true, day("2026-11-10"));
    p = recordAttempt(p, "send", "K", true, day("2026-11-11"));
    expect(p.days).toEqual(["2026-11-10", "2026-11-11"]);
  });
});

describe("streak", () => {
  const days = ["2026-11-08", "2026-11-10", "2026-11-11", "2026-11-12"];

  it("counts consecutive days up to today", () => {
    expect(streak(days, day("2026-11-12"))).toBe(3);
  });

  it("still counts if today hasn't been practised yet", () => {
    expect(streak(days, day("2026-11-13"))).toBe(3);
  });

  it("resets after a missed day", () => {
    expect(streak(days, day("2026-11-14"))).toBe(0);
  });
});

describe("lessons", () => {
  it("starts with K and M", () => {
    expect(lessonChars(2)).toEqual(["K", "M"]);
    expect(lessonChars(0)).toEqual(["K", "M"]);
  });

  it("unlocks the next character at 90% and not below", () => {
    expect(advanceLesson(defaultProgress, "send", 89).unlocked).toBeUndefined();

    const { progress, unlocked } = advanceLesson(defaultProgress, "send", 90);
    expect(unlocked).toBe("R");
    expect(progress.lesson).toEqual({ send: 3, receive: 2 });
  });

  it("builds rounds from the lesson's characters only", () => {
    const words = ["mark", "arm", "sum", "rum", "mars", "ram", "us", "musk", "zebra"];
    const set = buildLesson(6, {}, words, 6, seeded());
    const allowed = new Set(lessonChars(6));

    expect(set).toHaveLength(6);
    set.forEach((item) =>
      [...item].forEach((c) => expect(allowed.has(c)).toBe(true)),
    );
    expect(set.join("")).toContain("A"); // the newest character
  });

  it("finds words spelt with known letters", () => {
    expect(wordsFromChars(["arm", "zebra", "a"], ["A", "R", "M"])).toEqual([
      "arm",
    ]);
  });
});

describe("weightedOrder", () => {
  it("tends to put weak characters first", () => {
    const stats = {
      A: { attempts: 20, correct: 20, score: 1 },
      B: { attempts: 20, correct: 2, score: 0.1 },
    };
    const random = seeded(7);
    let weakFirst = 0;

    for (let i = 0; i < 200; i++) {
      if (weightedOrder(["A", "B"], stats, random)[0] === "B") weakFirst++;
    }
    expect(weakFirst).toBeGreaterThan(130);
  });
});

describe("normalizeProgress", () => {
  it("repairs missing or invalid stored data", () => {
    expect(normalizeProgress(null)).toEqual(defaultProgress);
    expect(normalizeProgress({ lesson: { send: 999 } }).lesson).toEqual({
      send: 40,
      receive: 2,
    });
  });
});
