import { useContext, useEffect, useState } from "react";
import { alphaToMorse, alphaToMorseDict } from "../data/alphaToMorse";
import "./Dictionary.scss";
import clsx from "clsx";
import { MorseChar } from "./Word";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { MorseContext } from "../context/MorseContext";
import { IProsign, prosigns } from "../data/prosigns";

enum Categories {
  Letters = "ABC",
  Numbers = "123",
  Punctuation = "!@#",
  Misc = "Misc",
}

interface SymbolProps {
  text: string;
  morse: string;
  disabled: boolean;
}

export const Symbol = ({ text, morse, disabled }: SymbolProps) => {
  const { playMorse } = useMorseAudio();

  const [isPlayingThis, setIsPlayingThis] = useState(false);

  useEffect(() => {
    if (!disabled) {
      setIsPlayingThis(false);
    }
  }, [disabled]);

  return (
    <button
      className={`symbol symbol--${isPlayingThis && "is-playing"}`}
      onClick={() => {
        setIsPlayingThis(true);
        playMorse(morse);
      }}
      disabled={disabled}
    >
      <div className="symbol__text">{text}</div>
      <div className="symbol__morse">
        <MorseChar morse={morse} size="md" />
      </div>
    </button>
  );
};

export const Dictionary = () => {
  const { isPlayingTone } = useContext(MorseContext);
  const { playMorse } = useMorseAudio();
  const [selectedCategory, setSelectedCategory] = useState(Categories.Letters);

  const parseProsign = (sign: string) => {
    if (sign.indexOf("<") === -1) {
      return <span>{sign}</span>;
    }

    const signParts = sign.split(">");

    return (
      <span>
        {signParts.map((part) => {
          if (part.indexOf("<") !== -1) {
            return (
              <span className="linked" key={part}>
                {part.replace("<", "")}
              </span>
            );
          }

          return <span key={part}>{part}</span>;
        })}
      </span>
    );
  };

  const prosignDictionary = (list: IProsign[]) => {
    return (
      <div className="prosigns">
        {list.map((sign) => {
          return (
            <div key={sign.prosign} className="prosign">
              <button
                className="prosign__top"
                onClick={() => {
                  playMorse(sign.code);
                }}
                disabled={isPlayingTone}
              >
                <div className="prosign__top__sign">
                  {parseProsign(sign.prosign)}
                </div>
                <div className="prosign__top__code">
                  <MorseChar morse={sign.code} size="lg" />
                </div>
              </button>

              <div className="prosign__voice">{sign.voice}</div>

              <div className="prosign__details">{sign.details}</div>
            </div>
          );
        })}
      </div>
    );
  };

  let regex: RegExp;

  switch (selectedCategory) {
    case Categories.Letters:
      regex = /[a-zA-Z]+/g;
      break;
    case Categories.Numbers:
      regex = /[0-9]+/g;
      break;
    case Categories.Punctuation:
      regex = /[^a-zA-Z0-9]+/g;
      break;
  }

  return (
    <div className="dictionary">
      <div className="dictionary__menu">
        <div className="button-menu">
          {Object.values(Categories).map((cat) => {
            return (
              <button
                key={cat}
                className={clsx(
                  "btn-menu-item",
                  selectedCategory === cat
                    ? "btn-menu-item--selected"
                    : "btn-menu-item--not-selected",
                )}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="dictionary__content">
        <span className="dictionary__content__instructions">
          Tap symbol to hear
        </span>

        {selectedCategory !== Categories.Misc && (
          <div className="dictionary__content__symbols">
            {Object.keys(alphaToMorseDict)
              .filter((key) => key.match(regex))
              .map((key, val) => {
                return (
                  <Symbol
                    key={key}
                    text={key}
                    morse={alphaToMorse(key)}
                    disabled={isPlayingTone}
                  />
                );
              })}
          </div>
        )}

        {selectedCategory === Categories.Misc && prosignDictionary(prosigns)}
      </div>
    </div>
  );
};
