import { useContext } from "react";
import { Menus, MorseContext, Setting } from "../context/MorseContext";
import "./ThemeModal.scss";
import { Modal } from "./Modal";

export enum Themes {
  Teal = "Teal",
  Antique = "Antique",
  Rose = "Rose",
  Autumn = "Autumn",
  Neon = "Neon",
  HiFi = "Hi-Fi",
  Tropical = "Tropical",
  Eggplant = "Eggplant",
  Console = "Console",
  Robot = "Robot",
}

export function updateMetaThemeColor() {
  // Delay setting the theme-color, or the outdated value will be used
  setTimeout(() => {
    const themeBgColor =
      getComputedStyle(
        document.getElementsByClassName("app")[0],
      ).getPropertyValue("--background-main") ?? "#000000";

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", themeBgColor);
  }, 20);
}

export const ThemeModal = () => {
  const { settings, setSettings, setSelectedMenu } = useContext(MorseContext);

  return (
    <Modal title="Themes">
      <div className="themes">
        <div className="button-menu button-menu--vertical  button-menu--vertical-wrap">
          {Object.values(Themes).map((theme) => (
            <button
              key={theme}
              className={`btn-menu-item btn-menu-item--${settings.Theme === theme ? "selected" : "not-selected"}`}
              onClick={() => {
                setSettings({ ...settings, [Setting.Theme]: theme });
                updateMetaThemeColor();
              }}
            >
              {theme}
            </button>
          ))}
        </div>

        <button
          className="btn btn--large"
          onClick={() => {
            setSelectedMenu(Menus.None);
          }}
        >
          <span>Close</span>
        </button>
      </div>
    </Modal>
  );
};
