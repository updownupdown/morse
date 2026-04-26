import React, { useContext } from "react";
import { Close as CloseIcon } from "../icons/Close";
import "./Modal.scss";
import { Menus, MorseContext } from "../context/MorseContext";

interface Props {
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ title, children }: Props) => {
  const { setSelectedMenu } = useContext(MorseContext);

  return (
    <div className="modal">
      <div className="modal__header">
        <span>{title}</span>

        <button onClick={() => setSelectedMenu(Menus.None)}>
          <CloseIcon />
        </button>
      </div>
      <div className="modal__content">{children}</div>
    </div>
  );
};
