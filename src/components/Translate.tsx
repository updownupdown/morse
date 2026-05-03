import { useContext, useEffect, useRef, useState } from "react";
import {
  alphaToMorse,
  morseToAlpha,
  regexTest,
  sanitizeMorse,
} from "../data/alphaToMorse";
import { useLocalStorage } from "../hooks/useLocalStorage";
import "./Translate.scss";
import { SwapIcon } from "../icons/SwapIcon";
import clsx from "clsx";
import { BackspaceIcon } from "../icons/BackspaceIcon";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { MorseContext } from "../context/MorseContext";
import { DeleteIcon } from "../icons/DeleteIcon";
import { StopIcon } from "../icons/StopIcon";
import { PasteIcon } from "../icons/PasteIcon";
import { CopyIcon } from "../icons/CopyIcon";

export const Translate = () => {
  const { isPlaying, selectedMenu } = useContext(MorseContext);
  const { playMorse, stopMorse } = useMorseAudio();

  const [alpha, setAlpha] = useLocalStorage("convertedAlpha", "");
  const [morse, setMorse] = useLocalStorage("convertedMorse", "");
  const [isAlphaInput, setIsAlphaInput] = useLocalStorage(
    "translateDirection",
    true,
  );

  useEffect(() => {
    stopMorse();
  }, [selectedMenu]);

  function backspaceAlpha() {
    setAlpha(alpha.slice(0, -1));
  }
  function backspaceMorse() {
    setMorse(morse.slice(0, -1));
  }

  const clearAlpha = () => {
    setAlpha("");
  };

  const clearMorse = () => {
    setMorse("");
  };

  function playPauseMorse() {
    if (isPlaying) {
      stopMorse();
    } else {
      playMorse(morse);
    }
  }

  const [showCopiedTextToast, setShowCopiedTextToast] = useState(false);

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedTextToast(true);
    } catch (err) {}
  }

  const timeoutRef = useRef<number>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setShowCopiedTextToast(false);
    }, 4000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showCopiedTextToast]);

  async function pasteTextAlpha() {
    try {
      const alpha = await navigator.clipboard.readText();
      setAlpha((prev) => prev + alpha);
    } catch (err) {}
  }

  async function pasteTextMorse() {
    try {
      const morse = await navigator.clipboard.readText();
      setMorse((prev) => prev + morse);
    } catch (err) {}
  }

  useEffect(() => {
    if (isAlphaInput) {
      setMorse(alphaToMorse(alpha));
    }
  }, [alpha]);

  useEffect(() => {
    if (!isAlphaInput) {
      setAlpha(morseToAlpha(morse));
    }
  }, [morse]);

  return (
    <div className="translate">
      <div
        className={clsx(
          "translate-copied-toast ",
          showCopiedTextToast && "translate-copied-toast--visible",
        )}
      >
        Copied to clipboard!
      </div>

      <div className="translate__top">
        <span>
          Convert <span>{isAlphaInput ? "Text" : "Morse"}</span> to{" "}
          <span>{isAlphaInput ? "Morse" : "Text"}</span>
        </span>

        {/* Swap */}
        <button
          className="btn btn--outlined"
          onClick={() => {
            setIsAlphaInput(!isAlphaInput);
          }}
        >
          <SwapIcon />
          <span>Swap</span>
        </button>
      </div>

      <div
        className={clsx(
          "translate__inputs",
          !isAlphaInput && "translate__inputs--reverse",
        )}
      >
        {/* Text */}
        <div className="translate__inputs__input">
          <div className="translate-header">
            {!isAlphaInput && (
              <button
                className="btn"
                onClick={() => {
                  copyText(alpha);
                }}
                disabled={!alpha.length}
              >
                <CopyIcon />
              </button>
            )}

            {isAlphaInput && (
              <>
                <button className="btn" onClick={pasteTextAlpha}>
                  <PasteIcon />
                </button>
                <button
                  className="btn"
                  onClick={clearAlpha}
                  disabled={!alpha.length}
                >
                  <DeleteIcon />
                </button>
                <button
                  className="btn"
                  onClick={backspaceAlpha}
                  disabled={!alpha.length}
                >
                  <BackspaceIcon />
                </button>
              </>
            )}
          </div>

          <textarea
            name="alpha"
            className="translate-alpha"
            placeholder={!isAlphaInput ? "" : "Enter text"}
            value={alpha}
            onChange={(e) => {
              const text = e.target.value.toUpperCase();

              setAlpha(text);
            }}
            onPaste={(e) => {
              setAlpha((prev) => prev + e.clipboardData.getData("Text"));
            }}
            disabled={!isAlphaInput}
          />
        </div>

        {/* Morse */}
        <div className="translate__inputs__input">
          <div className="translate-header">
            <button
              className={clsx(
                "btn btn--play",
                isPlaying && "btn--outlined-stop",
              )}
              onClick={playPauseMorse}
              disabled={!morse.length}
            >
              {isPlaying ? <StopIcon /> : <SpeakerIcon />}
            </button>

            {isAlphaInput && (
              <button
                className="btn"
                onClick={() => {
                  copyText(morse);
                }}
                disabled={!morse.length}
              >
                <CopyIcon />
              </button>
            )}

            {!isAlphaInput && (
              <>
                <button className="btn" onClick={pasteTextMorse}>
                  <PasteIcon />
                </button>
                <button
                  className="btn btn--delete"
                  onClick={clearMorse}
                  disabled={!morse.length}
                >
                  <DeleteIcon />
                </button>
                <button
                  className="btn"
                  onClick={backspaceMorse}
                  disabled={!morse.length}
                >
                  <BackspaceIcon />
                </button>
              </>
            )}
          </div>

          <textarea
            name="morse"
            className="translate-morse"
            value={morse}
            placeholder={isAlphaInput ? "" : 'Use ".", "-", spaces, or slashes'}
            onChange={(e) => {
              let text = e.target.value;

              if (text === "" || regexTest.test(text)) {
                setMorse(sanitizeMorse(text));
              }
            }}
            onPaste={(e) => {
              setMorse(
                (prev) => prev + sanitizeMorse(e.clipboardData.getData("Text")),
              );
            }}
            disabled={isAlphaInput}
          />
        </div>
      </div>
    </div>
  );
};
