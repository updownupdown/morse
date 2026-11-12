import React, { useContext, useEffect } from "react";
import { CloseIcon } from "../icons/CloseIcon";
import "./Modal.scss";
import { Menus, MorseContext } from "../context/MorseContext";

// Theme, shortcuts and help all live under Settings
const settingsSections = [
  Menus.Settings,
  Menus.Theme,
  Menus.Shortcuts,
  Menus.Info,
];

const settingsSectionNames: Partial<Record<Menus, string>> = {
  [Menus.Settings]: "General",
  [Menus.Theme]: "Theme",
  [Menus.Shortcuts]: "Keys",
  [Menus.Info]: "Help",
};

const SettingsNav = () => {
  const { selectedMenu, setSelectedMenu } = useContext(MorseContext);

  return (
    <div className="modal__nav">
      <div className="button-menu">
        {settingsSections.map((section) => (
          <button
            key={section}
            className={`btn-menu-item btn-menu-item--${selectedMenu === section ? "selected" : "not-selected"}`}
            onClick={() => setSelectedMenu(section)}
          >
            {settingsSectionNames[section]}
          </button>
        ))}
      </div>
    </div>
  );
};

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

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
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
      {settingsSections.includes(selectedMenu) && <SettingsNav />}
      <div className="modal__content">{children}</div>
    </div>
  );
};
