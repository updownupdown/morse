import { alphaToMorseDict, unitLengths } from "../data/alphaToMorse";

export type MorseSymbol = "." | "-";

const morseToAlphaDict: Record<string, string> = Object.fromEntries(
  Object.entries(alphaToMorseDict).map(([char, code]) => [code, char]),
);

// "-.-" -> "K"; undefined if the code isn't a known character
export function decodeChar(code: string): string | undefined {
  return morseToAlphaDict[code];
}

// A press shorter than two units is a dit, anything longer a dah
export const defaultDitDahThreshold = 2;

// Tells dits from dahs on a straight key, and follows the sender's own
// rhythm: someone who keys a little slow or fast than the set speed still
// gets clean dits and dahs, because the threshold sits midway between
// the lengths they've actually been sending.
export class PressClassifier {
  private ditAvg: number | undefined;
  private dahAvg: number | undefined;

  constructor(
    private unitMs: number,
    private adaptRate = 0.25,
  ) {}

  setUnit(unitMs: number) {
    if (unitMs !== this.unitMs) {
      this.unitMs = unitMs;
      this.reset();
    }
  }

  reset() {
    this.ditAvg = undefined;
    this.dahAvg = undefined;
  }

  // Threshold in ms between a dit and a dah
  get threshold() {
    const nominal = this.unitMs * defaultDitDahThreshold;

    if (this.ditAvg === undefined || this.dahAvg === undefined) {
      return nominal;
    }

    // Never drift far from the configured speed
    const midpoint = (this.ditAvg + this.dahAvg) / 2;
    return Math.min(Math.max(midpoint, nominal * 0.6), nominal * 1.6);
  }

  classify(durationMs: number): MorseSymbol {
    const symbol: MorseSymbol = durationMs < this.threshold ? "." : "-";

    if (symbol === ".") {
      this.ditAvg = this.blend(this.ditAvg, durationMs);
    } else {
      // Ignore very long holds so one slip doesn't skew the average
      const capped = Math.min(durationMs, this.unitMs * 6);
      this.dahAvg = this.blend(this.dahAvg, capped);
    }

    return symbol;
  }

  private blend(avg: number | undefined, value: number) {
    return avg === undefined
      ? value
      : avg + (value - avg) * this.adaptRate;
  }
}

// How long to wait after the last element before deciding...
export function gapDurations(unitMs: number, farnsworth = 1) {
  const charBreak = unitMs * unitLengths.autoCharBreak;
  // The word gap is measured from the end of the last element too,
  // so it always lands after the character break
  const wordBreak = Math.max(
    unitMs * unitLengths["/"] * farnsworth,
    charBreak + unitMs,
  );

  return {
    // ...that the character is finished
    charBreak,
    // ...that the word is finished
    wordBreak,
  };
}

export type Gap = "element" | "char" | "word";

// Classifies a silence between two elements, in units
export function classifyGap(gapMs: number, unitMs: number): Gap {
  const units = gapMs / unitMs;
  if (units < 2) return "element";
  if (units < 5) return "char";
  return "word";
}

export type TimingScore = {
  // 0-100: how close the elements and gaps were to ideal 1:3 / 1:3:7 ratios
  score: number;
  ditMs: number | undefined;
  dahMs: number | undefined;
  // dah / dit; ideal is 3
  ratio: number | undefined;
  // Average relative error per category (0 = perfect)
  elementError: number;
  gapError: number;
};

export type KeyEvent = { down: number; up: number };

// Scores a keyed phrase on rhythm rather than on what was sent.
// The unit is estimated from the sender's own dits, so the score reflects
// evenness and proportion, not raw speed.
export function scoreTiming(events: KeyEvent[], unitMs: number): TimingScore {
  const classifier = new PressClassifier(unitMs);
  const dits: number[] = [];
  const dahs: number[] = [];

  events.forEach((e) => {
    const duration = e.up - e.down;
    (classifier.classify(duration) === "." ? dits : dahs).push(duration);
  });

  const mean = (values: number[]) =>
    values.length === 0
      ? undefined
      : values.reduce((a, b) => a + b, 0) / values.length;

  const ditMs = mean(dits);
  const dahMs = mean(dahs);

  // Best estimate of the sender's own unit
  let unit = unitMs;
  if (ditMs !== undefined && dahMs !== undefined) {
    unit = (ditMs + dahMs / 3) / 2;
  } else if (ditMs !== undefined) {
    unit = ditMs;
  } else if (dahMs !== undefined) {
    unit = dahMs / 3;
  }

  const relError = (actual: number, ideal: number) =>
    Math.min(Math.abs(actual - ideal) / ideal, 1);

  const elementErrors = [
    ...dits.map((d) => relError(d, unit)),
    ...dahs.map((d) => relError(d, unit * 3)),
  ];

  const gapErrors: number[] = [];
  for (let i = 1; i < events.length; i++) {
    const gap = events[i].down - events[i - 1].up;
    const kind = classifyGap(gap, unit);
    const ideal = kind === "element" ? 1 : kind === "char" ? 3 : 7;
    // Long pauses between words are thinking time; don't punish them
    if (kind === "word" && gap > unit * 7) continue;
    gapErrors.push(relError(gap, unit * ideal));
  }

  const elementError = mean(elementErrors) ?? 0;
  const gapError = mean(gapErrors) ?? 0;
  const combined =
    gapErrors.length === 0 ? elementError : (elementError + gapError) / 2;

  return {
    score: Math.round(Math.max(0, 1 - combined * 1.5) * 100),
    ditMs,
    dahMs,
    ratio: ditMs !== undefined && dahMs !== undefined ? dahMs / ditMs : undefined,
    elementError,
    gapError,
  };
}
