import { useCallback, useState } from "react";
import { useEffect } from "react";

const interval = (delay: number) => (callback: () => void) =>
  useEffect(() => {
    const id = setInterval(callback, delay);

    return () => clearInterval(id);
  }, [callback]);

export const useTimer = ({
  intervalDuration = 1000,
  ticks: initialTicks = 0,
  running: initiallyRunning = false,
} = {}) => {
  const [milliseconds, setMilliSeconds] = useState(initialTicks);
  const [running, setRunning] = useState(initiallyRunning);
  const tick = useCallback(
    () => (running ? setMilliSeconds((seconds) => seconds + 1) : undefined),
    [running]
  );
  const start = () => setRunning(true);
  const pause = () => setRunning(false);
  const reset = () => setMilliSeconds(0);
  const stop = () => {
    pause();
    reset();
  };

  const useDuration = interval(intervalDuration);

  useDuration(tick);

  return { pause, reset, running, milliseconds, start, stop };
};
