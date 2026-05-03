import React from "react";
import { alphaToMorse } from "../data/alphaToMorse";
import "./Keyboard.scss";
import clsx from "clsx";
import { MorseChar } from "./MorseChar";

interface KeyProps {
  letter: string;
}

interface KeyboardProps {
  onPress: (key: string) => void;
  isSpecialChars?: boolean;
}

export const Keyboard = ({ onPress, isSpecialChars }: KeyboardProps) => {
  const Key = ({ letter }: KeyProps) => {
    return (
      <button
        key={letter}
        className="key"
        onClick={() => {
          onPress(letter);
        }}
      >
        <span className="key__letter">{letter}</span>
        <MorseChar morse={alphaToMorse(letter)} size="sm" />
      </button>
    );
  };

  return (
    <div className="keyboard-wrap">
      <div
        className={clsx(
          "keyboard",
          isSpecialChars ? "keyboard--special-chars" : "keyboard--regular",
        )}
      >
        {isSpecialChars ? (
          <>
            <div className="keyboard__row">
              <Key letter="1" />
              <Key letter="2" />
              <Key letter="3" />
              <Key letter="4" />
              <Key letter="5" />
              <Key letter="6" />
              <Key letter="7" />
            </div>
            <div className="keyboard__row">
              <Key letter="8" />
              <Key letter="9" />
              <Key letter="0" />
              <Key letter="!" />
              <Key letter="?" />
              <Key letter="/" />
              <Key letter="@" />
            </div>
            <div className="keyboard__row">
              <Key letter="(" />
              <Key letter=")" />
              <Key letter="'" />
              <Key letter='"' />
              <Key letter="-" />
              <Key letter="+" />
              <Key letter="=" />
            </div>
            <div className="keyboard__row">
              <Key letter="&" />
              <Key letter="." />
              <Key letter="," />
              <Key letter=":" />
              <Key letter=";" />
            </div>
          </>
        ) : (
          <>
            <div className="keyboard__row">
              <Key letter="Q" />
              <Key letter="W" />
              <Key letter="E" />
              <Key letter="R" />
              <Key letter="T" />
              <Key letter="Y" />
              <Key letter="U" />
              <Key letter="I" />
              <Key letter="O" />
              <Key letter="P" />
            </div>
            <div className="keyboard__row">
              <Key letter="A" />
              <Key letter="S" />
              <Key letter="D" />
              <Key letter="F" />
              <Key letter="G" />
              <Key letter="H" />
              <Key letter="J" />
              <Key letter="K" />
              <Key letter="L" />
            </div>
            <div className="keyboard__row">
              <Key letter="Z" />
              <Key letter="X" />
              <Key letter="C" />
              <Key letter="V" />
              <Key letter="B" />
              <Key letter="N" />
              <Key letter="M" />
              <Key letter="," />
              <Key letter="'" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
