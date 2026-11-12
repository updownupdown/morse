import { useContext, useEffect, useRef, useState } from "react";
import { KeyTypes, MorseContext, Setting } from "../context/MorseContext";
import { maxCodeLength } from "../data/alphaToMorse";
import { PressClassifier } from "../morse/decoder";
import { KeyInputProps, useCharQueue } from "./useCharQueue";
import { inProgressChar, MorseChar } from "../components/MorseChar";
import { useAudioContext } from "../context/AudioContext";

export const useStraightKey = (props: KeyInputProps) => {
  // ========== MAIN =========== //
  const { settings } = useContext(MorseContext);

  // ========== QUEUE LOGIC =========== //
  const { queue, pushSymbol, startCharBreakTimeout, stopCharBreakTimeout } =
    useCharQueue(props);

  // Tells dits from dahs, following the sender's own rhythm
  const classifierRef = useRef(new PressClassifier(settings[Setting.UnitTime]));
  classifierRef.current.setUnit(settings[Setting.UnitTime]);

  // ========== PRESS LOGIC =========== //
  const { setIsPressed, isPressed } = useAudioContext();
  const [pressStart, setPressStart] = useState<number | null>(null);
  const pressStartRef = useRef(pressStart);
  pressStartRef.current = pressStart;


  useEffect(() => {
    if (pressStart === null) {
      startCharBreakTimeout();
    } else {
      stopCharBreakTimeout();
    }
  }, [pressStart]);

  // Presses
  function onPressDown() {
    if (isPressed || queue.length === maxCodeLength) return;

    setIsPressed(true);
    setPressStart(performance.now());
  }
  function onPressUp() {
    setIsPressed(false);

    if (pressStartRef.current !== null) {
      const duration = performance.now() - pressStartRef.current;
      // Cleared at once: pointer-up and lost-capture can both fire
      pressStartRef.current = null;
      pushSymbol(classifierRef.current.classify(duration));
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
  }, [queue, settings, isPressed, pressStart]);

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
