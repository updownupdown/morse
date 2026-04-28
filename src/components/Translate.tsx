import { useContext, useEffect, useState } from "react";
import { alphaToMorse } from "../data/alphaToMorse";
import { useLocalStorage } from "../hooks/useLocalStorage";
import "./Translate.scss";
import { Swap as SwapIcon } from "../icons/Swap";
import clsx from "clsx";
import { Reset as ResetIcon } from "../icons/Reset";
import { Backspace as BackspaceIcon } from "../icons/Backspace";
import { Speaker as SpeakerIcon } from "../icons/Speaker";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { MorseContext } from "../context/MorseContext";

export const Translate = () => {
  const { isPlayingTone } = useContext(MorseContext);
  const { playMorse } = useMorseAudio();

  const [alpha, setAlpha] = useLocalStorage("convertedAlpha", "");
  const [morse, setMorse] = useLocalStorage("convertedMorse", "");
  const [isAlphaInput, setIsAlphaInput] = useState(true);

  const convertToMorse = (text: string) => {
    let outputText: string[] = [];
    const alphaChunks = Array.from(text);

    alphaChunks.forEach((char) => {
      let convertedLetter = "";
      const uppercaseChar = char.toUpperCase();

      if (char === " ") {
        convertedLetter = "/";
      } else if (alphaToMorse[uppercaseChar]) {
        convertedLetter = alphaToMorse[uppercaseChar];
      }

      outputText.push(convertedLetter);
    });

    setMorse(outputText.join(" "));
  };

  const regex = /^[/. -]*$/;

  const sanitizedMorse = (input: string) => {
    return input.replace(regex, "");
  };

  const convertToAlpha = (input: string) => {
    let outputText: string[] = [];
    const morseChunks = input.split(" ");

    if (morseChunks.length !== 0) {
      morseChunks.forEach((symbols) => {
        if (symbols === "/") {
          outputText.push(" ");
          return;
        }
        if (symbols === "") {
          return;
        }

        const match = Object.keys(alphaToMorse).find(
          (key) => alphaToMorse[key] === symbols,
        );

        outputText.push(match ?? "�");
      });
    }

    setAlpha(outputText.join(""));
  };

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
      convertToMorse(alpha);
    }
  }, [alpha]);

  useEffect(() => {
    if (!isAlphaInput) {
      convertToAlpha(morse);
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
                onClick={backspaceAlpha}
                disabled={!alpha.length}
              >
                <BackspaceIcon />
              </button>
              <button
                className="btn btn--small"
                onClick={clearAlpha}
                disabled={!alpha.length}
              >
                <ResetIcon />
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

          {!isAlphaInput && (
            <>
              <button
                className="btn btn--small"
                onClick={backspaceMorse}
                disabled={!morse.length}
              >
                <BackspaceIcon />
              </button>
              <button
                className="btn btn--small"
                onClick={clearMorse}
                disabled={!morse.length}
              >
                <ResetIcon />
              </button>
            </>
          )}

          <button
            className="btn btn--small"
            onClick={playMorseCode}
            disabled={!morse.length || isPlayingTone}
          >
            <SpeakerIcon />
          </button>
        </div>

        <textarea
          name="morse"
          className="translate__morse"
          value={morse}
          placeholder={isAlphaInput ? "" : 'Use ".", "-", spaces, or slashes'}
          onChange={(e) => {
            const text = e.target.value;

            if (text === "" || regex.test(text)) {
              setMorse(text);
            }
          }}
          onPaste={(e) => {
            const text = sanitizedMorse(e.clipboardData.getData("Text"));

            setMorse(text);
          }}
          disabled={isAlphaInput}
        />
      </div>
    </div>
  );
};
