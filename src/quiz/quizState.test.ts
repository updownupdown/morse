import { describe, expect, it } from "vitest";
import { applyGuess, currentChar, QuizState, startQuiz } from "./quizState";
import { calculateWPM } from "../utils/utils";

const play = (state: QuizState, guesses: string, at = 1000) =>
  guesses.split("").reduce((s, g) => applyGuess(s, g, at), state);

describe("quiz state", () => {
  it("walks through letters and words to the end", () => {
    let state = startQuiz(["it", "so"], 0);
    expect(currentChar(state)).toBe("I");
    expect(state.stats.charsTotal).toBe(4);

    state = play(state, "IT");
    expect(state.wordIndex).toBe(1);
    expect(state.letterIndex).toBe(0);
    expect(state.done).toBe(false);

    state = play(state, "SO");
    expect(state.done).toBe(true);
    expect(state.stats.correct).toBe(4);
    expect(state.stats.accuracy).toBe(100);
  });

  it("counts the same wrong letter every time it is repeated", () => {
    const state = play(startQuiz(["a"], 0), "XXX");
    expect(state.stats.incorrect).toBe(3);
    expect(state.letterIndex).toBe(0);

    const after = applyGuess(state, "A", 1000);
    expect(after.stats.accuracy).toBe(25);
    expect(after.last).toMatchObject({ correct: true, firstTry: false });
  });

  it("marks a character right first time only without a miss", () => {
    const state = play(startQuiz(["ab"], 0), "A");
    expect(state.last).toMatchObject({ char: "A", firstTry: true });
    expect(state.missed).toBe(false);
  });

  it("steps over spaces inside a phrase", () => {
    let state = startQuiz(["a b"], 0);
    expect(state.stats.charsTotal).toBe(2);

    state = play(state, "A");
    expect(currentChar(state)).toBe("B");
    state = play(state, "B");
    expect(state.done).toBe(true);
  });

  it("ignores guesses once the round is over", () => {
    const done = play(startQuiz(["e"], 0), "E");
    expect(applyGuess(done, "E", 2000)).toBe(done);
  });

  it("measures speed from the units sent", () => {
    // PARIS is 50 units with its trailing word gap; 43 without
    const state = play(startQuiz(["paris"], 0), "PARIS", 60000);
    expect(state.stats.unitLength).toBe(43);
    expect(state.stats.wpm).toBeCloseTo(calculateWPM(60000, 43));
  });
});

describe("calculateWPM", () => {
  it("treats 50 units a minute as one word a minute", () => {
    expect(calculateWPM(60000, 50)).toBeCloseTo(1);
    expect(calculateWPM(60000, 1000)).toBeCloseTo(20);
  });
});
