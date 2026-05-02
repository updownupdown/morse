import { useContext, useEffect, useRef, useState } from "react";
import { useMorseAudio } from "./useMorseAudio";
import { KeyTypes, MorseContext, Setting } from "../context/MorseContext";
import {
  alphaToMorse,
  alphaToMorseDict,
  invalidCharText,
  maxCodeLength,
  unitLengths,
} from "../data/alphaToMorse";
import clsx from "clsx";
import { inProgressChar, MorseChar } from "../components/MorseChar";

type PressedState = {
  dit?: number;
  dah?: number;
  squeezed: boolean;
};

type KeyType = "dit" | "dah";

function getOtherKeyType(keyType: KeyType) {
  return keyType === "dit" ? "dah" : "dit";
}

type IambicKeysProps = {
  submitChar: (char: string) => void;
};

export const useIambicKeys = ({ submitChar }: IambicKeysProps) => {
  // ========== MAIN =========== //
  const { settings, isPlaying: isPlaying } = useContext(MorseContext);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const { playMorse } = useMorseAudio();

  // ========== QUEUE LOGIC =========== //
  const [queue, setQueue] = useState("");
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const [match, setMatch] = useState("");
  const matchRef = useRef(match);
  matchRef.current = match;

  // Character break
  const charBreakTimeoutRef = useRef<number>(null);
  const charBreakDuration =
    settings[Setting.UnitTime] * unitLengths["charBreak"];

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
    if (queue.length === 0) {
      setMatch("");
      return;
    }

    const match =
      queue.length !== 0 &&
      Object.keys(alphaToMorseDict).find((key) => alphaToMorse(key) === queue);

    setMatch(match ? match : invalidCharText);
  }, [queue]);

  const MorseQueue = () => {
    return queue.length !== 0 ? <MorseChar morse={queue} size="xl" /> : null;
  };

  // ========== PRESS LOGIC =========== //
  const [pressState, setPressState] = useState<PressedState>({
    dit: undefined,
    dah: undefined,
    squeezed: false,
  });
  const pressStateRef = useRef(pressState);
  pressStateRef.current = pressState;

  const [hasPlayQueue, setHasPlayQueue] = useState(false);
  const [lastPlayed, setLastPlayed] = useState<KeyType | undefined>(undefined);
  const lastPlayedRef = useRef(lastPlayed);
  lastPlayedRef.current = lastPlayed;

  const [lastUnpress, setLastUnpress] = useState<number | undefined>(undefined);
  const lastUnpressRef = useRef(lastUnpress);
  lastUnpressRef.current = lastUnpress;

  const [playNext, setPlayNext] = useState<KeyType | undefined>(undefined);
  const [playNow, setPlayNow] = useState<KeyType | undefined>(undefined);
  const [ultimaticRepeatSymbol, setUltimaticRepeatSymbol] = useState<
    KeyType | undefined
  >(undefined);
  const ultimaticRepeatSymbolRef = useRef(ultimaticRepeatSymbol);
  ultimaticRepeatSymbolRef.current = ultimaticRepeatSymbol;

  const [modeB, setModeB] = useState(false);
  const modeBRef = useRef(modeB);
  modeBRef.current = modeB;

  // ========== On key down/up =========== //
  function onKeyDown(keyType: KeyType) {
    const otherKeyTime = pressStateRef?.current[getOtherKeyType(keyType)];
    const thisKeyTime = Date.now();

    const isValidSqueeze =
      otherKeyTime !== undefined &&
      Math.abs(otherKeyTime - thisKeyTime) <
        settingsRef.current[Setting.UnitTime];

    // For Ultimatic, if newly squeezed, the current key will be the last squeezed;
    // set it for repeat
    if (settingsRef.current[Setting.KeyType] === KeyTypes.Ultimatic) {
      const newlySqueezed = isValidSqueeze && !pressStateRef.current.squeezed;
      if (newlySqueezed) {
        setUltimaticRepeatSymbol(keyType);
      }
    }

    // Update the press state
    setPressState((prev) => ({
      ...prev,
      [keyType]: thisKeyTime,
      squeezed: isValidSqueeze,
    }));

    // Set intent to play this key next; this may be overwritten
    // if other key is pressed before we get around to playing this next
    setPlayNext(keyType);
    setHasPlayQueue(true);
  }

  function onKeyUp(keyType: KeyType) {
    // Imabic Mode B
    if (settingsRef.current[Setting.KeyType] === KeyTypes.IambicB) {
      if (pressStateRef.current.squeezed) {
        // If was squeezed until now, set mode B to true
        setModeB(true);
      } else if (modeBRef.current) {
        // If not unpressing quickly enough, set mode B to false
        const unpressDelayThreshold = settingsRef.current[Setting.UnitTime];
        const unpressedQuickly =
          lastUnpressRef.current &&
          Date.now() - lastUnpressRef.current < unpressDelayThreshold;

        if (!unpressedQuickly) {
          setModeB(false);
        }
      }
    }

    setLastUnpress(Date.now());

    // Update the press state
    setPressState((prev) => {
      return {
        ...prev,
        [keyType]: undefined,
        squeezed: false,
      };
    });

    setUltimaticRepeatSymbol(undefined);
  }

  // ========== Keyboard support =========== //
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey || e.repeat) return;

      if (
        ![KeyTypes.IambicA, KeyTypes.IambicB, KeyTypes.Ultimatic].includes(
          settingsRef.current[Setting.KeyType],
        )
      ) {
        return;
      }

      if (e.key === "[" && !e.repeat) {
        onKeyDown("dit");
        e.preventDefault();
      } else if (e.key === "]" && !e.repeat) {
        onKeyDown("dah");
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        ![KeyTypes.IambicA, KeyTypes.IambicB, KeyTypes.Ultimatic].includes(
          settingsRef.current[Setting.KeyType],
        )
      ) {
        return;
      }

      if (e.key === "[") {
        onKeyUp("dit");
        e.preventDefault();
      } else if (e.key === "]") {
        onKeyUp("dah");
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

  // ========== Play logic =========== //
  async function play() {
    if (!playNow) return;

    stopCharBreakTimeout();

    // Reset mode B whenever a sound is played
    if (settingsRef.current[Setting.KeyType] === KeyTypes.IambicB) {
      setModeB(false);
    }

    setLastPlayed(playNow);

    let timeoutDuration = settingsRef.current[Setting.UnitTime];

    if (playNow === "dit") {
      playMorse(".");
      timeoutDuration += settingsRef.current[Setting.UnitTime];
    } else if (playNow === "dah") {
      playMorse("-");
      timeoutDuration += settingsRef.current[Setting.UnitTime] * 3;
    }

    setTimeout(() => {
      startCharBreakTimeout();
      setPlayNow(undefined);
    }, timeoutDuration);
  }

  function findPlayNow() {
    let play: KeyType | undefined = playNext;

    if (playNext) {
      play = playNext;
      setPlayNext(undefined);
    } else {
      if (pressStateRef.current.squeezed) {
        // ========== Squeezed ========== //
        if (
          settingsRef.current[Setting.KeyType] === KeyTypes.Ultimatic &&
          ultimaticRepeatSymbolRef.current
        ) {
          // Continue repeating *ultimatic* symbol
          play = ultimaticRepeatSymbolRef.current;
        } else if (lastPlayedRef.current) {
          // Repeat alternate symbol (opposite of last played)
          play = getOtherKeyType(lastPlayedRef.current);
        }
      } else {
        // ========== Not Squeezed ========== //

        const ditPressed = pressStateRef.current["dit"];
        const dahPressed = pressStateRef.current["dah"];

        // Repeat whichever symbol is pressed, or was pressed last
        if (ditPressed && dahPressed) {
          const lastButtonPressed = ditPressed > dahPressed ? "dit" : "dah";
          play = lastButtonPressed as KeyType;
        } else if (ditPressed) {
          play = "dit";
        } else if (dahPressed) {
          play = "dah";
        }
      }
    }

    if (!play) {
      // If nothing to play, check if Mode B should be used
      if (
        settingsRef.current[Setting.KeyType] === KeyTypes.IambicB &&
        modeBRef.current &&
        lastPlayedRef.current
      ) {
        play = getOtherKeyType(lastPlayedRef.current);
      } else {
        setHasPlayQueue(false);
      }
    }

    if (play) {
      setQueue((prev) => prev + (play === "dit" ? "." : "-"));
    }

    setPlayNow(play);
  }

  useEffect(() => {
    if (!hasPlayQueue) return;

    if (playNow) {
      play();
    } else {
      findPlayNow();
    }
  }, [playNow, hasPlayQueue]);

  // ========== Actual keys =========== //
  const IambicKeys = () => {
    return (
      <>
        <button
          className={clsx(
            "morse-key morse-key--dit",
            pressStateRef.current.dit && "morse-key--pressed",
          )}
          onPointerDown={() => {
            onKeyDown("dit");
          }}
          onPointerLeave={() => {
            onKeyUp("dit");
          }}
          onPointerUp={() => {
            onKeyUp("dit");
          }}
          disabled={queue.length === maxCodeLength}
        >
          <div />
        </button>
        <button
          className={clsx(
            "morse-key morse-key--dah",
            pressStateRef.current.dah && "morse-key--pressed",
          )}
          onPointerDown={() => {
            onKeyDown("dah");
          }}
          onPointerLeave={() => {
            onKeyUp("dah");
          }}
          onPointerUp={() => {
            onKeyUp("dah");
          }}
          disabled={queue.length === maxCodeLength}
        >
          <div />
        </button>
      </>
    );
  };

  return { IambicKeys, MorseQueue, match };
};
