import React from "react";
import { Modal } from "./Modal";
import "./KeyboardShortcuts.scss";

export const KeyboardShortcuts = () => {
  return (
    <Modal title="Settings">
      <div className="kb-shortcuts">
        <span className="kb-category">Keys</span>

        <div className="kb-shortcut">
          <span>Dit (.)</span>
          <span>[</span>
        </div>
        <div className="kb-shortcut">
          <span>Dah (-)</span>
          <span>]</span>
        </div>
        <div className="kb-shortcut">
          <span>Straight Key</span>
          <span>.</span>
        </div>

        <span className="kb-category">Receive</span>
        <div className="kb-shortcut kb-shortcut--large">
          <span>Play/pause word</span>
          <span>&#9141;</span>
        </div>
        <div className="kb-shortcut kb-shortcut--xlarge">
          <span>Play/pause letter</span>
          <span>&#x2192;</span>
        </div>
        <div className="kb-shortcut">
          <span>Guess letter</span>
          <span>A-Z</span>
        </div>

        <span className="kb-category">On Air</span>
        <div className="kb-shortcut">
          <span>Type along (stream copy)</span>
          <span>A-Z</span>
        </div>

        <span className="kb-category">Games</span>
        <div className="kb-shortcut">
          <span>Answer by ear</span>
          <span>A-Z</span>
        </div>
        <div className="kb-shortcut kb-shortcut--large">
          <span>Play it again</span>
          <span>&#9141;</span>
        </div>
        <div className="kb-shortcut">
          <span>Next / guess</span>
          <span>Enter</span>
        </div>
        <div className="kb-shortcut kb-shortcut--large">
          <span>Steady Hand key</span>
          <span>&#9141;</span>
        </div>

        <span className="kb-category">Free key</span>
        <div className="kb-shortcut kb-shortcut--large">
          <span>Play/pause</span>
          <span>&#9141;</span>
        </div>
        <div className="kb-shortcut kb-shortcut--large">
          <span>Backspace</span>
          <span>&#x232B;</span>
        </div>
        <div className="kb-shortcut">
          <span>Clear word</span>
          <span>Del</span>
        </div>
        <div className="kb-shortcut">
          <span>Add word break</span>
          <span>/</span>
        </div>
        <div className="kb-shortcut">
          <span>Insert letters</span>
          <span>A-Z</span>
        </div>
      </div>
    </Modal>
  );
};
