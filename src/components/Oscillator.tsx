import React, { useContext, useEffect, useRef, useState } from "react";
import { SettingsContext } from "../context/SettingsContext";
import { useTiming } from "../hooks/useTiming";
import { Timing, getGainTimings } from "../utils/utils";

const AudioContext = window.AudioContext;

export const useOscillator = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [morse, setMorse] = useState("");

  const { timing } = useTiming();
  const { frequency, volume, wordsPerMin } = useContext(SettingsContext);

  const audioContextRef = useRef<AudioContext | null>(null);

  const playForDuration = (duration: number) => {};

  useEffect(() => {
    const context = new AudioContext();
    const o = context.createOscillator();
    const g = context.createGain();
    o.frequency.value = frequency;
    o.connect(g);
    o.type = "sine";
    g.connect(context.destination);

    audioContextRef.current = context;

    const { gainValues, totalTime } = getGainTimings(
      morse,
      volume,
      wordsPerMin
    );
    gainValues.forEach(([value, time]: Timing) =>
      g.gain.setValueAtTime(value, time)
    );

    console.log({ gainValues, totalTime });

    setTimeout(() => {
      setIsPlaying(false);
      // audioContextRef.current.suspend();
    }, totalTime);

    return () => {
      // o.disconnect(context.destination);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!audioContextRef.current) return;

    if (isPlaying) {
      audioContextRef.current.resume();
    } else {
      audioContextRef.current.suspend();
    }
  }, [isPlaying]);
  // useEffect(() => {
  // const audioContext = new AudioContext();
  // const osc = audioContext.createOscillator();
  // osc.type = "sine";
  // osc.frequency.value = 880;

  // Connect and start
  // osc.connect(audioContext.destination);
  // osc.start();

  // Store context and start suspended
  // audioContextRef.current = audioContext;
  // audioContext.suspend();

  // g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.04);

  // return () => {
  // osc.stop(0);
  // o.stop(0);
  // g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 1);
  // osc.disconnect(audioContext.destination);
  // };
  // }, []);

  // const toggleOscillator = () => {
  //   if (dataPlaying) {
  //     audioContextRef.current.suspend();
  //   } else {
  //     audioContextRef.current.resume();
  //   }
  //   setIsPlaying((play) => !play);
  // };

  return { isPlaying, setIsPlaying, setMorse };
};
