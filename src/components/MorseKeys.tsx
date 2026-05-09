import React, { useContext, useState } from "react";
import "./MorseKeys.scss";
import {
  KeyTypes,
  KeyTypesNames,
  Menus,
  MorseContext,
  Setting,
} from "../context/MorseContext";
import { maxCodeLength } from "../data/alphaToMorse";
import { MorseChar } from "./MorseChar";
import { useStraightKey } from "../hooks/useStraightKey";
import { useIambicKeys } from "../hooks/useIambicKeys";
import { SettingButtons } from "./SettingsModal";
import clsx from "clsx";

interface Props {
  hint?: string;
  setGuess: (char: string) => void;
}

export const MorseKeys = ({ hint, setGuess }: Props) => {
  const { settings, selectedMenu, phase } = useContext(MorseContext);

  const [selectKeyType, setSelectKeyType] = useState(false);

  // Straight key
  const {
    onPressDown: straightOnKeyDown,
    onPressUp: straightOnKeyUp,
    MorseQueue: StraightMorseQueue,
    MorseProgress: StraightMorseProgress,
    queue: straightQueue,
    isPressed: straightIsPressed,
  } = useStraightKey({
    setGuess,
  });

  // Iambic keys
  const {
    MorseQueue: IambicMorseQueue,
    onKeyDown: iambicOnKeyDown,
    onKeyUp: iambicOnKeyUp,
    queue: iambicQueue,
    pressState: iambicPressState,
  } = useIambicKeys({
    setGuess,
  });

  return (
    <div
      className={clsx(
        "morse-keys",
        ["prepare", "standby", "stats"].includes(phase) &&
          "morse-keys--hide-keys",
      )}
    >
      <div className="morse-keys__top">
        <div className="morse-keys__top__morse-queue">
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

        <button
          className="morse-keys__top__change"
          onClick={() => {
            setSelectKeyType(true);
          }}
        >
          <span>{KeyTypesNames[settings[Setting.KeyType]]}</span>
          <span>[Change]</span>
        </button>
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
            disabled={
              straightQueue?.length === maxCodeLength ||
              selectedMenu !== Menus.None
            }
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
              disabled={
                iambicQueue.length === maxCodeLength ||
                selectedMenu !== Menus.None
              }
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
              disabled={
                iambicQueue.length === maxCodeLength ||
                selectedMenu !== Menus.None
              }
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
