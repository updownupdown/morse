import React, { useState } from "react";
import "./Simulator.scss";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Status, Word } from "./Word";
import { MorseKeys } from "./MorseKeys";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { alphaToMorse } from "../data";

export const Simulator = () => {
  const { playMorse, isPlaying } = useMorseAudio();

  const [message, setMessage] = useLocalStorage("simMessage", "My message");

  function playWord() {
    if (message.length === 0) return;

    let morseMessage: string[] = [];

    for (let i = 0; i < message.length; i++) {
      if (message.charAt(i) === " ") {
        morseMessage.push("/");
        continue;
      }

      const morse = alphaToMorse[message.charAt(i)];
      if (!morse) continue;

      morseMessage.push(morse);

      if (i !== message.length) {
        morseMessage.push(" ");
      }
    }

    playMorse(morseMessage.join(""));
  }

  function onBackspace() {
    setMessage((prev) => prev.slice(0, -1));
  }

  function addCharacter(char: string) {
    setMessage((prev) => prev + char);
  }

  function addWordBreak() {
    setMessage((prev) => prev + " ");
  }

  function resetWord() {
    setMessage("");
  }

  return (
    <div className="simulator">
      <div className="simulator__word">
        <Word word={message} />
      </div>

      <MorseKeys
        word={message}
        resetWord={resetWord}
        playWord={playWord}
        onBackspace={onBackspace}
        submitChar={addCharacter}
        addWordBreak={addWordBreak}
      />
    </div>
  );
};
