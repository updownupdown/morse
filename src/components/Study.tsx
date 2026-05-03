import { useContext, useEffect, useState } from "react";
import { alphaToMorse, alphaToMorseDict } from "../data/alphaToMorse";
import "./Study.scss";
import clsx from "clsx";
import { useMorseAudio } from "../hooks/useMorseAudio";
import { MorseContext } from "../context/MorseContext";
import { prosigns } from "../data/prosigns";
import { MorseChar } from "./MorseChar";

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
      className={clsx(
        "symbol",
        isPlayingThis && "symbol--is-playing beep-glow",
      )}
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

type ProsignDictionaryProps = {
  disabled: boolean;
};

const ProsignDictionary = ({ disabled }: ProsignDictionaryProps) => {
  const { playMorse } = useMorseAudio();

  return (
    <div className="prosigns">
      {prosigns.map((sign) => {
        const [isPlayingThis, setIsPlayingThis] = useState(false);

        useEffect(() => {
          if (!disabled) {
            setIsPlayingThis(false);
          }
        }, [disabled]);

        return (
          <button
            key={sign.prosign}
            className={clsx(
              "prosign",
              isPlayingThis && "prosign--is-playing beep-glow",
            )}
            onClick={() => {
              setIsPlayingThis(true);
              playMorse(sign.code);
            }}
            disabled={disabled}
          >
            <div className="prosign__top">
              <div className="prosign__top__sign">
                {parseProsign(sign.prosign)}
              </div>

              <div className="prosign__top__voice">{sign.voice}</div>
            </div>

            <div className="prosign__code">
              <MorseChar morse={sign.code} size="lg" />
            </div>

            <div className="prosign__details">{sign.details}</div>
          </button>
        );
      })}
    </div>
  );
};

export const Study = () => {
  const { isPlaying } = useContext(MorseContext);
  const { playMorse } = useMorseAudio();
  const [selectedCategory, setSelectedCategory] = useState(Categories.Letters);

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
    <div className="study">
      <div className="study__menu">
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

      <div className="study__content">
        <span className="study__content__instructions">Tap symbol to hear</span>

        {selectedCategory !== Categories.Misc && (
          <div className="study__content__symbols">
            {Object.keys(alphaToMorseDict)
              .filter((key) => key.match(regex))
              .map((key, val) => {
                return (
                  <Symbol
                    key={key}
                    text={key}
                    morse={alphaToMorse(key)}
                    disabled={isPlaying !== undefined}
                  />
                );
              })}
          </div>
        )}

        {selectedCategory === Categories.Misc && (
          <ProsignDictionary disabled={isPlaying !== undefined} />
        )}
      </div>
    </div>
  );
};
