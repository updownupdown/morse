import { alphaToMorse, morseToAlpha } from "../data/alphaToMorse";
import {
  classifyGap,
  KeyEvent,
  PressClassifier,
  scoreTiming,
  TimingScore,
} from "../morse/decoder";

export type Keying = {
  // Dits and dahs only, e.g. "...---..."
  symbols: string;
  // What it reads as, judged by the sender's own pace
  text: string;
  timing: TimingScore;
};

// Reads raw key presses back as Morse, and scores their rhythm
export function readKeying(events: KeyEvent[], unitMs: number): Keying {
  const timing = scoreTiming(events, unitMs);
  const unit =
    timing.ditMs ?? (timing.dahMs !== undefined ? timing.dahMs / 3 : unitMs);

  const classifier = new PressClassifier(unitMs);
  let morse = "";
  let symbols = "";

  events.forEach((event, i) => {
    if (i > 0) {
      const gap = classifyGap(event.down - events[i - 1].up, unit);
      if (gap === "char") morse += " ";
      if (gap === "word") morse += " / ";
    }
    const symbol = classifier.classify(event.up - event.down);
    morse += symbol;
    symbols += symbol;
  });

  return { symbols, text: morseToAlpha(morse), timing };
}

// The dits and dahs of a phrase, without its gaps
export const symbolsOf = (phrase: string) =>
  alphaToMorse(phrase).replace(/[^.-]/g, "");

// A sentence on the most useful thing to work on
export function timingAdvice(timing: TimingScore) {
  if (timing.ratio !== undefined && timing.ratio < 2.4)
    return "Hold your dahs longer: three times a dit.";
  if (timing.ratio !== undefined && timing.ratio > 3.8)
    return "Your dahs are long. Aim for three times a dit.";
  if (timing.gapError > timing.elementError && timing.gapError > 0.25)
    return "Even out the gaps: short inside a letter, longer between letters.";
  if (timing.elementError > 0.25)
    return "Keep each dit, and each dah, the same length as the last.";
  return "Steady and well proportioned.";
}
