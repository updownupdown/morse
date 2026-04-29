import React, { useEffect, useState } from "react";
import { useContext } from "react";
import {
  defaultSettings,
  Difficulty,
  MorseContext,
} from "../context/MorseContext";
import "./Settings.scss";
import { Modal } from "./Modal";
import { Speaker as SpeakerIcon } from "../icons/Speaker";
import { Reset as ResetIcon } from "../icons/Reset";
import { easyFreqOffset, useMorseAudio } from "../hooks/useMorseAudio";
import { alphaToMorse } from "../data/alphaToMorse";

export const Settings = () => {
  const { playMorse } = useMorseAudio();
  const { settings, setSettings } = useContext(MorseContext);

  const [volume, setVolume] = useState(settings.volume);
  const [unitTime, setUnitTime] = useState(settings.unitTime);
  const [frequency, setFrequency] = useState(settings.frequency);
  const [difficulty, setDifficulty] = useState(settings.difficulty);

  useEffect(() => {
    setSettings({ unitTime, frequency, difficulty, volume });
  }, [volume, unitTime, frequency, difficulty]);

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
          <div className="setting">
            <span className="setting__title">Volume</span>

            <div className="setting__input">
              <button
                className="reset-btn"
                onClick={() => {
                  setVolume(defaultSettings.volume);
                }}
              >
                Reset
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
              <div className="setting__input__unit">{volume * 100}%</div>
            </div>
          </div>

          <div className="setting">
            <span className="setting__title">Unit Time</span>

            <div className="setting__input">
              <button
                className="reset-btn"
                onClick={() => {
                  setUnitTime(defaultSettings.unitTime);
                }}
              >
                Reset
              </button>
              <input
                type="range"
                min="30"
                max="200"
                step={10}
                value={unitTime}
                onChange={(e) => setUnitTime(Number(e.target.value))}
              />
              <div className="setting__input__unit">{unitTime}ms</div>
            </div>

            <div className="setting__details">
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

          <div className="setting">
            <span className="setting__title">Frequency</span>

            <div className="setting__input">
              <button
                className="reset-btn"
                onClick={() => {
                  setFrequency(defaultSettings.frequency);
                }}
              >
                Reset
              </button>
              <input
                type="range"
                min="50"
                max="800"
                step={20}
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
              />
              <div className="setting__input__unit">{frequency}Hz</div>
            </div>

            {difficulty === Difficulty.Easy && (
              <div className="setting__details">
                <div>
                  <span className="small-text">
                    Easy difficulty
                    <br />
                    shifts frequencies
                  </span>
                </div>
                <div className="flex">
                  <div className="setting-example setting-example--dit" />
                  <span>{settings.frequency - easyFreqOffset}Hz</span>
                </div>
                <div className="flex">
                  <div className="setting-example setting-example--dah" />
                  <span>{settings.frequency + easyFreqOffset}Hz</span>
                </div>
              </div>
            )}
          </div>

          <div className="setting">
            <span className="setting__title">Difficulty</span>

            <div className="setting__radios">
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
                    {diff}
                  </button>
                );
              })}
            </div>

            <div className="setting__details">
              {settings.difficulty === Difficulty.Easy && (
                <span className="small-text">
                  Shows hints quickly, and uses different frequencies for dots
                  and dashes.
                </span>
              )}
              {settings.difficulty === Difficulty.Moderate && (
                <span className="small-text">Shows hints slowly</span>
              )}
              {settings.difficulty === Difficulty.Hard && (
                <span className="small-text">No hints shown</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
