import { useContext, useEffect, useRef, useState } from "react";
import { MorseContext } from "../context/MorseContext";
import {
  alphaToMorse,
  alphaToMorseDict,
  invalidCharText,
  maxCodeLength,
  unitLengths,
} from "../data/alphaToMorse";
import { useMorseAudio } from "./useMorseAudio";
import { inProgressChar, MorseChar } from "../components/MorseChar";

interface Props {
  submitChar: (char: string) => void;
  startTimer?: (now: number) => void;
}

export const useStraightKey = ({ submitChar, startTimer }: Props) => {
  const { settings } = useContext(MorseContext);
  const { setIsPressed, isPressed } = useMorseAudio();

  // Presses
  const [pressStartStraight, setPressStartStraight] = useState<number | null>(
    null,
  );

  const [pressDurationStraight, setPressDurationStraight] = useState<number>(0);
  const pressStartStraightRef = useRef(pressStartStraight);
  pressStartStraightRef.current = pressStartStraight;

  const charBreakTimeoutRef = useRef<number>(null);
  const charBreakDuration = settings.unitTime * unitLengths[" "];

  const [queue, setQueue] = useState("");
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const [match, setMatch] = useState("");
  const matchRef = useRef(match);
  matchRef.current = match;

  // Character break
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

  useEffect(() => {
    if (pressStartStraight === null) {
      startCharBreakTimeout();
    } else {
      stopCharBreakTimeout();
    }
  }, [pressStartStraight]);

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
    if (pressDurationStraight === 0) return;

    if (pressDurationStraight < settings.unitTime * 2) {
      setQueue((prev) => prev + ".");
    } else {
      setQueue((prev) => prev + "-");
    }
  }, [pressDurationStraight]);

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
    if (isPressed || queueRef.current.length === maxCodeLength) return;

    setIsPressed(true);
    setPressStartStraight(Date.now());
    startTimer && startTimer(Date.now());
  }
  function onPressUp() {
    setIsPressed(false);

    if (pressStartStraightRef.current !== null) {
      const duration = Date.now() - pressStartStraightRef.current;
      setPressDurationStraight(duration);
      setPressStartStraight(null);
    }
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.code === "Space" || e.key === "[") &&
        !isPressed &&
        queueRef.current.length < maxCodeLength
      ) {
        onPressDown();
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "[") {
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

  const StraightKey = () => {
    return (
      <button
        className="morse-key morse-key--straight"
        onPointerDown={onPressDown}
        onPointerUp={onPressUp}
        onPointerLeave={onPressUp}
        disabled={queue.length === maxCodeLength}
      >
        Tap/hold
      </button>
    );
  };

  const StraightQueue = () => {
    return queue.length !== 0 ? <MorseChar morse={queue} size="xl" /> : null;
  };

  const StraightProgress = () => {
    return pressStartStraight !== null ? (
      <MorseChar morse={inProgressChar} size="xl" />
    ) : null;
  };

  return { StraightKey, StraightQueue, StraightProgress, match };
};
