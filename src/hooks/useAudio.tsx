import { useContext, useEffect, useRef, useState } from "react";
import { MorseContext, Setting } from "../context/MorseContext";
import { unitLengths } from "../data/alphaToMorse";
import { clamp } from "../utils/utils";

// Singleton AudioContext instance
let singletonAudioContext: AudioContext | null = null;
function getAudioContext() {
  if (!singletonAudioContext) {
    singletonAudioContext = new AudioContext();
  }
  return singletonAudioContext;
}

const maxPressTime = 1200; // ms
const fadeDurationInSec = {
  min: 0.005, // 5 ms
  max: 0.02, // 50 ms
};
export const initCode = "init";

export type IsPlaying = "symbol" | "char" | "word" | undefined;

export function useAudio() {
  const { settings } = useContext(MorseContext);

  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState<IsPlaying>(undefined);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const cancelPlaybackRef = useRef(false);
  // ctxRef used for type compatibility, but always points to singleton
  const ctxRef = useRef<AudioContext | null>(null);

  const [isPressed, setIsPressed] = useState(false);
  const pressTimeoutRef = useRef<number | null>(null);

  // Store oscillator and gain node for press signal
  const pressOscRef = useRef<OscillatorNode | null>(null);
  const pressGainRef = useRef<GainNode | null>(null);

  function startPress() {
    stopMorse();

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
      now + adjustedFadeDuration,
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
      const adjustedFadeDuration = clamp(
        settings[Setting.UnitTime] / 4,
        fadeDurationInSec.min,
        fadeDurationInSec.max,
      );

      const ctx = ctxRef.current;
      const now = ctx.currentTime;
      // Fade out
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + adjustedFadeDuration);
      o.stop(now + adjustedFadeDuration);
      o.onended = () => {
        g.disconnect();
        o.disconnect();
      };
    }

    pressOscRef.current = null;
    pressGainRef.current = null;
  }

  const adjustedFadeDuration = clamp(
    settings[Setting.UnitTime] / 4 / 1000,
    fadeDurationInSec.min,
    fadeDurationInSec.max,
  );

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

  async function playBeep(durationInMs: number, frequency: number) {
    if (cancelPlaybackRef.current) {
      return;
    }

    const ctx = getAudioContext();
    ctxRef.current = ctx;

    // Ensure AudioContext is resumed (required by browsers after user gesture)
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch (e) {
        // ignore
      }
    }

    if (!audioInitialized) {
      setAudioInitialized(true);
    }

    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = "sine";
    o.frequency.value = frequency;
    o.connect(g);
    g.connect(ctx.destination);

    const now = ctx.currentTime;
    let beepDurationInSec = (durationInMs - adjustedFadeDuration * 2) / 1000; // in sec

    // Start
    g.gain.setValueAtTime(0.001, now);
    // Fade in
    g.gain.exponentialRampToValueAtTime(
      settings[Setting.Volume] / 100,
      now + adjustedFadeDuration,
    );
    // Sustain
    g.gain.setValueAtTime(
      settings[Setting.Volume] / 100,
      now + adjustedFadeDuration + beepDurationInSec,
    );
    // Fade out
    g.gain.exponentialRampToValueAtTime(
      0.0001,
      now + beepDurationInSec + adjustedFadeDuration * 2,
    );

    o.start();
    o.stop(now + beepDurationInSec + adjustedFadeDuration * 2);

    return await new Promise<void>((resolve) => {
      const checkCancel = () => {
        if (cancelPlaybackRef.current) {
          try {
            o.stop();
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
      o.onended = () => {
        g.disconnect();
        o.disconnect();
        resolve();
      };
    });
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function stopMorse() {
    return new Promise((resolve) => {
      stopPress();
      cancelPlaybackRef.current = true;
      setIsPlaying(undefined);

      setTimeout(resolve, 10);
    });
  }

  async function playMorse(morse: string) {
    await stopMorse();

    // Always reset cancel flag before starting
    cancelPlaybackRef.current = false;

    // This must be at/near the top of the function, to allow initializing the audio instantly
    if (morse === initCode) {
      await playBeep(1, 1);
      return;
    }

    setIsPlaying(
      morse.length > 6 ? "word" : morse.length > 1 ? "char" : "symbol",
    );

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

  return {
    playMorse,
    stopMorse,
    setIsPressed,
    isPressed,
    audioInitialized,
    isPlaying,
  };
}
