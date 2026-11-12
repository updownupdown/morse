import { useContext, useEffect, useRef, useState } from "react";
import { MorseContext, Setting } from "../context/MorseContext";
import { decodeChar, gapDurations, MorseSymbol } from "../morse/decoder";

export interface KeyInputProps {
  // A complete, recognised character was keyed
  setGuess: (char: string) => void;
  // The sender paused long enough to end a word
  onWordGap?: () => void;
  // The elements keyed don't make a known character
  onInvalid?: (code: string) => void;
}

// The dits and dahs keyed so far, turned into characters (and word gaps)
// from the pauses between them. Shared by the straight key and the paddles.
export const useCharQueue = ({
  setGuess,
  onWordGap,
  onInvalid,
}: KeyInputProps) => {
  const { settings } = useContext(MorseContext);

  const [queue, setQueue] = useState("");
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const callbacksRef = useRef({ setGuess, onWordGap, onInvalid });
  callbacksRef.current = { setGuess, onWordGap, onInvalid };

  const gapsRef = useRef(gapDurations(80));
  gapsRef.current = gapDurations(
    settings[Setting.UnitTime],
    settings[Setting.Farnsworth],
  );

  const charBreakTimeoutRef = useRef<number | null>(null);
  const wordBreakTimeoutRef = useRef<number | null>(null);

  const stopCharBreakTimeout = () => {
    if (charBreakTimeoutRef.current) clearTimeout(charBreakTimeoutRef.current);
    if (wordBreakTimeoutRef.current) clearTimeout(wordBreakTimeoutRef.current);
    charBreakTimeoutRef.current = null;
    wordBreakTimeoutRef.current = null;
  };

  // Call when the key goes quiet; cancelled by the next element
  const startCharBreakTimeout = () => {
    stopCharBreakTimeout();

    const { charBreak, wordBreak } = gapsRef.current;

    charBreakTimeoutRef.current = window.setTimeout(() => {
      const code = queueRef.current;
      if (code.length === 0) return;

      // Character over! Send character.
      const match = decodeChar(code);
      const { setGuess, onInvalid, onWordGap } = callbacksRef.current;

      if (match) {
        setGuess(match);
      } else {
        onInvalid?.(code);
      }

      setQueue("");

      if (onWordGap) {
        wordBreakTimeoutRef.current = window.setTimeout(() => {
          callbacksRef.current.onWordGap?.();
        }, wordBreak - charBreak);
      }
    }, charBreak);
  };

  const pushSymbol = (symbol: MorseSymbol) => {
    setQueue((prev) => prev + symbol);
  };

  // Cleanup timers on unmount
  useEffect(() => stopCharBreakTimeout, []);

  return {
    queue,
    queueRef,
    pushSymbol,
    startCharBreakTimeout,
    stopCharBreakTimeout,
  };
};
