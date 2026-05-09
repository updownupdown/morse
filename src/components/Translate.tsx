import { useContext, useEffect, useRef, useState } from "react";
import {
  alphaToMorse,
  morseToAlpha,
  regexTest,
  sanitizeMorse,
} from "../data/alphaToMorse";
import { useLocalStorage } from "../hooks/useLocalStorage";
import "./Translate.scss";
import clsx from "clsx";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import { useAudio } from "../hooks/useAudio";
import { MorseContext } from "../context/MorseContext";
import { DeleteIcon } from "../icons/DeleteIcon";
import { StopIcon } from "../icons/StopIcon";
import { PasteIcon } from "../icons/PasteIcon";
import { CopyIcon } from "../icons/CopyIcon";

export const Translate = () => {
  const { isPlaying, selectedMenu } = useContext(MorseContext);
  const { playMorse, stopMorse } = useAudio();

  const [alpha, setAlpha] = useLocalStorage("convertedAlpha", "");
  const [morse, setMorse] = useLocalStorage("convertedMorse", "");
  const [isAlphaInput, setIsAlphaInput] = useLocalStorage(
    "translateDirection",
    true,
  );

  useEffect(() => {
    stopMorse();
  }, [selectedMenu]);

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
      <div className="button-menu">
        <button
          className={`btn-menu-item btn-menu-item--${isAlphaInput ? "selected" : "not-selected"}`}
          onClick={() => {
            setIsAlphaInput(true);
          }}
        >
          Text to Morse
        </button>
        <button
          className={`btn-menu-item btn-menu-item--${!isAlphaInput ? "selected" : "not-selected"}`}
          onClick={() => {
            setIsAlphaInput(false);
          }}
        >
          Morse to Text
        </button>
      </div>

      <div
        className={clsx(
          "translate-copied-toast",
          showCopiedTextToast && "translate-copied-toast--visible",
        )}
      >
        Copied to clipboard!
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
                className="btn btn--small"
                onClick={() => {
                  copyText(alpha);
                }}
                disabled={!alpha.length}
              >
                <CopyIcon />
                <span>Copy</span>
              </button>
            )}

            {isAlphaInput && (
              <>
                <button className="btn btn--small" onClick={pasteTextAlpha}>
                  <PasteIcon />
                  <span>Paste</span>
                </button>
                <button
                  className="btn btn--small"
                  onClick={clearAlpha}
                  disabled={!alpha.length}
                >
                  <DeleteIcon />
                  <span>Clear</span>
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
              const pointer = e.target.selectionStart;
              const element = e.target;

              setAlpha(e.target.value);

              window.requestAnimationFrame(() => {
                element.selectionStart = pointer;
                element.selectionEnd = pointer;
              });
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
                "btn btn--small btn--play-stop",
                isPlaying && "btn--stop",
              )}
              onClick={playPauseMorse}
              disabled={!morse.length}
            >
              {isPlaying ? <StopIcon /> : <SpeakerIcon />}
              <span>Play</span>
            </button>

            {isAlphaInput && (
              <button
                className="btn btn--small"
                onClick={() => {
                  copyText(morse);
                }}
                disabled={!morse.length}
              >
                <CopyIcon />
                <span>Copy</span>
              </button>
            )}

            {!isAlphaInput && (
              <>
                <button className="btn btn--small" onClick={pasteTextMorse}>
                  <PasteIcon />
                  <span>Paste</span>
                </button>
                <button
                  className="btn btn--small btn--delete"
                  onClick={clearMorse}
                  disabled={!morse.length}
                >
                  <DeleteIcon />
                  <span>Clear</span>
                </button>
              </>
            )}
          </div>

          <textarea
            name="morse"
            className="translate-morse"
            value={morse}
            placeholder={isAlphaInput ? "" : 'Use ".", "-", spaces, or slashes'}
            onKeyDown={(e) => {
              if (!regexTest.test(e.key)) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            onChange={(e) => {
              setMorse(e.target.value);
            }}
            onBlur={() => {
              setMorse(sanitizeMorse(morse));
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
