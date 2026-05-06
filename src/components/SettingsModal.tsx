import { useContext, useEffect } from "react";
import {
  defaultSettings,
  MorseContext,
  Setting,
  settingsSpecs,
} from "../context/MorseContext";
import "./SettingsModal.scss";
import { Modal } from "./Modal";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import { ResetIcon } from "../icons/ResetIcon";
import { useAudio } from "../hooks/useAudio";
import { alphaToMorse } from "../data/alphaToMorse";
import { CloseIcon } from "../icons/CloseIcon";
import { PlusIcon } from "../icons/PlusIcon";
import { MinusIcon } from "../icons/MinusIcon";
import { StopIcon } from "../icons/StopIcon";
import clsx from "clsx";

interface SettingSliderProps {
  setting: Setting;
}

export const SettingSlider = ({ setting }: SettingSliderProps) => {
  const { settings, setSettings } = useContext(MorseContext);

  const specs = settingsSpecs[setting];
  const currentValue = Number(settings[setting]);

  function setThisSetting(newValue: number) {
    setSettings({ ...settings, [setting]: newValue });
  }

  if (
    specs.unit === undefined ||
    specs.min === undefined ||
    specs.max === undefined ||
    specs.step === undefined
  )
    return null;

  return (
    <div className="setting setting--slider">
      <div className="setting__left">
        <div className="setting__left__top">
          <div className="setting-title">
            <span>{specs.title}</span>
          </div>

          <button
            className="reset-btn"
            onClick={() => {
              setThisSetting(Number(defaultSettings[setting]));
            }}
            disabled={currentValue === defaultSettings[setting]}
          >
            Reset
          </button>
        </div>

        <div className="setting__left__bottom">
          <div className="setting__left__bottom__value">
            {settings[setting]}
            {specs.unit}
          </div>

          <input
            type="range"
            min={specs.min}
            max={specs.max}
            step={specs.step}
            value={currentValue}
            onChange={(e) => setThisSetting(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="setting__right">
        <button
          className="setting-btn"
          onClick={() => {
            setThisSetting(currentValue + specs.step!);
          }}
          disabled={currentValue === specs.max}
        >
          <PlusIcon />
        </button>
        <button
          className="setting-btn"
          onClick={() => {
            setThisSetting(currentValue - specs.step!);
          }}
          disabled={settings[setting] === specs.min}
        >
          <MinusIcon />
        </button>
      </div>
    </div>
  );
};

interface SettingButtonsProps {
  setting: Setting;
  onClose?: () => void;
}

export const SettingButtons = ({ setting, onClose }: SettingButtonsProps) => {
  const { settings, setSettings } = useContext(MorseContext);

  const specs = settingsSpecs[setting];
  const currentValue = settings[setting];
  const isKeySelector = setting === Setting.KeyType;

  if (!specs.values || typeof currentValue === "boolean") return null;

  function setThisSetting(newValue: string) {
    setSettings({ ...settings, [setting]: newValue });
  }

  return (
    <div className="setting setting--buttons">
      <div className="setting__left">
        <div className="setting__left__top">
          <div className="setting-title">
            <span>{specs.title}</span>
          </div>

          {onClose && (
            <button
              className="setting-close-btn"
              onClick={() => {
                onClose();
              }}
            >
              <CloseIcon />
            </button>
          )}

          {!isKeySelector && specs.hints?.[currentValue] && (
            <div className="setting__left__top__hint">
              <span>{specs.hints?.[currentValue]}</span>
            </div>
          )}
        </div>

        <div
          className={`button-menu button-menu--${isKeySelector ? "vertical" : "horizontal"}`}
        >
          {Object.values(specs.values).map((key) => {
            return (
              <button
                key={key}
                onClick={() => {
                  setThisSetting(key);
                  onClose && onClose();
                }}
                className={`btn-menu-item btn-menu-item--${currentValue === key ? "selected" : "not-selected"}`}
              >
                <span>{key}</span>

                {isKeySelector && specs.hints?.[key] && (
                  <span>{specs.hints?.[key]}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const SettingToggle = ({ setting }: SettingButtonsProps) => {
  const { settings, setSettings } = useContext(MorseContext);

  const specs = settingsSpecs[setting];
  const currentValue = settings[setting];

  if (typeof currentValue !== "boolean") return null;

  function setThisSetting(newValue: boolean) {
    setSettings({ ...settings, [setting]: newValue });
  }

  return (
    <button
      className="setting setting--toggle"
      onClick={() => {
        setThisSetting(!currentValue);
      }}
    >
      <div className="setting__left">
        <div className="setting-title">
          <span>{specs.title}</span>
          {specs.hint && <span>{specs.hint}</span>}
        </div>
      </div>

      <div className="setting__right">
        <div
          className={`setting-toggle setting-toggle--${currentValue ? "on" : "off"}`}
        >
          <div className="setting-toggle__plate" />
        </div>
      </div>
    </button>
  );
};

export const SettingsModal = () => {
  const { playMorse, stopMorse } = useAudio();
  const { settings, setSettings, isPlaying } = useContext(MorseContext);

  useEffect(() => {
    return () => {
      stopMorse();
    };
  }, []);

  return (
    <Modal title="Settings">
      <div className="settings">
        <div className="settings__content">
          <SettingButtons setting={Setting.Hints} />

          <div className="settings__content__toggles">
            <SettingToggle setting={Setting.AutoPlayLetter} />
            {/* <SettingToggle setting={Setting.AutoWordBreak} /> */}
            <SettingToggle setting={Setting.ShowStats} />
          </div>

          <SettingSlider setting={Setting.UnitTime} />
          <SettingSlider setting={Setting.Farnsworth} />
          <SettingSlider setting={Setting.Frequency} />
          <SettingSlider setting={Setting.Volume} />

          <div className="settings__content__buttons">
            <button
              className="btn btn--outlined"
              onClick={() => {
                setSettings(defaultSettings);
              }}
            >
              <ResetIcon />
              <span>Reset all</span>
            </button>
            <button
              className={clsx(
                "btn btn--outlined",
                isPlaying && "btn--outlined-stop",
              )}
              onClick={() => {
                if (isPlaying) {
                  stopMorse();
                } else {
                  playMorse(alphaToMorse("ABC"));
                }
              }}
            >
              {isPlaying ? <StopIcon /> : <SpeakerIcon />}
              <span>{isPlaying ? "Stop" : "Play sample"}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
