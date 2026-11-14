import React, { useContext, useEffect, useRef } from "react";
import { CloseIcon } from "../icons/CloseIcon";
import "./Modal.scss";
import { Menus, MorseContext } from "../context/MorseContext";
import { Tabs } from "./Tabs";

// The sections of Settings, each its own modal
const settingsTabs = [
  { id: Menus.Settings, label: "General" },
  { id: Menus.Key, label: "Key" },
  { id: Menus.Shortcuts, label: "Shortcuts" },
  { id: Menus.Theme, label: "Theme" },
];

const SettingsNav = () => {
  const { selectedMenu, setSelectedMenu } = useContext(MorseContext);

  return (
    <div className="modal__nav">
      <Tabs
        label="Settings sections"
        tabs={settingsTabs}
        selected={selectedMenu}
        onSelect={setSelectedMenu}
      />
    </div>
  );
};

// Where focus was before Settings opened, to hand it back on closing.
// Kept outside the component: moving between sections swaps one modal
// for another.
let focusBeforeModal: HTMLElement | null = null;

const focusable =
  'button:not(:disabled), a[href], input:not(:disabled), textarea, select, [tabindex="0"]';

interface Props {
  title: string;
  children: React.ReactNode;
  showTitle?: boolean;
}

export const Modal = ({ title, children, showTitle = true }: Props) => {
  const { setSelectedMenu, selectedMenu } = useContext(MorseContext);

  // Escape closes the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedMenu(Menus.None);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus moves into the modal, stays there, and goes back afterwards
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const active = document.activeElement as HTMLElement | null;
    if (!active?.closest(".modal")) {
      focusBeforeModal = active;
      modal.focus();
    }

    const keepFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const items = Array.from(modal.querySelectorAll<HTMLElement>(focusable));
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      if (!modal.contains(current)) {
        first.focus();
        e.preventDefault();
      } else if (e.shiftKey && (current === first || current === modal)) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && current === last) {
        first.focus();
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", keepFocus);

    return () => {
      window.removeEventListener("keydown", keepFocus);

      // Once every modal has gone, not when one section replaces another
      window.setTimeout(() => {
        if (document.querySelector(".modal")) return;
        if (focusBeforeModal?.isConnected) focusBeforeModal.focus();
        focusBeforeModal = null;
      }, 0);
    };
  }, []);

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      ref={modalRef}
    >
      <div className="modal__header">
        {showTitle && <span>{title}</span>}

        <button
          aria-label="Close"
          onClick={() => {
            setSelectedMenu(Menus.None);
          }}
        >
          <CloseIcon />
        </button>
      </div>
      {settingsTabs.some((tab) => tab.id === selectedMenu) && <SettingsNav />}
      <div className="modal__content">{children}</div>
    </div>
  );
};
