import { useContext, useEffect, useRef, useState } from "react";
import { KeyTypes, MorseContext, Setting } from "../context/MorseContext";
import {
  alphaToMorse,
  alphaToMorseDict,
  invalidCharText,
  maxCodeLength,
  unitLengths,
} from "../data/alphaToMorse";
import { useMorseAudio } from "./useMorseAudio";
import { inProgressChar, MorseChar } from "../components/MorseChar";
import clsx from "clsx";
import { clamp } from "../utils/utils";

interface Props {
  submitChar: (char: string) => void;
  startTimer?: (now: number) => void;
}

export const useStraightKey = ({ submitChar, startTimer }: Props) => {
  // ========== MAIN =========== //
  const { settings } = useContext(MorseContext);

  // ========== QUEUE LOGIC =========== //
  const [queue, setQueue] = useState("");
  const [match, setMatch] = useState("");
  const matchRef = useRef(match);
  matchRef.current = match;

  // Character break
  const charBreakTimeoutRef = useRef<number>(null);
  const charBreakDuration =
    settings[Setting.UnitTime] * unitLengths["autoCharBreak"];

  const startCharBreakTimeout = () => {
    stopCharBreakTimeout();

    charBreakTimeoutRef.current = setTimeout(() => {
      // Character over! Send character.
      if (
        matchRef.current.length !== 0 &&
        matchRef.current !== invalidCharText
      ) {
        submitChar(matchRef.current);
      }

      setQueue("");
    }, charBreakDuration);
  };

  const stopCharBreakTimeout = () => {
    if (charBreakTimeoutRef.current) {
      clearTimeout(charBreakTimeoutRef.current);
    }
  };

  // ========== PRESS LOGIC =========== //
  const { setIsPressed, isPressed } = useMorseAudio();
  const [pressStart, setPressStart] = useState<number | null>(null);
  const [pressDuration, setPressDuration] = useState<number>(0);

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
    if (pressDuration === 0) return;

    if (pressDuration < settings[Setting.UnitTime] * 2) {
      setQueue((prev) => prev + ".");
    } else {
      setQueue((prev) => prev + "-");
    }
  }, [pressDuration, settings]);

  useEffect(() => {
    if (queue.length === 0) {
      setMatch("");
      return;
    }

    const match =
      queue.length !== 0 &&
      Object.keys(alphaToMorseDict).find((key) => alphaToMorse(key) === queue);

    setMatch(match ? match : invalidCharText);
  }, [queue]);

  // Presses
  function onPressDown() {
    if (isPressed || queue.length === maxCodeLength) return;

    setIsPressed(true);
    setPressStart(Date.now());
    startTimer && startTimer(Date.now());
  }
  function onPressUp() {
    setIsPressed(false);

    if (pressStart !== null) {
      const duration = Date.now() - pressStart;
      setPressDuration(duration);
      setPressStart(null);
    }
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
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("contextmenu", (e) => e.preventDefault());
    };
  }, [queue, settings, isPressed, pressStart]);

  const KeyButton = () => {
    return (
      <button
        className={clsx(
          "morse-key morse-key--straight",
          isPressed && "morse-key--pressed",
        )}
        onPointerDown={onPressDown}
        onPointerUp={onPressUp}
        onPointerLeave={onPressUp}
        disabled={queue.length === maxCodeLength}
      >
        Tap/hold
      </button>
    );
  };

  const MorseQueue = () => {
    return queue.length !== 0 ? <MorseChar morse={queue} size="xl" /> : null;
  };

  const MorseProgress = () => {
    return pressStart !== null ? (
      <MorseChar morse={inProgressChar} size="xl" />
    ) : null;
  };

  return { KeyButton, MorseQueue, MorseProgress, match };
};
