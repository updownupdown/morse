import React, { useEffect, useState } from "react";
import { useContext } from "react";
import {
  defaultSettings,
  Difficulty,
  KeyTypes,
  KeyTypesDescription,
  MorseContext,
  settingsRange,
} from "../context/MorseContext";
import "./Settings.scss";
import { Modal } from "./Modal";
import { Speaker as SpeakerIcon } from "../icons/Speaker";
import { Reset as ResetIcon } from "../icons/Reset";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { alphaToMorse } from "../data/alphaToMorse";
import { ArrowLeft } from "../icons/ArrowLeft";
import { ArrowRight } from "../icons/ArrowRight";

export const Settings = () => {
  const { playMorse } = useMorseAudio();
  const { settings, setSettings } = useContext(MorseContext);

  const [volume, setVolume] = useState(settings.volume);
  const [unitTime, setUnitTime] = useState(settings.unitTime);
  const [frequency, setFrequency] = useState(settings.frequency);
  const [difficulty, setDifficulty] = useState(settings.difficulty);
  const [keyType, setKeyType] = useState(settings.keyType);

  useEffect(() => {
    setSettings({ unitTime, frequency, difficulty, volume, keyType });
  }, [volume, unitTime, frequency, difficulty, keyType]);

  return (
    <Modal title="Settings">
      <div className="settings">
        <div className="settings__buttons">
          <button
            className="btn btn--outlined"
            onClick={() => {
              setVolume(defaultSettings.volume);
              setUnitTime(defaultSettings.unitTime);
              setFrequency(defaultSettings.frequency);
              setDifficulty(defaultSettings.difficulty);
            }}
          >
            <ResetIcon />
            <span>Reset all</span>
          </button>
          <button
            className="btn btn--outlined"
            onClick={() => {
              playMorse(alphaToMorse("F"));
            }}
          >
            <SpeakerIcon />
            <span>Play sample</span>
          </button>
        </div>

        <div className="settings__content">
          {/* Volume */}
          <div className="setting">
            <div className="setting__header">
              <span className="setting__header__title">Volume</span>
              <div className="setting__header__unit">{volume}%</div>

              <button
                className="setting-btn"
                onClick={() => {
                  setVolume((prev) => prev - settingsRange.volume.step);
                }}
                disabled={volume === settingsRange.volume.min}
              >
                <ArrowLeft />
              </button>
              <button
                className="setting-btn"
                onClick={() => {
                  setVolume((prev) => prev + settingsRange.volume.step);
                }}
                disabled={volume === settingsRange.volume.max}
              >
                <ArrowRight />
              </button>
            </div>

            <div className="setting__input">
              <button
                className="reset-btn"
                onClick={() => {
                  setVolume(defaultSettings.volume);
                }}
                disabled={volume === defaultSettings.volume}
              >
                Reset
              </button>

              <input
                type="range"
                min={settingsRange.volume.min}
                max={settingsRange.volume.max}
                step={settingsRange.volume.step}
                value={volume}
                onChange={(e) => setVolume(Math.round(Number(e.target.value)))}
              />
            </div>
          </div>

          {/* Unit Time */}
          <div className="setting">
            <div className="setting__header">
              <span className="setting__header__title">Unit Time</span>
              <div className="setting__header__unit">{settings.unitTime}ms</div>

              <button
                className="setting-btn"
                onClick={() => {
                  setUnitTime((prev) => prev - settingsRange.unitTime.step);
                }}
                disabled={volume === settingsRange.unitTime.min}
              >
                <ArrowLeft />
              </button>
              <button
                className="setting-btn"
                onClick={() => {
                  setUnitTime((prev) => prev + settingsRange.unitTime.step);
                }}
                disabled={volume === settingsRange.unitTime.max}
              >
                <ArrowRight />
              </button>
            </div>

            <div className="setting__input">
              <button
                className="reset-btn"
                onClick={() => {
                  setUnitTime(defaultSettings.unitTime);
                }}
                disabled={unitTime === defaultSettings.unitTime}
              >
                Reset
              </button>
              <input
                type="range"
                min={settingsRange.unitTime.min}
                max={settingsRange.unitTime.max}
                step={settingsRange.unitTime.step}
                value={unitTime}
                onChange={(e) => setUnitTime(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Frequency */}
          <div className="setting">
            <div className="setting__header">
              <span className="setting__header__title">Frequency</span>
              <div className="setting__header__unit">
                {settings.frequency}Hz
              </div>

              <button
                className="setting-btn"
                onClick={() => {
                  setFrequency((prev) => prev - settingsRange.frequency.step);
                }}
                disabled={volume === settingsRange.frequency.min}
              >
                <ArrowLeft />
              </button>
              <button
                className="setting-btn"
                onClick={() => {
                  setFrequency((prev) => prev + settingsRange.frequency.step);
                }}
                disabled={volume === settingsRange.frequency.max}
              >
                <ArrowRight />
              </button>
            </div>

            <div className="setting__input">
              <button
                className="reset-btn"
                onClick={() => {
                  setFrequency(defaultSettings.frequency);
                }}
                disabled={frequency === defaultSettings.frequency}
              >
                Reset
              </button>
              <input
                type="range"
                min={settingsRange.frequency.min}
                max={settingsRange.frequency.max}
                step={settingsRange.frequency.step}
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
              />
              <div className="setting__input__unit">{frequency}Hz</div>
            </div>
          </div>

          {/* Difficulty */}
          <div className="setting">
            <div className="setting__header">
              <span className="setting__header__title">Difficulty</span>

              <div className="setting__header__hint">
                {settings.difficulty === Difficulty.Easy && (
                  <span>Shows hints quickly</span>
                )}
                {settings.difficulty === Difficulty.Moderate && (
                  <span>Shows hints slowly</span>
                )}
                {settings.difficulty === Difficulty.Hard && (
                  <span>No hints shown</span>
                )}
              </div>
            </div>

            <div className="setting__radios setting__radios--horizontal">
              {Object.values(Difficulty).map((diff) => {
                return (
                  <button
                    key={diff}
                    onClick={() => {
                      setDifficulty(diff as Difficulty);
                    }}
                    className={
                      settings.difficulty === diff ? "selected" : "not-selected"
                    }
                  >
                    <span>{diff}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Type */}
          <div className="setting">
            <div className="setting__header">
              <span className="setting__header__title">Keys Type</span>
            </div>

            <div className="setting__radios setting__radios--vertical">
              {Object.values(KeyTypes).map((keyType) => {
                return (
                  <button
                    key={keyType}
                    onClick={() => {
                      setKeyType(keyType as KeyTypes);
                    }}
                    className={
                      settings.keyType === keyType ? "selected" : "not-selected"
                    }
                  >
                    <span>{keyType}</span>
                    <span>{KeyTypesDescription[keyType]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div className="settings__details">
            <div className="flex">
              <div className="setting-example setting-example--dit" />
              <span>{settings.unitTime}ms</span>
            </div>
            <div className="flex">
              <div className="setting-example setting-example--dah" />
              <span>{settings.unitTime * 3}ms</span>
            </div>
            <div className="flex">
              <span>/</span>
              <span>{settings.unitTime * 7}ms</span>
            </div>
            <div className="flex">
              <span>"PARIS"</span>
              <span>{Math.round((1.2 / settings.unitTime) * 1000)}wpm</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
