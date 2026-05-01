import { useContext } from "react";
import {
  KeyTypes,
  KeyTypesDescription,
  KeyTypesNames,
  MorseContext,
} from "../context/MorseContext";
import { CloseIcon } from "../icons/CloseIcon";

interface Props {
  onClose?: () => void;
}

export const KeySelector = ({ onClose }: Props) => {
  const { settings, setSettings } = useContext(MorseContext);

  return (
    <div className="setting">
      <div className="setting__header">
        <span className="setting__header__title">Keys</span>

        {onClose && (
          <button
            onClick={() => {
              onClose();
            }}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      <div className="setting__radios setting__radios--vertical">
        {Object.values(KeyTypes).map((keyType) => {
          return (
            <button
              key={keyType}
              onClick={() => {
                setSettings({ ...settings, keyType });
                onClose && onClose();
              }}
              className={
                settings.keyType === keyType ? "selected" : "not-selected"
              }
            >
              <span>{KeyTypesNames[keyType]}</span>
              <span>{KeyTypesDescription[keyType]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
