import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { defaultStats, getWordSet, Sources } from "../data/DataSources";
import { useProgress } from "../context/ProgressContext";
import { charMastery, readyToUnlock, Skill } from "../progress/progress";
import {
  AutoPlay,
  Hints,
  Modes,
  MorseContext,
  Setting,
} from "../context/MorseContext";
import { alphaToMorse } from "../data/alphaToMorse";
import {
  applyGuess,
  continueQuiz,
  currentChar,
  currentWord,
  QuizState,
  startQuiz,
} from "../quiz/quizState";
import "./useQuiz.scss";
import { useAudioContext } from "../context/AudioContext";

// "play" is a game in progress: the tab bar hides, as for a session,
// but the header's quiz progress stays out of the way
export type Phase =
  | "standby"
  | "prepare"
  | "guess"
  | "stats"
  | "practice"
  | "play";

export const useQuiz = () => {
  const {
    settings,
    selectedMode,
    quizSource,
    setQuizSource,
    stats,
    setStats,
    phase,
    setPhase,
    setAutoHints,
  } = useContext(MorseContext);
  const { playMorse, stopMorse, audioInitialized } = useAudioContext();
  const { progress, record, completeLesson } = useProgress();
  const skill: Skill = selectedMode === Modes.Receive ? "receive" : "send";

  // The character Auto practice unlocked during this session, if any
  const [unlocked, setUnlocked] = useState<string | undefined>(undefined);

  // The round itself is one value, moved on by `applyGuess` (see
  // quiz/quizState). The ref lets guesses that arrive from timers and key
  // handlers always act on the latest state.
  const [quiz, setQuizState] = useState<QuizState | undefined>(undefined);
  const quizRef = useRef(quiz);

  // The stats when the current batch began, to judge each batch alone
  const batchStartRef = useRef(defaultStats);

  const setQuiz = (next: QuizState | undefined) => {
    quizRef.current = next;
    setQuizState(next);
  };

  // Everything a guess needs, as it stands on the latest render
  const latest = {
    settings,
    selectedMode,
    quizSource,
    skill,
    phase,
    progress,
    completeLesson,
  };
  const latestRef = useRef(latest);
  latestRef.current = latest;

  // In Receive, what's being asked can be played as soon as it comes up
  function autoPlay(state: QuizState, previous?: QuizState) {
    const { settings, selectedMode } = latestRef.current;
    if (selectedMode !== Modes.Receive || state.done) return;

    const autoPlaySetting = settings[Setting.AutoPlay];
    const word = currentWord(state);
    const char = currentChar(state);

    if (autoPlaySetting === AutoPlay.Letter && char) {
      playMorse(alphaToMorse(char));
    } else if (
      autoPlaySetting === AutoPlay.Word &&
      word &&
      state.wordIndex !== previous?.wordIndex
    ) {
      playMorse(alphaToMorse(word));
    }
  }

  const submitGuess = useCallback((guess: string) => {
    const previous = quizRef.current;
    const { skill, quizSource, phase } = latestRef.current;
    if (!previous || phase !== "guess") return;

    const next = applyGuess(previous, guess, Date.now());
    if (next === previous || !next.last) return;

    setQuiz(next);
    setStats(next.stats);

    if (!next.last.correct) return;

    // Each character is logged once: right first time, or not
    record(skill, next.last.char, next.last.firstTry);

    if (next.done) {
      const { progress, completeLesson } = latestRef.current;
      let { progress: latestProgress } = latestRef.current;

      // Auto: a new character, if the batch went well and the newest is known
      if (quizSource === Sources.Auto) {
        const batch = batchStartRef.current;
        const correct = next.stats.correct - batch.correct;
        const incorrect = next.stats.incorrect - batch.incorrect;
        const batchAccuracy = (correct / Math.max(correct + incorrect, 1)) * 100;

        if (readyToUnlock(progress, skill, batchAccuracy)) {
          const char = completeLesson(skill, batchAccuracy);
          if (char) {
            setUnlocked(char);
            latestProgress = {
              ...progress,
              lesson: { ...progress.lesson, [skill]: progress.lesson[skill] + 1 },
            };
          }
        }
      }

      // On to the next batch, without stopping
      const continued = continueQuiz(
        next,
        getWordSet(quizSource ?? Sources.Words, skill, latestProgress),
      );
      batchStartRef.current = continued.stats;
      setQuiz(continued);
      setStats(continued.stats);
      autoPlay(continued, next);
    } else {
      autoPlay(next, previous);
    }
  }, []);

  // Source change
  useEffect(() => {
    setPhase("standby");
  }, [quizSource]);

  // Set up new set
  useEffect(() => {
    stopMorse();

    if (phase !== "prepare" || quizSource === undefined || !audioInitialized) {
      return;
    }

    const newWordSet = getWordSet(quizSource, skill, progress);
    if (newWordSet.length === 0) return;

    const state = startQuiz(newWordSet, Date.now());

    setUnlocked(undefined);
    batchStartRef.current = state.stats;
    setQuiz(state);
    setStats(state.stats);
    setPhase("guess");
    autoPlay(state);
  }, [phase, audioInitialized]);

  const inRound = phase === "guess" && quiz !== undefined;
  const word = quiz ? currentWord(quiz) : undefined;
  const letterIndex = quiz?.letterIndex;

  // Hints on Auto follow how well the current character is known
  const char = inRound ? currentChar(quiz) : undefined;
  const currentMastery = char ? charMastery(progress, skill, char) : undefined;

  useEffect(() => {
    setAutoHints(
      currentMastery === "known"
        ? Hints.Off
        : currentMastery === "learning"
          ? Hints.Delayed
          : Hints.On,
    );
  }, [currentMastery]);

  // The last guess, while it stands as a wrong answer
  const guess = quiz?.last && !quiz.last.correct ? quiz.last.guess : undefined;

  return {
    unlocked,
    setPhase,
    stats,
    guess,
    setQuizSource,
    word,
    letterIndex,
    setGuess: submitGuess,
  };
};
