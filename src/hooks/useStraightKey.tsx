import { useContext, useEffect, useRef, useState } from "react";
import { KeyTypes, MorseContext, Setting } from "../context/MorseContext";
import {
  alphaToMorse,
  alphaToMorseDict,
  maxCodeLength,
  unitLengths,
} from "../data/alphaToMorse";
import { inProgressChar, MorseChar } from "../components/MorseChar";
import { useAudioContext } from "../context/AudioContext";

interface Props {
  setGuess: (char: string) => void;
}

export const useStraightKey = ({ setGuess }: Props) => {
  // ========== MAIN =========== //
  const { settings } = useContext(MorseContext);

  // ========== QUEUE LOGIC =========== //
  const [queue, setQueue] = useState("");
  const queueRef = useRef(queue);
  queueRef.current = queue;

  // Character break
  const charBreakTimeoutRef = useRef<number>(null);
  const charBreakDuration =
    settings[Setting.UnitTime] * unitLengths["autoCharBreak"];

  const startCharBreakTimeout = () => {
    stopCharBreakTimeout();

    charBreakTimeoutRef.current = setTimeout(() => {
      // Character over! Send character.
      const match =
        queueRef.current.length !== 0 &&
        Object.keys(alphaToMorseDict).find(
          (key) => alphaToMorse(key) === queueRef.current,
        );

      match && setGuess(match);

      setQueue("");
    }, charBreakDuration);
  };

  const stopCharBreakTimeout = () => {
    if (charBreakTimeoutRef.current) {
      clearTimeout(charBreakTimeoutRef.current);
    }
  };

  // ========== PRESS LOGIC =========== //
  const { setIsPressed, isPressed } = useAudioContext();
  const [pressStart, setPressStart] = useState<number | null>(null);
  const pressStartRef = useRef(pressStart);
  pressStartRef.current = pressStart;

  const [pressDuration, setPressDuration] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    if (pressStart === null) {
      startCharBreakTimeout();
    } else {
      stopCharBreakTimeout();
    }
  }, [pressStart]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (charBreakTimeoutRef.current) {
        clearTimeout(charBreakTimeoutRef.current);
      }
    };
  }, []);

  // Presses
  useEffect(() => {
    if (pressDuration === undefined) return;

    if (pressDuration < settings[Setting.UnitTime] * 2) {
      setQueue((prev) => prev + ".");
    } else {
      setQueue((prev) => prev + "-");
    }
  }, [pressDuration, settings]);

  // Presses
  function onPressDown() {
    if (isPressed || queue.length === maxCodeLength) return;

    setIsPressed(true);
    setPressStart(Date.now());
  }
  function onPressUp() {
    setIsPressed(false);

    if (pressStartRef.current !== null) {
      const duration = Date.now() - pressStartRef.current;
      setPressDuration(duration);
    } else {
      setPressDuration(undefined);
    }

    setPressStart(null);
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey || e.repeat) return;

      if (settings[Setting.KeyType] !== KeyTypes.Straight) return;

      if (e.key === "." && !isPressed && queue.length < maxCodeLength) {
        onPressDown();
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (settings[Setting.KeyType] !== KeyTypes.Straight) return;

      if (e.key === ".") {
        onPressUp();
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const MorseQueue = () => {
    return queue.length !== 0 ? <MorseChar morse={queue} size="xl" /> : null;
  };

  const MorseProgress = () => {
    return pressStart !== null ? (
      <MorseChar morse={inProgressChar} size="xl" />
    ) : null;
  };

  return {
    onPressDown,
    onPressUp,
    MorseQueue,
    MorseProgress,
    queue,
    isPressed,
  };
};
