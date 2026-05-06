import { useContext, useEffect, useRef, useState } from "react";
import {
  defaultStats,
  ReceiveSources,
  SendSources,
  Stats,
  useWordSets,
} from "../data/DataSources";
import { useLocalStorage } from "./useLocalStorage";
import { Modes, MorseContext, Setting } from "../context/MorseContext";
import { useAudio } from "./useAudio";
import { calculateWPM, getStatusColor } from "../utils/utils";
import {
  alphaToMorse,
  calculateMorseUnitLength,
  unitLengths,
} from "../data/alphaToMorse";
import "./useQuiz.scss";

export const ProgressBar = ({
  title,
  progress,
  useStatusColor,
}: {
  title: string;
  progress?: number;
  useStatusColor?: boolean;
}) => {
  return (
    <div className="progress-bar">
      <span className="progress-bar__title">{title}</span>
      <div className="progress-bar__bar">
        <div
          className="progress-bar__bar__progress"
          style={{
            width: progress !== undefined ? `${progress}%` : undefined,
            background:
              useStatusColor && progress !== undefined
                ? getStatusColor(progress)
                : undefined,
          }}
        />
      </div>
    </div>
  );
};

export const useQuiz = () => {
  const { settings, audioInitialized, selectedMode } = useContext(MorseContext);
  const { playMorse } = useAudio();
  const { getWordSet } = useWordSets();

  const [quizSource, setQuizSource] = useState<
    SendSources | ReceiveSources | undefined
  >(undefined);
  const [wordSet, setWordSet] = useState<string[]>([]);
  const [phase, setPhase] = useState<"standby" | "prepare" | "guess" | "stats">(
    "standby",
  );
  const [word, setWord] = useState<string | undefined>(undefined);
  const [letterIndex, setLetterIndex] = useState<number | undefined>(undefined);
  const [wordIndex, setWordIndex] = useState<number | undefined>(undefined);
  const [guess, setGuess] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const timerRef = useRef<number>(null);

  // Source change
  useEffect(() => {
    setPhase("standby");
  }, [quizSource]);

  // Set up new set
  useEffect(() => {
    if (phase !== "prepare" || quizSource === undefined || !audioInitialized)
      return;

    const newWordSet = getWordSet(quizSource);

    let charsTotal = 0;
    newWordSet.forEach((word) => {
      charsTotal += word.length;
    });

    const firstWord = newWordSet[0];

    setWord(firstWord.toUpperCase());
    setLetterIndex(0);
    setWordIndex(0);
    setWordSet(newWordSet);
    setStats({ ...defaultStats, charsTotal });
    setPhase("guess");

    timerRef.current = Date.now();
  }, [phase, audioInitialized]);

  // Process guess
  useEffect(() => {
    if (
      guess === undefined ||
      wordSet.length === 0 ||
      word === undefined ||
      wordIndex === undefined ||
      letterIndex === undefined
    ) {
      return;
    }

    const isCorrect =
      guess === wordSet[wordIndex].charAt(letterIndex).toUpperCase();

    // Update stats
    const updatedStats = { ...stats };

    if (isCorrect) {
      updatedStats.correct += 1;
      updatedStats.charsDone += 1;

      const guessCharUnitLength = calculateMorseUnitLength(alphaToMorse(guess));
      updatedStats.unitLength += guessCharUnitLength;

      // Add unit length between characters unless it's the last character
      if (letterIndex <= word.length) {
        updatedStats.unitLength += unitLengths[" "];
      }

      if (timerRef.current) {
        const timeEllapsed = Date.now() - timerRef.current;
        updatedStats.wpm = calculateWPM(timeEllapsed, updatedStats.unitLength);
      }

      setLetterIndex(letterIndex + 1);
      setGuess(undefined);
    } else {
      updatedStats.incorrect += 1;
    }

    updatedStats.accuracy =
      (updatedStats.correct / (updatedStats.correct + updatedStats.incorrect)) *
      100;

    setStats(updatedStats);
  }, [guess]);

  // Status change: check if complete
  useEffect(() => {
    if (word === undefined || letterIndex === undefined) {
      return;
    } else if (word[letterIndex] === " ") {
      // Auto-advance spaces
      setLetterIndex(letterIndex + 1);
    } else if (letterIndex === word.length) {
      if (wordIndex === wordSet.length - 1) {
        // Finished all words!
        setPhase("stats");
      } else if (wordIndex !== undefined) {
        // Advance to next word
        setWordIndex(wordIndex + 1);
        setWord(wordSet[wordIndex + 1].toUpperCase());
        setLetterIndex(0);
      }
    } else {
      // Advance to next letter

      //  Play letter on index change
      // (will trigger on auto index change, but not on manual)
      if (
        selectedMode === Modes.Receive &&
        wordIndex !== undefined &&
        settings[Setting.AutoPlayLetter]
      ) {
        playMorse(alphaToMorse(wordSet[wordIndex][letterIndex]));
      }
    }
  }, [letterIndex]);

  return {
    setPhase,
    stats,
    guess,
    setQuizSource,
    source: quizSource,
    phase,
    word,
    letterIndex,
    setGuess,
  };
};
