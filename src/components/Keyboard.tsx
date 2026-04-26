import React from "react";
import { alphaToMorse } from "../data";
import "./Keyboard.scss";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { MorseChar } from "./Word";

interface KeyProps {
  letter: string;
}

interface KeyboardProps {
  onPress: (key: string) => void;
}

export const Keyboard = ({ onPress }: KeyboardProps) => {
  // const { settings } = useContext(MorseContext);
  // const { playMorse } = useMorseAudio();

  const Key = ({ letter }: KeyProps) => {
    return (
      <button
        key={letter}
        className="key"
        onClick={() => {
          // playMorse(alphaToMorse[letter]);
          onPress(letter);
        }}
      >
        <span className="key__letter">{letter}</span>
        <MorseChar morse={alphaToMorse[letter]} size="sm" />
      </button>
    );
  };

  return (
    <div className="keyboard">
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
      </div>
    </div>
  );
};
