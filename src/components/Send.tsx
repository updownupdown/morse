import { useContext, useEffect, useRef } from "react";
import { MorseKeys } from "./MorseKeys";
import {
  defaultSourceQty,
  maxSourceQty,
  sendSources,
  sourceLabels,
  Sources,
  sourceUnits,
} from "../data/DataSources";
import clsx from "clsx";
import { useProgress } from "../context/ProgressContext";
import {
  lessonChars,
  lessonPassAccuracy,
  minLesson,
  nextLessonChar,
} from "../progress/progress";
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
import { SendIcon } from "../icons/SendIcon";
import { ReceiveIcon } from "../icons/ReceiveIcon";
import { OnAirIcon } from "../icons/LineIcons";
import { ChoiceCards, IconTabs, SetupHeading } from "./PracticeSetup";
import { SessionResults } from "./SessionResults";

export const Send = () => {
  const { setQuizSource, quizQty, setQuizQty, phase, setPhase } =
    useContext(MorseContext);
  const { playMorse } = useAudioContext();
  const { setGuess, word, letterIndex, guess, unlocked } = useQuiz();

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
          unlocked={unlocked}
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

const practiceTabs = [
  { id: Modes.Send, label: "Send", icon: <SendIcon /> },
  { id: Modes.Receive, label: "Receive", icon: <ReceiveIcon /> },
  { id: Modes.OnAir, label: "On Air", icon: <OnAirIcon /> },
];

// Switches between the practice modes
export const PracticeTabs = () => {
  const { selectedMode, setSelectedMode } = useContext(MorseContext);

  return (
    <IconTabs
      label="Practice mode"
      tabs={practiceTabs}
      selected={selectedMode}
      onSelect={(mode) => setSelectedMode(mode)}
    />
  );
};

// A few characters that show what each source is about
const sourceGlyphs: Record<Sources, string> = {
  [Sources.Lesson]: "",
  [Sources.Words]: "cat",
  [Sources.Pangrams]: "A–Z",
  [Sources.AllChars]: "A1?",
  [Sources.Practice]: "·–",
  [Sources.Letters]: "ABC",
  [Sources.SpecialChars]: "?!/",
  [Sources.Numbers]: "123",
  [Sources.Abbreviations]: "73",
};

const sourceDescs: Record<Sources, string> = {
  [Sources.Lesson]: "New letters, a few at a time",
  [Sources.Words]: "Common English words",
  [Sources.Pangrams]: "Sentences using every letter",
  [Sources.AllChars]: "Letters, numbers and symbols",
  [Sources.Practice]: "Key anything, no prompts",
  [Sources.Letters]: "A to Z, in random order",
  [Sources.SpecialChars]: "Punctuation and signs",
  [Sources.Numbers]: "Groups of digits",
  [Sources.Abbreviations]: "Ham radio shorthand",
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
  // The character just unlocked by passing a lesson
  unlocked?: string;
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
  unlocked,
}: QuizSelectProps) => {
  const { selectedMode } = useContext(MorseContext);
  const { progress } = useProgress();
  const lessonLevel =
    progress.lesson[selectedMode === Modes.Receive ? "receive" : "send"];
  const nextChar = nextLessonChar(lessonLevel);

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

  if (!["standby", "stats"].includes(phase)) return null;

  return (
    <div className="practice-setup">
      <PracticeTabs />

      <SessionResults />

      <SetupHeading>What to practise</SetupHeading>

      <ChoiceCards
        label="What to practise"
        selected={source}
        onSelect={(s) => {
          setPhase("standby");
          setSource(s);
        }}
        cards={sources.map((s) => ({
          id: s,
          title:
            s === Sources.Lesson
              ? `Lesson ${lessonLevel - minLesson + 1}`
              : (sourceLabels[s] ?? s),
          desc: sourceDescs[s],
          glyph:
            s === Sources.Lesson
              ? lessonChars(lessonLevel).slice(-1)[0]
              : sourceGlyphs[s],
        }))}
      />

      {source === Sources.Lesson && (
        <div className="quiz-lesson">
          {unlocked ? (
            <span className="quiz-lesson__unlocked">
              Passed! New character: <b>{unlocked}</b>
            </span>
          ) : (
            <span>
              {nextChar
                ? `Score ${lessonPassAccuracy}% to unlock the next character`
                : "Every character unlocked"}
            </span>
          )}
          <div className="quiz-lesson__chars">
            {lessonChars(lessonLevel).map((char, i, all) => (
              <span
                key={char}
                className={clsx(i === all.length - 1 && "newest")}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      )}

      {source === Sources.Practice ? (
        <div className="length-row">
          <span className="length-row__label">
            Send anything you want
            <small>Playback, delete and word breaks are below the text.</small>
          </span>
        </div>
      ) : (
        <div className="length-row">
          <span className="length-row__label">Length</span>

          <button
            className="btn btn--outlined"
            aria-label="Fewer"
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

          <div className="length-row__value">
            <b>{quizQty}</b>
            <small>{conditionalPluralize(sourceUnits[source], quizQty)}</small>
          </div>

          <button
            className="btn btn--outlined"
            aria-label="More"
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
        </div>
      )}
    </div>
  );
};
