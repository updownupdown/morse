import { Schedule, scheduleToVibration } from "./timing";

// Morse without sound: the phone's vibration motor and a light on screen.
// Both follow the same schedule as the audio.

const lightClass = "signal-on";

export function setLight(on: boolean) {
  document.documentElement.classList.toggle(lightClass, on);
}

export function vibrate(pattern: number | number[]) {
  try {
    // Not available on iOS or most desktops
    navigator.vibrate?.(pattern);
  } catch {}
}

export const canVibrate = () =>
  typeof navigator !== "undefined" && "vibrate" in navigator;

// Flashes the light in time with a schedule; returns a function to cancel
export function flashSchedule(schedule: Schedule, leadMs: number) {
  const timers: number[] = [];

  schedule.tones.forEach((tone) => {
    timers.push(window.setTimeout(() => setLight(true), leadMs + tone.start));
    timers.push(
      window.setTimeout(
        () => setLight(false),
        leadMs + tone.start + tone.duration,
      ),
    );
  });

  return () => {
    timers.forEach((timer) => clearTimeout(timer));
    setLight(false);
  };
}

export function vibrateSchedule(schedule: Schedule) {
  vibrate(scheduleToVibration(schedule));
}
