import React, { useContext } from "react";
import { CloseIcon } from "../icons/CloseIcon";
import "./Modal.scss";
import { Menus, MorseContext } from "../context/MorseContext";

interface Props {
  title: string;
  children: React.ReactNode;
  showTitle?: boolean;
}

export const Modal = ({ title, children, showTitle = true }: Props) => {
  const { setSelectedMenu } = useContext(MorseContext);

  return (
    <div className="modal">
      <div className="modal__header">
        {showTitle && <span>{title}</span>}

        <button
          onClick={() => {
            setSelectedMenu(Menus.None);
          }}
        >
          <CloseIcon />
        </button>
      </div>
      <div className="modal__content">{children}</div>
    </div>
  );
};
