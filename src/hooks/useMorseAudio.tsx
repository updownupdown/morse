import { useContext, useEffect, useRef, useState } from "react";
import { Difficulty, MorseContext } from "../context/MorseContext";

export const easyFreqOffset = 50;
const maxFadeDuration = 200; // ms
const maxPressTime = 1200; // ms
const fadeDurationInSec = 0.02; // 20 ms

export function useMorseAudio() {
  const cancelPlaybackRef = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const { settings, isPlayingTone, setIsPlayingTone } =
    useContext(MorseContext);

  const [isPressed, setIsPressed] = useState(false);
  const pressTimeoutRef = useRef<number | null>(null);

  // Store oscillator and gain node for press signal
  const pressOscRef = useRef<OscillatorNode | null>(null);
  const pressGainRef = useRef<GainNode | null>(null);

  function startPress() {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }

    if (pressOscRef.current) {
      // Already running
      return;
    }

    const ctx = ctxRef.current;
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = "sine";
    o.frequency.value = settings.frequency;
    o.connect(g);
    g.connect(ctx.destination);

    const now = ctx.currentTime;
    const fadeDuration = 0.02; // 20ms

    // Fade in
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(settings.volume, now + fadeDuration);

    o.start();

    pressOscRef.current = o;
    pressGainRef.current = g;
  }

  function stopPress() {
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

  // Helper to play a single beep and return a Promise that resolves when done
  function playBeep(duration: number, frequency: number) {
    return new Promise<void>((resolve) => {
      if (cancelPlaybackRef.current) {
        resolve();
        return;
      }

      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }

      const ctx = ctxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();

      o.type = "sine";
      o.frequency.value = frequency;
      o.connect(g);
      g.connect(ctx.destination);

      const now = ctx.currentTime;

      let fadeDuration = duration / 8; // ms
      if (fadeDuration > maxFadeDuration) {
        fadeDuration = maxFadeDuration;
      }
      let beepDuration = duration - fadeDuration * 2; // ms
      beepDuration = beepDuration / 1000; // sec
      fadeDuration = fadeDuration / 1000; // sec

      // Start
      g.gain.setValueAtTime(settings.volume, now);
      // Fade in
      g.gain.exponentialRampToValueAtTime(settings.volume, now + fadeDuration);
      // Sustain
      g.gain.setValueAtTime(settings.volume, now + beepDuration);
      // Fade out
      g.gain.exponentialRampToValueAtTime(
        0.0001,
        now + beepDuration + fadeDuration,
      );

      o.start();
      o.stop(now + beepDuration + fadeDuration * 2);
      o.onended = () => {
        g.disconnect();
        o.disconnect();
        resolve();
      };

      // If cancelled during beep, stop immediately
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
    });
  }

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  function stopMorse() {
    stopPress();

    cancelPlaybackRef.current = true;

    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }

    setIsPlayingTone(false);
  }

  async function playMorse(morse: string) {
    if (isPressed || isPlayingTone) return;

    cancelPlaybackRef.current = false;
    setIsPlayingTone(true);

    const frequencyOffset =
      settings.difficulty === Difficulty.Easy ? easyFreqOffset : 0;

    for (let i = 0; i < morse.length; i++) {
      if (cancelPlaybackRef.current) break;
      const symbol = morse[i];

      if (symbol === ".") {
        await playBeep(settings.unitTime, settings.frequency + frequencyOffset);
      } else if (symbol === "-") {
        await playBeep(
          settings.unitTime * 3,
          settings.frequency - frequencyOffset,
        );
      } else if (symbol === " ") {
        await sleep(settings.unitTime * 3);
      } else if (symbol === "/") {
        await sleep(settings.unitTime * 7);
      }

      // Add space after dot/dash except after last symbol
      if (
        (symbol === "." || symbol === "-") &&
        i < morse.length - 1 &&
        (morse[i + 1] === "." || morse[i + 1] === "-")
      ) {
        if (cancelPlaybackRef.current) break;
        await new Promise((res) => setTimeout(res, settings.unitTime));
      }
    }

    setIsPlayingTone(false);
  }

  return { playMorse, stopMorse, setIsPressed, isPressed };
}
