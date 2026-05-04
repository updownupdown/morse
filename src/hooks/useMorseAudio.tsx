import { useContext, useEffect, useRef, useState } from "react";
import { MorseContext, Setting } from "../context/MorseContext";
import { unitLengths } from "../data/alphaToMorse";

// Singleton AudioContext instance
let singletonAudioContext: AudioContext | null = null;
function getAudioContext() {
  if (!singletonAudioContext) {
    singletonAudioContext = new AudioContext();
  }
  return singletonAudioContext;
}

const maxPressTime = 1200; // ms
const fadeDurationInSec = 0.02; // 20 ms
export const initCode = "init";

function beepGlow(on: boolean) {
  const beeps = document.getElementsByClassName("beep-glow");
  for (let i = 0; i < beeps.length; i++) {
    if (on) {
      beeps[i].classList.add("beep-glow--on");
    } else {
      beeps[i].classList.remove("beep-glow--on");
    }
  }
}

export function useMorseAudio() {
  const { settings, setIsPlaying, audioInitialized, setAudioInitialized } =
    useContext(MorseContext);

  const cancelPlaybackRef = useRef(false);
  // ctxRef used for type compatibility, but always points to singleton
  const ctxRef = useRef<AudioContext | null>(null);

  const [isPressed, setIsPressed] = useState(false);
  const pressTimeoutRef = useRef<number | null>(null);

  // Store oscillator and gain node for press signal
  const pressOscRef = useRef<OscillatorNode | null>(null);
  const pressGainRef = useRef<GainNode | null>(null);

  function startPress() {
    const ctx = getAudioContext();
    ctxRef.current = ctx;

    if (pressOscRef.current) {
      // Already running
      return;
    }

    setIsPlaying("symbol");

    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = "sine";
    o.frequency.value = settings[Setting.Frequency];
    o.connect(g);
    g.connect(ctx.destination);

    const now = ctx.currentTime;

    // Fade in
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(
      settings[Setting.Volume] / 100,
      now + fadeDurationInSec,
    );

    o.start();

    pressOscRef.current = o;
    pressGainRef.current = g;
  }

  function stopPress() {
    setIsPlaying(undefined);

    const o = pressOscRef.current;
    const g = pressGainRef.current;

    if (o && g && ctxRef.current) {
      const ctx = ctxRef.current;
      const now = ctx.currentTime;
      // Fade out
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + fadeDurationInSec);
      o.stop(now + fadeDurationInSec);
      o.onended = () => {
        g.disconnect();
        o.disconnect();
      };
    }

    pressOscRef.current = null;
    pressGainRef.current = null;
  }

  useEffect(() => {
    if (isPressed) {
      startPress();

      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
      }

      pressTimeoutRef.current = setTimeout(() => {
        setIsPressed(false);
      }, maxPressTime);
    } else {
      stopPress();

      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
        pressTimeoutRef.current = null;
      }
    }
  }, [isPressed]);

  function playBeep(durationInMs: number, frequency: number) {
    return new Promise<void>((resolve) => {
      if (cancelPlaybackRef.current) {
        resolve();
        return;
      }

      const ctx = getAudioContext();
      ctxRef.current = ctx;

      if (!audioInitialized) {
        setAudioInitialized(true);
      }

      beepGlow(true);

      const o = ctx.createOscillator();
      const g = ctx.createGain();

      o.type = "sine";
      o.frequency.value = frequency;
      o.connect(g);
      g.connect(ctx.destination);

      const now = ctx.currentTime;

      let beepDurationInSec = (durationInMs - fadeDurationInSec * 2) / 1000; // in sec

      // Start
      g.gain.setValueAtTime(0.001, now);
      // Fade in
      g.gain.exponentialRampToValueAtTime(
        settings[Setting.Volume] / 100,
        now + fadeDurationInSec,
      );
      // Sustain
      g.gain.setValueAtTime(
        settings[Setting.Volume] / 100,
        now + beepDurationInSec,
      );
      // Fade out
      g.gain.exponentialRampToValueAtTime(
        0.0001,
        now + beepDurationInSec + fadeDurationInSec * 2,
      );

      o.start();
      o.stop(now + beepDurationInSec + fadeDurationInSec * 2);
      o.onended = () => {
        g.disconnect();
        o.disconnect();
        beepGlow(false);
        resolve();
      };

      // If cancelled during beep, stop immediately
      const checkCancel = () => {
        if (cancelPlaybackRef.current) {
          try {
            o.stop();
            beepGlow(false);
          } catch {}
          try {
            g.disconnect();
          } catch {}
          try {
            o.disconnect();
          } catch {}
          resolve();
        } else {
          requestAnimationFrame(checkCancel);
        }
      };

      checkCancel();
    });
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function stopMorse() {
    return new Promise((resolve) => {
      stopPress();

      cancelPlaybackRef.current = true;

      // Do not close the singleton AudioContext; just stop playback
      // ctxRef.current = null; // Not needed anymore

      setIsPlaying(undefined);

      setTimeout(resolve, 10);
    });
  }

  async function playMorse(morse: string) {
    // This must be at the top of the function, to allow initializing the audio instantly
    if (morse === initCode) {
      playBeep(1, 1);
      return;
    }

    await stopMorse();

    cancelPlaybackRef.current = false;
    setIsPlaying(morse.length > 1 ? "charOrWord" : "symbol");

    for (let i = 0; i < morse.length; i++) {
      if (cancelPlaybackRef.current) break;
      const symbol = morse[i];

      if (symbol === ".") {
        await playBeep(settings[Setting.UnitTime], settings[Setting.Frequency]);
      } else if (symbol === "-") {
        await playBeep(
          settings[Setting.UnitTime] * unitLengths["-"],
          settings[Setting.Frequency],
        );
      } else if (symbol === " ") {
        await sleep(
          settings[Setting.UnitTime] *
            unitLengths[" "] *
            settings[Setting.Farnsworth],
        );
      } else if (symbol === "/") {
        await sleep(
          settings[Setting.UnitTime] *
            unitLengths["/"] *
            settings[Setting.Farnsworth],
        );
      }

      // Add space after dot/dash except after last symbol
      if (
        (symbol === "." || symbol === "-") &&
        i < morse.length - 1 &&
        (morse[i + 1] === "." || morse[i + 1] === "-")
      ) {
        if (cancelPlaybackRef.current) break;
        await new Promise((res) => setTimeout(res, settings[Setting.UnitTime]));
      }
    }

    setIsPlaying(undefined);
  }

  return { playMorse, stopMorse, setIsPressed, isPressed };
}
