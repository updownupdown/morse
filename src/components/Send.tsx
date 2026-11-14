import { useContext, useEffect, useRef } from "react";
import { MorseKeys } from "./MorseKeys";
import {
  sendSources,
  sourceChars,
  sourceLabels,
  Sources,
} from "../data/DataSources";
import clsx from "clsx";
import { useProgress } from "../context/ProgressContext";
import {
  charMastery,
  kochOrder,
  lessonChars,
  nextLessonChar,
  Skill,
} from "../progress/progress";
import { Modes, MorseContext } from "../context/MorseContext";
import { formatForCSSClass } from "../utils/utils";
import { initCode } from "../hooks/useAudio";
import { Phase, useQuiz } from "../hooks/useQuiz";
import { Word } from "./Word";
import { alphaToMorse } from "../data/alphaToMorse";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Practice } from "./Practice";
import { useAudioContext } from "../context/AudioContext";
import { SendIcon } from "../icons/SendIcon";
import { ReceiveIcon } from "../icons/ReceiveIcon";
import { OnAirIcon } from "../icons/LineIcons";
import { ChoiceCards, IconTabs, SetupHeading } from "./PracticeSetup";
import { SessionMeters, SessionResults, UnlockedNotice } from "./SessionResults";

// The saved source, if it's still one on offer (older versions had others)
export function validSource(source: Sources, sources: Sources[]) {
  return sources.includes(source) ? source : Sources.Auto;
}

export const Send = () => {
  const { setQuizSource, phase, setPhase } = useContext(MorseContext);
  const { playMorse } = useAudioContext();
  const { setGuess, word, letterIndex, guess, unlocked } = useQuiz();

  const [practiceWord, setPracticeWord] = useLocalStorage("practiceWord", "");
  const practiceWordRef = useRef(practiceWord);
  practiceWordRef.current = practiceWord;

  const [storedSource, setSource] = useLocalStorage<Sources>(
    "sendSource",
    Sources.Auto,
  );
  const source = validSource(storedSource, sendSources);

  useEffect(() => {
    setQuizSource(source);
  }, [source]);

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
          source={source}
          sources={sendSources}
          setSource={setSource}
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
          <>
            <SessionMeters />
            <UnlockedNotice char={unlocked} />
            <div className="quiz__content__word">
              <Word guess={guess} word={word} letterIndex={letterIndex} />
            </div>
          </>
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
  [Sources.Auto]: "",
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
  [Sources.Auto]: "Drills what you know and adds new characters slowly",
  [Sources.Words]: "Common English words",
  [Sources.Pangrams]: "Sentences using every letter",
  [Sources.AllChars]: "Letters, numbers and symbols",
  [Sources.Practice]: "Key anything, with no prompts",
  [Sources.Letters]: "A to Z, weakest first",
  [Sources.SpecialChars]: "Numbers and punctuation",
  [Sources.Numbers]: "Groups of digits",
  [Sources.Abbreviations]: "Ham radio shorthand",
};

interface QuizSelectProps {
  setPhase: (phase: Phase) => void;
  phase: Phase;
  source: Sources;
  sources: Sources[];
  setSource: (source: Sources) => void;
  // The character Auto practice just unlocked
  unlocked?: string;
}

export const QuizSelect = ({
  phase,
  setPhase,
  source,
  setSource,
  sources,
  unlocked,
}: QuizSelectProps) => {
  const { selectedMode } = useContext(MorseContext);
  const { progress } = useProgress();
  const skill: Skill = selectedMode === Modes.Receive ? "receive" : "send";
  const lessonLevel = progress.lesson[skill];
  const nextChar = nextLessonChar(lessonLevel);
  const unlockedChars = lessonChars(lessonLevel);
  const newest = unlockedChars[unlockedChars.length - 1];

  const knownOf = (chars: string[]) =>
    chars.filter((char) => charMastery(progress, skill, char) === "known")
      .length;

  if (!["standby", "stats"].includes(phase)) return null;

  return (
    <div className="practice-setup">
      <PracticeTabs />

      <SessionResults />

      <SetupHeading>What to practise</SetupHeading>

      <ChoiceCards
        label="What to practise"
        columns={1}
        selected={source}
        onSelect={(s) => {
          setPhase("standby");
          setSource(s);
        }}
        cards={sources.map((s) => {
          const chars = sourceChars(s);

          return {
            id: s,
            title: sourceLabels[s] ?? s,
            desc: sourceDescs[s],
            glyph: s === Sources.Auto ? newest : sourceGlyphs[s],
            meter:
              chars.length === 0
                ? undefined
                : s === Sources.Auto
                  ? {
                      known: knownOf(unlockedChars),
                      total: kochOrder.length,
                      reached: unlockedChars.length,
                    }
                  : { known: knownOf(chars), total: chars.length },
          };
        })}
      />

      {source === Sources.Auto && (
        <div className="quiz-lesson">
          {unlocked ? (
            <span className="quiz-lesson__unlocked">
              New character this session: <b>{unlocked}</b>
            </span>
          ) : (
            <span>
              {nextChar
                ? `${nextChar} comes next, once ${newest} is known`
                : "Every character unlocked"}
            </span>
          )}
          <div className="quiz-lesson__chars">
            {unlockedChars.map((char, i, all) => (
              <span
                key={char}
                className={clsx(
                  `quiz-lesson__char--${charMastery(progress, skill, char)}`,
                  i === all.length - 1 && "newest",
                )}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
