export const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

export function getStatusColor(accuracy: number): string {
  // Clamp accuracy between 0 and 100
  const acc = Math.max(0, Math.min(accuracy, 100)) / 100;
  // status-red: #F44336, status-green: #4CAF50
  const red = { r: 244, g: 67, b: 54 };
  const green = { r: 76, g: 175, b: 80 };
  const r = Math.round(red.r + (green.r - red.r) * acc);
  const g = Math.round(red.g + (green.g - red.g) * acc);
  const b = Math.round(red.b + (green.b - red.b) * acc);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function calculateWPM(timeInMs: number, unitsSent: number) {
  const timeInSec = timeInMs / 1000;
  return (1.2 * unitsSent) / timeInSec;
}
