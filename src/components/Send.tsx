import { useContext, useEffect, useRef } from "react";
import "./Send.scss";
import { MorseKeys } from "./MorseKeys";
import {
  defaultSourceQty,
  maxSourceQty,
  sendSources,
  Sources,
} from "../data/DataSources";
import { Modes, MorseContext } from "../context/MorseContext";
import { conditionalPluralize, formatForCSSClass } from "../utils/utils";
import { initCode } from "../hooks/useAudio";
import { Phase, quizQtIncrementDuration, useQuiz } from "../hooks/useQuiz";
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
  const { playMorse } = useAudioContext();
  const { setGuess, word, letterIndex, guess } = useQuiz();

  const [practiceWord, setPracticeWord] = useLocalStorage("practiceWord", "");
  const practiceWordRef = useRef(practiceWord);
  practiceWordRef.current = practiceWord;

  const [source, setSource] = useLocalStorage<Sources>(
    "sendSource",
    Sources.Words,
  );
  const [sendQuantities, setSendQuantities] = useLocalStorage<
    Record<Sources, number>
  >("sendQuantities", defaultSourceQty);

  useEffect(() => {
    setQuizSource(source);
    setQuizQty(sendQuantities[source] ?? defaultSourceQty[source]);
  }, [source]);

  useEffect(() => {
    setSendQuantities({
      ...sendQuantities,
      [source]: quizQty ?? defaultSourceQty[source],
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
      className={`quiz quiz--send quiz--source-${formatForCSSClass(source)}`}
    >
      <div className="quiz__content">
        <QuizSelect
          phase={phase}
          setPhase={setPhase}
          quizQty={quizQty ?? 1}
          source={source}
          sources={sendSources}
          setSource={setSource}
          maxQty={maxSourceQty}
          setQuizQty={setQuizQty}
        />

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
            source === Sources.Practice ? addPracticeCharacter : setGuess
          }
        />

        {["standby", "stats"].includes(phase) && (
          <button
            className="btn btn--large"
            onClick={async () => {
              await playMorse(initCode);
              setPhase(source === Sources.Practice ? "practice" : "prepare");
            }}
          >
            <span>Start</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface QuizSelectProps {
  setPhase: (phase: Phase) => void;
  setQuizQty: (qty: number) => void;
  quizQty: number;
  phase: Phase;
  source: Sources;
  sources: Sources[];
  setSource: (source: Sources) => void;
  maxQty: Record<Sources, number>;
}

export const QuizSelect = ({
  phase,
  setPhase,
  setQuizQty,
  quizQty,
  source,
  setSource,
  maxQty,
  sources,
}: QuizSelectProps) => {
  const { selectedMode, setSelectedMode } = useContext(MorseContext);

  const holdTimeoutRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);
  const quizQtyRef = useRef(quizQty);
  quizQtyRef.current = quizQty;

  function incrementQuizQty(increase: boolean) {
    let newQty = quizQtyRef.current ?? defaultSourceQty[source];

    if (increase) {
      if (newQty < maxSourceQty[source]) {
        newQty += 1;
      }
    } else {
      if (newQty > 1) {
        newQty -= 1;
      }
    }

    setQuizQty(newQty);
  }

  const startHoldIncrement = (increase: boolean) => {
    if (holdTimeoutRef.current || holdIntervalRef.current) return;

    holdTimeoutRef.current = setTimeout(() => {
      incrementQuizQty(increase);

      holdIntervalRef.current = setInterval(() => {
        incrementQuizQty(increase);
      }, quizQtIncrementDuration.subsequent);
      holdTimeoutRef.current = null;
    }, quizQtIncrementDuration.initial);
  };

  const stopHoldIncrement = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  if (!["standby", "stats"].includes(phase)) return null;

  return (
    <>
      <div className="button-menu">
        <button
          className={`btn-menu-item btn-menu-item--${selectedMode === Modes.Send ? "selected" : "not-selected"}`}
          onClick={() => {
            setSelectedMode(Modes.Send);
          }}
          disabled={selectedMode === Modes.Send}
        >
          Send
        </button>
        <button
          className={`btn-menu-item btn-menu-item--${selectedMode === Modes.Receive ? "selected" : "not-selected"}`}
          onClick={() => {
            setSelectedMode(Modes.Receive);
          }}
          disabled={selectedMode === Modes.Receive}
        >
          Receive
        </button>
      </div>

      <div className="button-menu button-menu--vertical">
        {Object.values(sources).map((s) => {
          return (
            <button
              key={s}
              className={`btn-menu-item btn-menu-item--${s === source ? "selected" : "not-selected"}`}
              onClick={() => {
                setPhase("standby");
                setSource(s);
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      <span className="quiz__content__qty">
        <button
          className="btn btn--outlined"
          onClick={() => incrementQuizQty(false)}
          onMouseDown={() => startHoldIncrement(false)}
          onTouchStart={() => startHoldIncrement(false)}
          onMouseUp={stopHoldIncrement}
          onMouseLeave={stopHoldIncrement}
          onTouchEnd={stopHoldIncrement}
          disabled={quizQty === 1}
        >
          <MinusIcon />
        </button>

        <div className="quiz__content__qty__practice">
          Send anything you want!
        </div>

        <div className="quiz__content__qty__desc">
          <span>{quizQty}</span>
          <span>{conditionalPluralize(source, quizQty)}</span>
        </div>

        <button
          className="btn btn--outlined"
          onClick={() => incrementQuizQty(true)}
          onMouseDown={() => startHoldIncrement(true)}
          onTouchStart={() => startHoldIncrement(true)}
          onMouseUp={stopHoldIncrement}
          onMouseLeave={stopHoldIncrement}
          onTouchEnd={stopHoldIncrement}
          disabled={quizQty === maxQty[source]}
        >
          <PlusIcon />
        </button>
      </span>
    </>
  );
};
