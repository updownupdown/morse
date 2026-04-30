import React from "react";
import "./Simulator.scss";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Word } from "./Word";
import { MorseKeys } from "./MorseKeys";

export const Simulator = () => {
  const [message, setMessage] = useLocalStorage("simMessage", "My message");

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
        playWord
        resetWord={resetWord}
        onBackspace={onBackspace}
        submitChar={addCharacter}
        addWordBreak={addWordBreak}
      />
    </div>
  );
};
