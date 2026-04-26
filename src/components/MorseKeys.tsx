import React, { useContext, useEffect, useRef, useState } from "react";
import "./MorseKeys.scss";
import { MorseContext } from "../context/MorseContext";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { Speaker as SpeakerIcon } from "../icons/Speaker";
import { alphaToMorse } from "../data";
import { Keyboard as KeyboardIcon } from "../icons/Keyboard";
import { Backspace as BackspaceIcon } from "../icons/Backspace";
import { Return as ReturnIcon } from "../icons/Return";
import { MorseChar } from "./Word";
import { Delete as DeleteIcon } from "../icons/Delete";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface Props {
  word: string;
  resetWord?: () => void;
  playWord?: () => void;
  onBackspace?: () => void;
  submitChar: (char: string) => void;
  addWordBreak?: () => void;
}

const invalidText = "No match found";
const maxCodeLength = 6;

export const MorseKeys = ({
  word,
  resetWord,
  playWord,
  onBackspace,
  submitChar,
  addWordBreak,
}: Props) => {
  const { settings } = useContext(MorseContext);
  const { playMorse, isPlaying, setIsPressed } = useMorseAudio();
  const [type, setType] = useLocalStorage<"split" | "hold" | "select">(
    "keysType",
    "hold",
  );
  const [queue, setQueue] = useState("");
  const [match, setMatch] = useState("");
  const matchRef = useRef(match);
  matchRef.current = match;

  const [pressStart, setPressStart] = useState<number | null>(null);
  const [pressDuration, setPressDuration] = useState<number>(0);

  useEffect(() => {
    if (pressStart === null) {
      const wordBreakDuration = settings.unitTime * 7;

      const timeout = setTimeout(() => {
        sendQueue();
      }, wordBreakDuration);

      return () => clearTimeout(timeout);
    }
  }, [pressStart]);

  useEffect(() => {
    if (pressDuration === 0) return;

    if (pressDuration < settings.unitTime * 2) {
      setQueue((prev) => prev + ".");
    } else {
      setQueue((prev) => prev + "-");
    }
  }, [pressDuration]);

  useEffect(() => {
    if (queue.length === 0) {
      setMatch("");
      return;
    }

    const match =
      queue.length !== 0 &&
      Object.keys(alphaToMorse).find((key) => alphaToMorse[key] === queue);

    setMatch(match ? match : invalidText);
  }, [queue]);

  function sendQueue() {
    if (matchRef.current.length !== 0 && matchRef.current !== invalidText) {
      submitChar(matchRef.current);
      setQueue("");
    }
  }

  return (
    <div className="morse-keys">
      <div className="morse-keys__buttons">
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
                addWordBreak();
                setQueue("");
              }}
              disabled={
                word.charAt(word.length - 1) === " " || word.length === 0
              }
            >
              <span>Wordbreak</span>
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
          </>
        )}

        {playWord && (
          <button
            className="btn btn--outlined"
            onClick={() => {
              playWord();
            }}
            disabled={isPlaying || word.length === 0}
          >
            <SpeakerIcon />
          </button>
        )}
      </div>

      <div className="morse-keys__queue">
        {type === "split" && (
          <button
            onClick={() => {
              setQueue("");
            }}
            disabled={queue.length === 0}
          >
            <DeleteIcon />
          </button>
        )}

        <div className="morse-keys__queue__preview">
          <div
            className={`morse-keys__queue__preview__match ${match === invalidText && "morse-keys__queue__preview__match--invalid"}`}
          >
            {match}
          </div>
          <div className="morse-keys__queue__preview__morse">
            {queue.split("").map((char, i) => {
              return <MorseChar key={i} morse={char} size="xl" />;
            })}
          </div>
        </div>

        {type === "split" && (
          <button
            onClick={() => {
              sendQueue();
            }}
            disabled={queue.length === 0 || match === invalidText}
          >
            <ReturnIcon />
          </button>
        )}
      </div>

      <div className="morse-keys__keys">
        {type === "select" && (
          <div className="morse-keys__select">
            <button
              className="btn btn--bright"
              onClick={() => {
                setType("split");
              }}
            >
              Split
            </button>
            <button
              className="btn btn--bright"
              onClick={() => {
                setType("hold");
              }}
            >
              Tap/hold
            </button>
          </div>
        )}

        {type !== "select" && (
          <button
            className="morse-key morse-key--switch"
            onClick={() => {
              setType("select");
            }}
          >
            <KeyboardIcon />
          </button>
        )}

        {type === "hold" && (
          <button
            className="morse-key morse-key--hold"
            onPointerDown={() => {
              if (queue.length === maxCodeLength) return;

              setIsPressed(true);
              setPressStart(Date.now());
            }}
            onPointerUp={() => {
              setIsPressed(false);
              if (pressStart !== null) {
                const duration = Date.now() - pressStart;
                setPressDuration(duration);
                setPressStart(null);
              }
            }}
            disabled={queue.length === maxCodeLength}
          >
            Tap/hold
          </button>
        )}

        {type === "split" && (
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
        )}
      </div>
    </div>
  );
};
