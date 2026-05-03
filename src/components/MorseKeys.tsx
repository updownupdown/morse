import React, { useContext, useState } from "react";
import "./MorseKeys.scss";
import { KeyTypes, MorseContext, Setting } from "../context/MorseContext";
import { invalidCharText } from "../data/alphaToMorse";
import { SettingsIcon } from "../icons/SettingsIcon";
import { MorseChar } from "./MorseChar";
import { useStraightKey } from "../hooks/useStraightKey";
import { useIambicKeys } from "../hooks/useIambicKeys";
import { SettingButtons } from "./SettingsModal";
import clsx from "clsx";

interface Props {
  hint?: string;
  submitChar: (char: string) => void;
  startTimer?: (now: number) => void;
}

export const MorseKeys = ({ hint, submitChar, startTimer }: Props) => {
  const { settings } = useContext(MorseContext);

  const [selectKeyType, setSelectKeyType] = useState(false);

  // Straight key
  const {
    KeyButton: StraightKeyButton,
    MorseQueue: StraightMorseQueue,
    MorseProgress: StraightMorseProgress,
    match: StraightMatch,
  } = useStraightKey({
    submitChar,
    startTimer,
  });

  // Iambic keys
  const {
    IambicKeys,
    MorseQueue: IambicMorseQueue,
    match: IambicMatch,
  } = useIambicKeys({
    submitChar,
  });

  return (
    <div className="morse-keys">
      <div className="morse-keys__queue">
        <div className="morse-keys__queue__preview">
          <div className="morse-keys__queue__preview__morse">
            {settings[Setting.KeyType] === KeyTypes.Straight ? (
              <>
                <StraightMorseQueue />
                <StraightMorseProgress />
              </>
            ) : (
              <>
                <IambicMorseQueue />
              </>
            )}

            {hint && (
              <div key={hint} className="morse-hint">
                <MorseChar morse={hint} size="xl" />
              </div>
            )}
          </div>
          <div
            className={clsx(
              "morse-keys__queue__preview__match",
              ((settings[Setting.KeyType] === KeyTypes.Straight &&
                StraightMatch === invalidCharText) ||
                (settings[Setting.KeyType] !== KeyTypes.Straight &&
                  IambicMatch === invalidCharText)) &&
                "morse-keys__queue__preview__match--invalid",
            )}
          >
            {settings[Setting.KeyType] === KeyTypes.Straight
              ? StraightMatch
              : IambicMatch}
          </div>
        </div>
      </div>

      <div className="morse-keys__keys">
        {/* Switch keyboard button */}
        <button
          className="morse-key morse-key--select"
          onClick={() => {
            setSelectKeyType(true);
          }}
        >
          <span>Key</span>
          <SettingsIcon />
        </button>

        {settings[Setting.KeyType] === KeyTypes.Straight ? (
          <StraightKeyButton />
        ) : (
          <IambicKeys />
        )}
      </div>

      {/* Switch keyboard modal */}
      {selectKeyType && (
        <>
          <div
            className="key-selector-modal-mask"
            onClick={() => {
              setSelectKeyType(false);
            }}
          />
          <div className="key-selector-modal">
            <SettingButtons
              setting={Setting.KeyType}
              onClose={() => {
                setSelectKeyType(false);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};
