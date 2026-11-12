import { describe, expect, it } from "vitest";
import { alphaToMorseDict } from "../data/alphaToMorse";
import { buildSchedule } from "../morse/timing";
import { alphaToMorse } from "../data/alphaToMorse";
import { letterMarks, markGuess } from "./mordle";
import { readKeying, symbolsOf, timingAdvice } from "./steady";
import { soundAlikeGroups } from "./SoundAlikes";
import { riddles, trivia } from "./quizData";
import { interceptCases } from "./interceptCases";
import { games } from "./registry";

describe("markGuess", () => {
  it("marks hits, nears and misses", () => {
    expect(markGuess("CRANE", "CARGO")).toEqual([
      "hit",
      "near",
      "near",
      "miss",
      "miss",
    ]);
  });

  it("only marks a repeated letter as near while the answer has spares", () => {
    // One E in the answer, already matched in place
    expect(markGuess("EERIE", "THREE")).toEqual([
      "near",
      "miss",
      "hit",
      "miss",
      "hit",
    ]);
  });

  it("keeps the best mark per letter", () => {
    const marks = letterMarks(["CRANE", "CARGO"], "CARGO");
    expect(marks.C).toBe("hit");
    expect(marks.R).toBe("hit");
    expect(marks.N).toBe("miss");
  });
});

describe("readKeying", () => {
  // Perfect keying of a phrase at the given unit
  const key = (phrase: string, unit: number) =>
    buildSchedule(alphaToMorse(phrase), unit, 1).tones.map((tone) => ({
      down: 1000 + tone.start,
      up: 1000 + tone.start + tone.duration,
    }));

  it("reads perfect keying back and scores it highly", () => {
    const keying = readKeying(key("SOS", 80), 80);
    expect(keying.symbols).toBe(symbolsOf("SOS"));
    expect(keying.text).toBe("SOS");
    expect(keying.timing.score).toBeGreaterThanOrEqual(95);
    expect(timingAdvice(keying.timing)).toMatch(/Steady/);
  });

  it("judges by the sender's own pace, not the setting", () => {
    const keying = readKeying(key("ON AIR", 130), 80);
    expect(keying.text).toBe("ON AIR");
    expect(keying.timing.score).toBeGreaterThanOrEqual(90);
  });

  it("marks down short dahs", () => {
    const events = key("TOM", 80).map((e) => ({
      down: e.down,
      up: e.down + (e.up - e.down) * 0.6,
    }));
    const keying = readKeying(events, 80);
    expect(keying.timing.score).toBeLessThan(90);
  });
});

describe("game data", () => {
  const known = (text: string) =>
    text.split("").every((c) => c === " " || alphaToMorseDict[c] !== undefined);

  it("uses only characters that have a code", () => {
    Object.values(soundAlikeGroups)
      .flat()
      .forEach((group) => expect(known(group)).toBe(true));

    [...trivia, ...riddles].forEach(({ a }) => {
      expect(a).toMatch(/^[A-Z]+$/);
    });

    interceptCases.forEach((c) =>
      c.missions.forEach((m) => {
        expect(m.message).toMatch(/^[A-Z0-9 ]+$/);
        expect(known(m.message)).toBe(true);
      }),
    );
  });

  it("gives every game a unique id, levels and help", () => {
    expect(new Set(games.map((g) => g.id)).size).toBe(games.length);
    games.forEach((game) => {
      expect(game.levels.length).toBeGreaterThan(0);
      expect(game.help.length).toBeGreaterThan(0);
    });
  });
});
