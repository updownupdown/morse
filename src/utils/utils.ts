export const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

export function calculateWPM(timeInMs: number, unitsSent: number) {
  const timeInSec = timeInMs / 1000;
  return (1.2 * unitsSent) / timeInSec;
}

export function conditionalPluralize(string: string, qty: number) {
  if (qty === 1 && string.charAt(string.length - 1) === "s") {
    return string.slice(0, -1);
  } else {
    return string;
  }
}
