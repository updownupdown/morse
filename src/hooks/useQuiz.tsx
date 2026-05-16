import { useContext, useEffect, useRef, useState } from "react";
import { defaultStats, useWordSets } from "../data/DataSources";
import {
  AutoPlay,
  Modes,
  MorseContext,
  Setting,
} from "../context/MorseContext";
import { calculateWPM } from "../utils/utils";
import {
  alphaToMorse,
  calculateMorseUnitLength,
  unitLengths,
} from "../data/alphaToMorse";
import "./useQuiz.scss";
import { useAudioContext } from "../context/AudioContext";

export const quizQtIncrementDuration = {
  initial: 750,
  subsequent: 150,
};

export type Phase = "standby" | "prepare" | "guess" | "stats" | "practice";

export const useQuiz = () => {
  const {
    settings,
    selectedMode,
    quizSource,
    setQuizSource,
    quizQty,
    stats,
    setStats,
    phase,
    setPhase,
  } = useContext(MorseContext);
  const { playMorse, stopMorse, audioInitialized, isPlaying } =
    useAudioContext();
  const { getWordSet } = useWordSets();

  const [wordSet, setWordSet] = useState<string[]>([]);
  const [word, setWord] = useState<string | undefined>(undefined);
  const [letterIndex, setLetterIndex] = useState<number | undefined>(undefined);
  const [wordIndex, setWordIndex] = useState<number | undefined>(undefined);
  const [guess, setGuess] = useState<string | undefined>(undefined);

  const timerRef = useRef<number>(null);

  // Source change
  useEffect(() => {
    setPhase("standby");
  }, [quizSource]);

  // Set up new set
  useEffect(() => {
    stopMorse();

    if (
      phase !== "prepare" ||
      quizSource === undefined ||
      quizQty === undefined ||
      !audioInitialized
    ) {
      return;
    }

    const newWordSet = getWordSet(quizSource, quizQty);

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

  useEffect(() => {
    if (
      phase === "guess" &&
      isPlaying === undefined &&
      selectedMode === Modes.Receive &&
      wordIndex !== undefined &&
      settings[Setting.AutoPlay] == AutoPlay.Word
    ) {
      playMorse(alphaToMorse(wordSet[wordIndex]));
    }
  }, [wordIndex, phase]);

  // Process guess
  useEffect(() => {
    if (
      guess === undefined ||
      wordSet.length === 0 ||
      word === undefined ||
      wordIndex === undefined ||
      stats === undefined ||
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
      if (letterIndex < word.length - 1) {
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
        isPlaying === undefined &&
        selectedMode === Modes.Receive &&
        wordIndex !== undefined &&
        settings[Setting.AutoPlay] == AutoPlay.Letter
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
    word,
    letterIndex,
    setGuess,
  };
};
