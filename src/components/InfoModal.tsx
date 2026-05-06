import { useContext } from "react";
import { MorseContext, Setting } from "../context/MorseContext";
import "./InfoModal.scss";
import { Modal } from "./Modal";

export const InfoModal = () => {
  const { settings, setSettings } = useContext(MorseContext);

  return (
    <Modal title="Info">
      <div className="info">
        <div className="flex">
          <div className="setting-example setting-example--dit" />
          <span>{settings[Setting.UnitTime]}ms</span>
        </div>
        <div className="flex">
          <div className="setting-example setting-example--dah" />
          <span>{settings[Setting.UnitTime] * 3}ms</span>
        </div>
        <div className="flex">
          <span>/</span>
          <span>{settings[Setting.UnitTime] * 7}ms</span>
        </div>
        <div className="flex">
          <span>"PARIS"</span>
          <span>
            {Math.round((1.2 / settings[Setting.UnitTime]) * 1000)}wpm
          </span>
        </div>
      </div>
    </Modal>
  );
};
