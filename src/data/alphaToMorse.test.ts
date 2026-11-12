import { describe, expect, it } from "vitest";
import {
  alphaToMorse,
  calculateMorseUnitLength,
  morseToAlpha,
  sanitizeMorse,
} from "./alphaToMorse";
import { calculateWPM } from "../utils/utils";

describe("alphaToMorse", () => {
  it("separates letters with spaces and words with slashes", () => {
    expect(alphaToMorse("A DOG")).toBe(".- / -.. --- --.");
  });

  it("is case-insensitive", () => {
    expect(alphaToMorse("sos")).toBe("... --- ...");
  });
});

describe("morseToAlpha", () => {
  it("decodes a single word", () => {
    expect(morseToAlpha("... --- ...")).toBe("SOS");
  });

  it("keeps the space before the last word", () => {
    expect(morseToAlpha(".- / -...")).toBe("A B");
    expect(morseToAlpha(".- / -... / -.-.")).toBe("A B C");
  });

  it("ignores leading and trailing word breaks", () => {
    expect(morseToAlpha("/ .- / -... /")).toBe("A B");
  });

  it("round-trips text", () => {
    const text = "THE QUICK BROWN FOX, 123!";
    expect(morseToAlpha(alphaToMorse(text))).toBe(text);
  });
});

describe("sanitizeMorse", () => {
  it("strips invalid characters and normalises breaks", () => {
    expect(sanitizeMorse(".-x//-...")).toBe(".- / -...");
  });
});

describe("timing", () => {
  it("counts PARIS as 43 units (50 with the trailing word gap)", () => {
    expect(calculateMorseUnitLength(alphaToMorse("PARIS"))).toBe(43);
  });

  it("gives 1 WPM for 50 units a minute", () => {
    expect(calculateWPM(60000, 50)).toBeCloseTo(1);
  });
});
