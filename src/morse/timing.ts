import { unitLengths } from "../data/alphaToMorse";

export type Tone = {
  // Milliseconds from the start of the message
  start: number;
  duration: number;
};

export type Schedule = {
  tones: Tone[];
  // Total length in ms, not counting any trailing gap
  duration: number;
};

// Lays a whole message out on a timeline up front, so that playback can be
// handed to the audio clock in one go instead of chaining timers per beep.
// Gaps inside a character are always one unit; gaps between characters and
// words are stretched by the Farnsworth factor.
export function buildSchedule(
  morse: string,
  unitMs: number,
  farnsworth = 1,
): Schedule {
  const tones: Tone[] = [];
  let time = 0;
  let end = 0;

  for (let i = 0; i < morse.length; i++) {
    const symbol = morse[i];

    if (symbol === "." || symbol === "-") {
      const duration = unitMs * unitLengths[symbol];
      tones.push({ start: time, duration });
      time += duration;
      end = time;

      const next = morse[i + 1];
      if (next === "." || next === "-") {
        time += unitMs;
      }
    } else if (symbol === " ") {
      time += unitMs * unitLengths[" "] * farnsworth;
    } else if (symbol === "/") {
      time += unitMs * unitLengths["/"] * farnsworth;
    }
  }

  return { tones, duration: end };
}

// For the Vibration API: alternating on/off durations
export function scheduleToVibration(schedule: Schedule): number[] {
  const pattern: number[] = [];
  let cursor = 0;

  schedule.tones.forEach((tone, i) => {
    if (i !== 0) pattern.push(Math.round(tone.start - cursor));
    pattern.push(Math.round(tone.duration));
    cursor = tone.start + tone.duration;
  });

  return pattern;
}
