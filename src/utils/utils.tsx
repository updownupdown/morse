interface Options {
  dash: string;
  dot: string;
  space: string;
  separator: string;
  invalid: string;
  priority: number;
  unit: number;
  fwUnit: number;
  // oscillator: Oscillator
}

const gaps = {
  short: 1,
  long: 3,
  gapElements: 1,
  gapLetters: 3,
  gapWords: 7,
};

export type Timing = [gain: number, time: number];

export const getGainTimings = (
  morse: string,
  volume: number,
  unitTime: number,
) => {
  console.log({ unitTime });

  const timing = {
    short: unitTime * gaps.short,
    long: unitTime * gaps.long,
    gapElements: unitTime * gaps.gapElements,
    gapLetters: unitTime * gaps.gapLetters,
    gapWords: unitTime * gaps.gapWords,
  };

  console.log({ timing });

  let totalTime = 0;
  const gainValues: Timing[] = [[0, totalTime]];

  const gainValue = (duration: number, sound: boolean) => {
    gainValues.push([sound ? volume : 0, totalTime]);
    totalTime += duration * timing.short;
  };

  Array.from(morse).forEach((symbol) => {
    if (symbol === "/") {
      gainValue(timing.gapWords, false);
    } else if (symbol === " ") {
      gainValue(timing.gapLetters, false);
    } else if (symbol === ".") {
      gainValue(timing.short, true);
      gainValue(timing.short, false);
    } else if (symbol === "-") {
      gainValue(timing.long, true);
      gainValue(timing.short, false);
    }
  });

  return { gainValues, totalTime };
};
