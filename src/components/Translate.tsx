import { useContext, useEffect, useState } from "react";
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
import { ResetIcon } from "../icons/ResetIcon";
import { BackspaceIcon } from "../icons/BackspaceIcon";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { MorseContext } from "../context/MorseContext";

export const Translate = () => {
  const { isPlaying, selectedMenu } = useContext(MorseContext);
  const { playMorse, stopMorse } = useMorseAudio();

  const [alpha, setAlpha] = useLocalStorage("convertedAlpha", "");
  const [morse, setMorse] = useLocalStorage("convertedMorse", "");
  const [isAlphaInput, setIsAlphaInput] = useState(true);

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

  function playMorseCode() {
    playMorse(morse);
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
    <div className={clsx("translate", !isAlphaInput && "translate--reverse")}>
      <div className="translate__input">
        <div className="translate__header">
          <h3 aria-label="text">Text</h3>

          {isAlphaInput && (
            <>
              <button
                className="btn btn--small"
                onClick={clearAlpha}
                disabled={!alpha.length}
              >
                <ResetIcon />
              </button>
              <button
                className="btn btn--small"
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
          className="translate__alpha"
          placeholder={!isAlphaInput ? "" : "Enter text"}
          value={alpha}
          onChange={(e) => {
            const text = e.target.value.toUpperCase();

            setAlpha(text);
          }}
          onPaste={(e) => {
            setAlpha(e.clipboardData.getData("Text"));
          }}
          disabled={!isAlphaInput}
        />
      </div>

      <button
        className="btn btn--outlined"
        onClick={() => {
          setIsAlphaInput(!isAlphaInput);
        }}
      >
        <SwapIcon />
        <span>Swap</span>
      </button>

      <div className="translate__input">
        <div className="translate__header">
          <h3 aria-label="morse">Morse</h3>

          <button
            className="btn btn--small"
            onClick={playMorseCode}
            disabled={!morse.length || isPlaying !== undefined}
          >
            <SpeakerIcon />
          </button>

          {!isAlphaInput && (
            <>
              <button
                className="btn btn--small"
                onClick={clearMorse}
                disabled={!morse.length}
              >
                <ResetIcon />
              </button>
              <button
                className="btn btn--small"
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
          className="translate__morse"
          value={morse}
          placeholder={isAlphaInput ? "" : 'Use ".", "-", spaces, or slashes'}
          onChange={(e) => {
            let text = e.target.value;

            if (text === "" || regexTest.test(text)) {
              setMorse(sanitizeMorse(text));
            }
          }}
          onPaste={(e) => {
            setMorse(sanitizeMorse(e.clipboardData.getData("Text")));
          }}
          disabled={isAlphaInput}
        />
      </div>
    </div>
  );
};
