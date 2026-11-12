import { describe, expect, it } from "vitest";
import { buildSchedule, scheduleToVibration } from "./timing";
import {
  classifyGap,
  decodeChar,
  gapDurations,
  KeyEvent,
  PressClassifier,
  scoreTiming,
} from "./decoder";

describe("buildSchedule", () => {
  it("lays out A (.-) as dit, 1-unit gap, dah", () => {
    expect(buildSchedule(".-", 100)).toEqual({
      tones: [
        { start: 0, duration: 100 },
        { start: 200, duration: 300 },
      ],
      duration: 500,
    });
  });

  it("uses 3-unit letter gaps and 7-unit word gaps", () => {
    // "E E" -> ". / ." : 1 + (3 + 7 + 3) + 1
    const { tones, duration } = buildSchedule(". / .", 100);
    expect(tones[1].start).toBe(1400);
    expect(duration).toBe(1500);

    expect(buildSchedule(". .", 100).tones[1].start).toBe(400);
  });

  it("stretches only the gaps between characters for Farnsworth", () => {
    const { tones } = buildSchedule(".- .", 100, 2);
    expect(tones[1].start).toBe(200); // inside the character: unchanged
    expect(tones[2].start).toBe(500 + 600); // 3 units x 2
  });

  it("converts to a vibration pattern", () => {
    expect(scheduleToVibration(buildSchedule(".-", 100))).toEqual([
      100, 100, 300,
    ]);
  });
});

describe("decodeChar", () => {
  it("decodes known codes and rejects unknown ones", () => {
    expect(decodeChar("-.-")).toBe("K");
    expect(decodeChar("...---...")).toBeUndefined();
  });
});

describe("PressClassifier", () => {
  it("splits dits and dahs at two units by default", () => {
    const c = new PressClassifier(100);
    expect(c.classify(90)).toBe(".");
    expect(c.classify(310)).toBe("-");
    expect(new PressClassifier(100).classify(210)).toBe("-");
  });

  it("follows a sender who keys slower than the set speed", () => {
    const c = new PressClassifier(100);
    // Sender's real unit is ~150ms: dits 150, dahs 450
    for (let i = 0; i < 6; i++) {
      c.classify(150);
      c.classify(450);
    }
    // A slightly long dit (230ms) would be a dah at the nominal threshold
    expect(c.threshold).toBeGreaterThan(230);
    expect(c.classify(230)).toBe(".");
  });

  it("never drifts far from the configured speed", () => {
    const c = new PressClassifier(100);
    for (let i = 0; i < 20; i++) {
      c.classify(190);
      c.classify(600);
    }
    expect(c.threshold).toBeLessThanOrEqual(320);
  });
});

describe("gaps", () => {
  it("always places the word break after the character break", () => {
    const { charBreak, wordBreak } = gapDurations(80, 1);
    expect(wordBreak).toBeGreaterThan(charBreak);
    expect(gapDurations(80, 2).wordBreak).toBe(80 * 7 * 2);
  });

  it("classifies silences", () => {
    expect(classifyGap(100, 100)).toBe("element");
    expect(classifyGap(300, 100)).toBe("char");
    expect(classifyGap(700, 100)).toBe("word");
  });
});

describe("scoreTiming", () => {
  // Builds key events from a schedule, optionally distorting element lengths
  function keyed(morse: string, unit: number, stretch = (d: number) => d) {
    return buildSchedule(morse, unit).tones.map(
      (t): KeyEvent => ({ down: t.start, up: t.start + stretch(t.duration) }),
    );
  }

  it("gives a perfect score to perfect timing, at any speed", () => {
    expect(scoreTiming(keyed(".--. .- .-. .. ...", 80), 80).score).toBe(100);
    expect(scoreTiming(keyed(".--. .- .-. .. ...", 110), 80).score).toBe(100);
  });

  it("marks down dahs that are too short", () => {
    const sloppy = keyed(".--. .- .-. .. ...", 80, (d) => (d > 100 ? 170 : d));
    const result = scoreTiming(sloppy, 80);
    expect(result.score).toBeLessThan(80);
    expect(result.ratio).toBeCloseTo(170 / 80);
  });
});
