import React, { useContext, useState } from "react";
import "./MorseKeys.scss";
import {
  KeyTypes,
  KeyTypesNames,
  MorseContext,
  Setting,
} from "../context/MorseContext";
import { invalidCharText, maxCodeLength } from "../data/alphaToMorse";
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
    onPressDown: straightOnKeyDown,
    onPressUp: straightOnKeyUp,
    MorseQueue: StraightMorseQueue,
    MorseProgress: StraightMorseProgress,
    queue: straightQueue,
    match: StraightMatch,
    isPressed: straightIsPressed,
  } = useStraightKey({
    submitChar,
    startTimer,
  });

  // Iambic keys
  const {
    MorseQueue: IambicMorseQueue,
    match: IambicMatch,
    onKeyDown: iambicOnKeyDown,
    onKeyUp: iambicOnKeyUp,
    queue: iambicQueue,
    pressState: iambicPressState,
  } = useIambicKeys({
    submitChar,
  });

  return (
    <div className="morse-keys">
      <div className="morse-keys__top">
        <div className="morse-keys__top__select">
          {/* Switch keyboard button */}
          <span className="morse-key-select">
            <span>{KeyTypesNames[settings[Setting.KeyType]]}</span>
            <button
              className="morse-key-select-btn"
              onClick={() => {
                setSelectKeyType(true);
              }}
            >
              Change Key
            </button>
          </span>
        </div>

        <div className="morse-keys__top__queue">
          <div className="morse-keys__top__queue__morse">
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
              "morse-keys__top__queue__match",
              ((settings[Setting.KeyType] === KeyTypes.Straight &&
                StraightMatch === invalidCharText) ||
                (settings[Setting.KeyType] !== KeyTypes.Straight &&
                  IambicMatch === invalidCharText)) &&
                "morse-keys__top__queue__match--invalid",
            )}
          >
            {settings[Setting.KeyType] === KeyTypes.Straight
              ? StraightMatch
              : IambicMatch}
          </div>
        </div>
      </div>

      <div className="morse-keys__keys">
        {settings[Setting.KeyType] === KeyTypes.Straight ? (
          <button
            className={clsx(
              "morse-key morse-key--straight",
              straightIsPressed && "morse-key--pressed",
            )}
            onPointerDown={straightOnKeyDown}
            onPointerUp={straightOnKeyUp}
            onPointerOut={straightOnKeyUp}
            onPointerLeave={straightOnKeyUp}
            disabled={straightQueue?.length === maxCodeLength}
          >
            Tap/hold
          </button>
        ) : (
          <>
            <button
              className={clsx(
                "morse-key morse-key--dit",
                iambicPressState.dit !== undefined && "morse-key--pressed",
              )}
              onPointerDown={(e) => {
                e.preventDefault();
                iambicOnKeyDown("dit");
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                iambicOnKeyUp("dit");
              }}
              onPointerOut={(e) => {
                e.preventDefault();
                iambicOnKeyUp("dit");
              }}
              onPointerCancel={(e) => {
                e.preventDefault();
                iambicOnKeyUp("dit");
              }}
              disabled={iambicQueue.length === maxCodeLength}
            >
              <div />
            </button>
            <button
              className={clsx(
                "morse-key morse-key--dah",
                iambicPressState.dah !== undefined && "morse-key--pressed",
              )}
              onPointerDown={(e) => {
                e.preventDefault();
                iambicOnKeyDown("dah");
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                iambicOnKeyUp("dah");
              }}
              onPointerOut={(e) => {
                e.preventDefault();
                iambicOnKeyUp("dah");
              }}
              onPointerCancel={(e) => {
                e.preventDefault();
                iambicOnKeyUp("dah");
              }}
              disabled={iambicQueue.length === maxCodeLength}
            >
              <div />
            </button>
          </>
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
