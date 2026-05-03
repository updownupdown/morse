import { useContext } from "react";
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
import { useMorseAudio } from "../hooks/useMorseAudio";
import { alphaToMorse } from "../data/alphaToMorse";
import { ArrowLeftIcon } from "../icons/ArrowLeftIcon";
import { ArrowRightIcon } from "../icons/ArrowRightIcon";
import { CloseIcon } from "../icons/CloseIcon";

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
      <div className="setting__top">
        <span className="setting__top__title">{specs.title}</span>

        <button
          className="reset-btn"
          onClick={() => {
            setThisSetting(Number(defaultSettings[setting]));
          }}
          disabled={currentValue === defaultSettings[setting]}
        >
          Reset
        </button>

        <button
          className="setting-btn"
          onClick={() => {
            setThisSetting(currentValue - specs.step!);
          }}
          disabled={settings[setting] === specs.min}
        >
          <ArrowLeftIcon />
        </button>
        <button
          className="setting-btn"
          onClick={() => {
            setThisSetting(currentValue + specs.step!);
          }}
          disabled={currentValue === specs.max}
        >
          <ArrowRightIcon />
        </button>
      </div>

      <div className="setting__bottom">
        <div className="setting__bottom__value">
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

  if (!specs.values) return null;

  function setThisSetting(newValue: string) {
    setSettings({ ...settings, [setting]: newValue });
  }

  return (
    <div className="setting setting--buttons">
      <div className="setting__top">
        <span className="setting__top__title">{specs.title}</span>

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
          <div className="setting__top__hint">
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
  );
};

export const SettingsModal = () => {
  const { playMorse } = useMorseAudio();
  const { settings, setSettings } = useContext(MorseContext);

  return (
    <Modal title="Settings">
      <div className="settings">
        <div className="settings__buttons">
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
            className="btn btn--outlined"
            onClick={() => {
              playMorse(alphaToMorse("ABC"));
            }}
          >
            <SpeakerIcon />
            <span>Play sample</span>
          </button>
        </div>

        <div className="settings__content">
          <SettingButtons setting={Setting.Difficulty} />

          <SettingSlider setting={Setting.UnitTime} />
          <SettingSlider setting={Setting.Farnsworth} />
          <SettingSlider setting={Setting.Frequency} />
          <SettingSlider setting={Setting.Volume} />

          <SettingButtons setting={Setting.KeyType} />

          {/* Details */}
          <div className="settings__details">
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
        </div>
      </div>
    </Modal>
  );
};
