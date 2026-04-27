import React, { useContext } from "react";
import "./Start.scss";
import { Modal } from "./Modal";
import { Menus, MorseContext } from "../context/MorseContext";
import { useMorseAudio } from "../hooks/useMorseAudio";

export const Start = () => {
  const { setSelectedMenu } = useContext(MorseContext);
  const { playMorse } = useMorseAudio();

  return (
    <Modal title="Start">
      <div className="start">
        <button
          className="btn btn--full"
          onClick={() => {
            playMorse("");
            setSelectedMenu(Menus.None);
          }}
        >
          Start
        </button>
      </div>
    </Modal>
  );
};
