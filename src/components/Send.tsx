import { useContext, useEffect, useRef } from "react";
import "./Send.scss";
import { MorseKeys } from "./MorseKeys";
import {
  defaultSendSourceQty,
  maxSendSourceQty,
  SendSources,
} from "../data/DataSources";
import { MorseContext } from "../context/MorseContext";
import { conditionalPluralize, formatForCSSClass } from "../utils/utils";
import { initCode } from "../hooks/useAudio";
import { useQuiz } from "../hooks/useQuiz";
import { Word } from "./Word";
import { alphaToMorse } from "../data/alphaToMorse";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { PlusIcon } from "../icons/PlusIcon";
import { MinusIcon } from "../icons/MinusIcon";
import { Practice } from "./Practice";
import { useAudioContext } from "../context/AudioContext";

export const Send = () => {
  const { setQuizSource, quizQty, setQuizQty, phase, setPhase } =
    useContext(MorseContext);
  const { playMorse, stopMorse } = useAudioContext();

  const { setGuess, word, letterIndex, guess } = useQuiz();
  const [practiceWord, setPracticeWord] = useLocalStorage("practiceWord", "");
  const practiceWordRef = useRef(practiceWord);
  practiceWordRef.current = practiceWord;

  const [sendSource, setSendSource] = useLocalStorage<SendSources>(
    "sendSource",
    SendSources.Words,
  );
  const [sendSourceQuantities, setSendSourceQuantities] = useLocalStorage<
    Record<SendSources, number>
  >("sendSourceQty", defaultSendSourceQty);

  useEffect(() => {
    setQuizSource(sendSource);
    setQuizQty(
      sendSourceQuantities[sendSource] ?? defaultSendSourceQty[sendSource],
    );
  }, [sendSource]);

  useEffect(() => {
    setSendSourceQuantities({
      ...sendSourceQuantities,
      [sendSource]: quizQty ?? defaultSendSourceQty[sendSource],
    });
  }, [quizQty]);

  function addPracticeCharacter(char: string) {
    // Don't add more than one wordbreak in a row
    if (
      char === " " &&
      practiceWordRef.current.charAt(practiceWordRef.current.length - 1) === " "
    ) {
      return;
    }

    setPracticeWord(practiceWordRef.current + char);
  }

  return (
    <div
      className={`quiz quiz--send quiz--source-${formatForCSSClass(sendSource)}`}
    >
      <div className="quiz__content">
        {["standby", "stats"].includes(phase) && quizQty && (
          <>
            <div className="button-menu button-menu--vertical">
              {Object.entries(SendSources).map(([key, val]) => {
                return (
                  <button
                    key={key}
                    className={`btn-menu-item btn-menu-item--${sendSource === val ? "selected" : "not-selected"}`}
                    onClick={() => {
                      setPhase("standby");
                      setSendSource(val as SendSources);
                    }}
                  >
                    {val}
                  </button>
                );
              })}
            </div>

            <span className="quiz__content__qty">
              <button
                className="btn btn--outlined"
                onClick={() => {
                  if (quizQty) {
                    setQuizQty(quizQty - 1);
                  }
                }}
                disabled={quizQty === 1}
              >
                <MinusIcon />
              </button>

              <div className="quiz__content__qty__practice">
                Send anything you want!
              </div>

              <div className="quiz__content__qty__desc">
                <span>{quizQty}</span>
                <span>{conditionalPluralize(sendSource, quizQty)}</span>
              </div>

              <button
                className="btn btn--outlined"
                onClick={() => {
                  if (quizQty) {
                    setQuizQty(quizQty + 1);
                  }
                }}
                disabled={quizQty === maxSendSourceQty[sendSource]}
              >
                <PlusIcon />
              </button>
            </span>
          </>
        )}

        {phase === "practice" && (
          <Practice
            practiceWord={practiceWord}
            setPracticeWord={setPracticeWord}
            addPracticeCharacter={addPracticeCharacter}
          />
        )}

        {phase === "guess" && (
          <div className="quiz__content__word">
            <Word guess={guess} word={word} letterIndex={letterIndex} />
          </div>
        )}
      </div>

      <div className="quiz__bottom">
        <MorseKeys
          hint={
            phase === "guess" && word !== undefined && letterIndex !== undefined
              ? alphaToMorse(word.charAt(letterIndex).toUpperCase())
              : undefined
          }
          setGuess={
            sendSource === SendSources.Practice
              ? addPracticeCharacter
              : setGuess
          }
        />

        {["standby", "stats"].includes(phase) && (
          <button
            className="btn btn--large"
            onClick={async () => {
              await playMorse(initCode);
              setPhase(
                sendSource === SendSources.Practice ? "practice" : "prepare",
              );
            }}
          >
            <span>Start</span>
          </button>
        )}
      </div>
    </div>
  );
};
