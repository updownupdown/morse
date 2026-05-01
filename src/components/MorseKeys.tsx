import React, { useContext, useEffect, useRef, useState } from "react";
import "./MorseKeys.scss";
import { KeyTypes, MorseContext } from "../context/MorseContext";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import {
  alphaToMorse,
  alphaToMorseDict,
  unitLengths,
} from "../data/alphaToMorse";
import { BackspaceIcon } from "../icons/BackspaceIcon";
import { DeleteIcon } from "../icons/DeleteIcon";
import { StopIcon } from "../icons/StopIcon";
import { KeySelector } from "./KeySelector";
import { SettingsIcon } from "../icons/SettingsIcon";
import { inProgressChar, MorseChar } from "./MorseChar";

interface Props {
  word: string;
  playWord?: boolean;
  hint?: string;
  resetWord?: () => void;
  onBackspace?: () => void;
  submitChar: (char: string) => void;
  addWordBreak?: () => void;
  startTimer?: (now: number) => void;
}

const invalidText = "Invalid";
const maxCodeLength = 6;

export const MorseKeys = ({
  word,
  playWord,
  hint,
  resetWord,
  onBackspace,
  submitChar,
  addWordBreak,
  startTimer,
}: Props) => {
  const { settings, isPlayingTone } = useContext(MorseContext);
  const { playMorse, stopMorse, setIsPressed, isPressed } = useMorseAudio();
  const [selectKeyType, setSelectKeyType] = useState(false);
  const [queue, setQueue] = useState("");
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const [match, setMatch] = useState("");
  const matchRef = useRef(match);
  matchRef.current = match;

  // Presses
  const [pressStartStraight, setPressStartStraight] = useState<number | null>(
    null,
  );
  const [pressStartDit, setPressStartDit] = useState<number | null>(null);
  const [pressStartDah, setPressStartDah] = useState<number | null>(null);

  const [pressDurationStraight, setPressDurationStraight] = useState<number>(0);
  const pressStartStraightRef = useRef(pressStartStraight);
  pressStartStraightRef.current = pressStartStraight;

  const [pressDurationDit, setPressDurationDit] = useState<number>(0);
  const [pressDurationDah, setPressDurationDah] = useState<number>(0);

  const charBreakTimeoutRef = useRef<number>(null);
  const charBreakDuration = settings.unitTime * unitLengths[" "];

  // Character break
  const startCharBreakTimeout = () => {
    stopCharBreakTimeout();

    charBreakTimeoutRef.current = setTimeout(() => {
      // Character over! Send character.
      if (matchRef.current.length !== 0 && matchRef.current !== invalidText) {
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

    setMatch(match ? match : invalidText);
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

  return (
    <div className="morse-keys">
      {(playWord || (resetWord && onBackspace && addWordBreak)) && (
        <div className="morse-keys__buttons">
          {playWord && (
            <button
              className="btn btn--outlined"
              onClick={() => {
                if (isPlayingTone) {
                  stopMorse();
                } else {
                  playMorse(alphaToMorse(word));
                }
              }}
              disabled={word.length === 0}
            >
              {isPlayingTone ? <StopIcon /> : <SpeakerIcon />}
            </button>
          )}

          {resetWord && onBackspace && addWordBreak && (
            <>
              <button
                className="btn btn--outlined"
                onClick={() => {
                  resetWord();
                }}
                disabled={word.length === 0}
              >
                <DeleteIcon />
              </button>

              <button
                className="btn btn--outlined"
                onClick={() => {
                  onBackspace();
                }}
                disabled={word.length === 0}
              >
                <BackspaceIcon />
              </button>
              <button
                className="btn btn--outlined"
                onClick={() => {
                  addWordBreak();
                  setQueue("");
                }}
                disabled={
                  word.charAt(word.length - 1) === " " || word.length === 0
                }
              >
                <span>Wordbreak</span>
              </button>
            </>
          )}
        </div>
      )}

      <div className="morse-keys__queue">
        <div className="morse-keys__queue__preview">
          <div className="morse-keys__queue__preview__morse">
            {queue.length !== 0 && <MorseChar morse={queue} size="xl" />}

            {pressStartStraight !== null && (
              <MorseChar morse={inProgressChar} size="xl" />
            )}

            {hint && (
              <div key={hint} className="morse-hint">
                <MorseChar morse={hint} size="xl" />
              </div>
            )}
          </div>
          <div
            className={`morse-keys__queue__preview__match ${match === invalidText && "morse-keys__queue__preview__match--invalid"}`}
          >
            {match}
          </div>
        </div>
      </div>

      <div className="morse-keys__keys">
        {selectKeyType && (
          <div className="key-selector-modal">
            <KeySelector
              onClose={() => {
                setSelectKeyType(false);
              }}
            />
          </div>
        )}

        {/* <button
          className="morse-key morse-key--switch"
          onClick={() => {
            setSelectKeyType(true);
          }}
        >
          <span>Keys</span>
          <SettingsIcon />
        </button> */}

        {/* {settings.keyType === KeyTypes.Straight && ( */}
        <button
          className="morse-key morse-key--straight"
          onPointerDown={onPressDown}
          onPointerUp={onPressUp}
          disabled={queue.length === maxCodeLength}
        >
          Tap/hold
        </button>
        {/* )} */}

        {/* {settings.keyType === KeyTypes.IambicA && (
          <>
            <button
              className="morse-key morse-key--dit"
              onClick={() => {
                playMorse(".");
                setQueue((prev) => prev + ".");
              }}
              disabled={queue.length === maxCodeLength}
            >
              <div />
            </button>
            <button
              className="morse-key morse-key--dah"
              onClick={() => {
                playMorse("-");
                setQueue((prev) => prev + "-");
              }}
              disabled={queue.length === maxCodeLength}
            >
              <div />
            </button>
          </>
        )} */}
      </div>
    </div>
  );
};
