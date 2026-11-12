import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { MorseContext, Setting } from "../context/MorseContext";
import { clamp } from "../utils/utils";
import { buildSchedule } from "../morse/timing";

// Singleton AudioContext instance
let singletonAudioContext: AudioContext | null = null;
function getAudioContext() {
  if (!singletonAudioContext) {
    singletonAudioContext = new AudioContext();
  }
  return singletonAudioContext;
}

const maxPressTime = 1200; // ms
// Tones fade in and out to avoid clicks
const fadeDurationInSec = {
  min: 0.005, // 5 ms
  max: 0.02, // 20 ms
};
// Small lead time so the first tone isn't clipped
const scheduleLeadInSec = 0.03;
const silence = 0.0001;

export const initCode = "init";

export type IsPlaying = "symbol" | "char" | "word" | undefined;

export type PlayOptions = {
  // Override the settings for this message only
  unitTime?: number;
  farnsworth?: number;
  frequency?: number;
};

type Voice = { osc: OscillatorNode; gain: GainNode };

function classifyPlayback(morse: string): IsPlaying {
  const chars = morse.trim().split(/[ /]+/).filter(Boolean);
  if (chars.length > 1) return "word";
  return morse.trim().length > 1 ? "char" : "symbol";
}

export function useAudio() {
  const { settings } = useContext(MorseContext);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState<IsPlaying>(undefined);

  // Scheduled playback (a whole message on the audio clock)
  const playbackRef = useRef<{
    voice: Voice;
    timer: number;
    finish: () => void;
  } | null>(null);

  // Held key (straight key)
  const [isPressed, setIsPressed] = useState(false);
  const pressTimeoutRef = useRef<number | null>(null);
  const pressVoiceRef = useRef<Voice | null>(null);

  function fadeDuration(unitTime: number) {
    return clamp(
      unitTime / 4 / 1000,
      fadeDurationInSec.min,
      fadeDurationInSec.max,
    );
  }

  function createVoice(ctx: AudioContext, frequency: number): Voice {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.value = silence;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.onended = () => {
      gain.disconnect();
      osc.disconnect();
    };

    return { osc, gain };
  }

  // Fades a voice out from wherever it is now, then stops it
  function releaseVoice(ctx: AudioContext, voice: Voice, fade: number) {
    const now = ctx.currentTime;
    const { gain, osc } = voice;

    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(gain.gain.value, silence), now);
      gain.gain.exponentialRampToValueAtTime(silence, now + fade);
      osc.stop(now + fade + 0.005);
    } catch {}
  }

  function resume(ctx: AudioContext) {
    if (ctx.state === "suspended") {
      // Required by browsers; only succeeds after a user gesture
      ctx.resume().catch(() => {});
    }
    setAudioInitialized(true);
  }

  // ========== Held key =========== //
  function startPress() {
    stopPlayback();

    if (pressVoiceRef.current) return; // Already sounding

    const ctx = getAudioContext();
    resume(ctx);

    const { Frequency, Volume, UnitTime } = settingsRef.current;
    const voice = createVoice(ctx, Frequency);
    const now = ctx.currentTime;

    voice.gain.gain.setValueAtTime(silence, now);
    voice.gain.gain.exponentialRampToValueAtTime(
      Math.max(Volume / 100, silence),
      now + fadeDuration(UnitTime),
    );
    voice.osc.start();

    pressVoiceRef.current = voice;
    setIsPlaying("symbol");
  }

  function stopPress() {
    const voice = pressVoiceRef.current;
    if (!voice) return;

    releaseVoice(
      getAudioContext(),
      voice,
      fadeDuration(settingsRef.current.UnitTime),
    );
    pressVoiceRef.current = null;
    setIsPlaying(undefined);
  }

  useEffect(() => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }

    if (isPressed) {
      startPress();

      pressTimeoutRef.current = window.setTimeout(() => {
        setIsPressed(false);
      }, maxPressTime);
    } else {
      stopPress();
    }
  }, [isPressed]);

  // ========== Scheduled playback =========== //
  function stopPlayback() {
    const playback = playbackRef.current;
    if (!playback) return;

    playbackRef.current = null;
    clearTimeout(playback.timer);
    releaseVoice(
      getAudioContext(),
      playback.voice,
      fadeDuration(settingsRef.current.UnitTime),
    );
    playback.finish();
  }

  const stopMorse = useCallback(() => {
    stopPress();
    stopPlayback();
    setIsPlaying(undefined);
  }, []);

  // Resolves when the message has finished playing, or was stopped
  const playMorse = useCallback((morse: string, options: PlayOptions = {}) => {
    stopPress();
    stopPlayback();

    const ctx = getAudioContext();
    resume(ctx);

    if (morse === initCode) {
      // Only here to unlock audio from a user gesture
      return Promise.resolve();
    }

    const current = settingsRef.current;
    const unitTime = options.unitTime ?? current.UnitTime;
    const farnsworth = options.farnsworth ?? current.Farnsworth;
    const frequency = options.frequency ?? current.Frequency;
    const volume = Math.max(current.Volume / 100, silence);

    const schedule = buildSchedule(morse, unitTime, farnsworth);
    if (schedule.tones.length === 0) {
      setIsPlaying(undefined);
      return Promise.resolve();
    }

    // One oscillator for the whole message; the gain envelope, scheduled
    // on the audio clock, shapes it into dits and dahs. Timing is then
    // sample-accurate, however busy the main thread is.
    const voice = createVoice(ctx, frequency);
    const fade = fadeDuration(unitTime);
    // A single keyed element should sound at once; a message can afford
    // a short lead so its first tone is never clipped
    const startAt =
      ctx.currentTime +
      (schedule.tones.length === 1 ? 0.005 : scheduleLeadInSec);

    voice.gain.gain.setValueAtTime(silence, ctx.currentTime);
    schedule.tones.forEach((tone) => {
      const on = startAt + tone.start / 1000;
      const off = on + tone.duration / 1000;
      // Keep very short tones audible at high speeds
      const edge = Math.min(fade, tone.duration / 1000 / 3);

      voice.gain.gain.setValueAtTime(silence, on);
      voice.gain.gain.exponentialRampToValueAtTime(volume, on + edge);
      voice.gain.gain.setValueAtTime(volume, off - edge);
      voice.gain.gain.exponentialRampToValueAtTime(silence, off);
    });

    const endAt = startAt + schedule.duration / 1000;
    voice.osc.start(startAt);
    voice.osc.stop(endAt + 0.01);

    setIsPlaying(classifyPlayback(morse));

    return new Promise<void>((resolve) => {
      const timer = window.setTimeout(
        () => {
          if (playbackRef.current?.voice === voice) {
            playbackRef.current = null;
            setIsPlaying(undefined);
          }
          resolve();
        },
        (endAt - ctx.currentTime) * 1000,
      );

      playbackRef.current = { voice, timer, finish: resolve };
    });
  }, []);

  // Stop everything if the provider unmounts
  useEffect(() => stopMorse, []);

  return {
    playMorse,
    stopMorse,
    setIsPressed,
    isPressed,
    audioInitialized,
    isPlaying,
  };
}
