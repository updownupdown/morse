import React, { useContext, useEffect, useRef, useState } from "react";
import "./MorseKeys.scss";
import { KeyTypes, MorseContext } from "../context/MorseContext";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import {
  alphaToMorse,
  alphaToMorseDict,
  invalidCharText,
  maxCodeLength,
  unitLengths,
} from "../data/alphaToMorse";
import { BackspaceIcon } from "../icons/BackspaceIcon";
import { DeleteIcon } from "../icons/DeleteIcon";
import { StopIcon } from "../icons/StopIcon";
import { KeySelector } from "./KeySelector";
import { SettingsIcon } from "../icons/SettingsIcon";
import { inProgressChar, MorseChar } from "./MorseChar";
import { useStraightKey } from "../hooks/useKeys";

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

  // STRAIGHT KEY HOOK
  const {
    StraightKey,
    StraightQueue,
    StraightProgress,
    match: StraightMatch,
  } = useStraightKey({
    submitChar,
    startTimer,
  });

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
            {settings.keyType === KeyTypes.Straight && (
              <>
                <StraightQueue />
                <StraightProgress />
              </>
            )}

            {hint && (
              <div key={hint} className="morse-hint">
                <MorseChar morse={hint} size="xl" />
              </div>
            )}
          </div>
          <div
            className={`morse-keys__queue__preview__match ${StraightMatch === invalidCharText && "morse-keys__queue__preview__match--invalid"}`}
          >
            {StraightMatch}
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

        <button
          className="morse-key morse-key--switch"
          onClick={() => {
            setSelectKeyType(true);
          }}
        >
          <span>Keys</span>
          <SettingsIcon />
        </button>

        {settings.keyType === KeyTypes.Straight && <StraightKey />}

        {settings.keyType === KeyTypes.IambicA && (
          <>
            <p>IAMBIC COMING SOON!</p>
            {/* <button
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
            </button> */}
          </>
        )}
      </div>
    </div>
  );
};
