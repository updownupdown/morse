import { useContext, useEffect, useState } from "react";
import { Keyboard } from "./Keyboard";
import "./Receive.scss";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import { alphaToMorse } from "../data/alphaToMorse";
import { initCode } from "../hooks/useAudio";
import { MorseContext } from "../context/MorseContext";
import { StopIcon } from "../icons/StopIcon";
import clsx from "clsx";
import {
  defaultSourceQty,
  maxSourceQty,
  receiveSources,
  Sources,
} from "../data/DataSources";
import { useQuiz } from "../hooks/useQuiz";
import { Word } from "./Word";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAudioContext } from "../context/AudioContext";
import { QuizSelect } from "./Send";

export const Receive = () => {
  const { setPhase, phase, setQuizSource, quizQty, setQuizQty } =
    useContext(MorseContext);

  const { playMorse, stopMorse, isPlaying } = useAudioContext();

  const { stats, setGuess, word, letterIndex, guess } = useQuiz();

  const [source, setSource] = useLocalStorage<Sources>(
    "receiveSource",
    Sources.Words,
  );
  const [receiveQuantities, setReceiveQuantities] = useLocalStorage<
    Record<Sources, number>
  >("receiveQuantities", defaultSourceQty);

  useEffect(() => {
    setQuizSource(source);
    setQuizQty(receiveQuantities[source] ?? defaultSourceQty[source]);
  }, [source]);

  useEffect(() => {
    setReceiveQuantities({
      ...receiveQuantities,
      [source]: quizQty ?? defaultSourceQty[source],
    });
  }, [quizQty]);

  const [lastPlayBtnPressed, setLastPlayBtnPressed] = useState<
    "word" | "letter"
  >("letter");

  const wordBtnIsStop = () => isPlaying && lastPlayBtnPressed === "word";
  const letterBtnIsStop = () => isPlaying && lastPlayBtnPressed === "letter";

  function playPauseWord() {
    if (word === undefined) return;

    setLastPlayBtnPressed("word");

    if (wordBtnIsStop()) {
      stopMorse();
    } else {
      playMorse(alphaToMorse(word));
    }
  }

  function playPauseLetter() {
    if (word === undefined || letterIndex === undefined) return;

    setLastPlayBtnPressed("letter");

    if (letterBtnIsStop()) {
      stopMorse();
    } else {
      playMorse(alphaToMorse(word[letterIndex]));
    }
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey || e.repeat) return;

      if (e.key === " " && !letterBtnIsStop()) {
        playPauseWord();
        e.preventDefault();
      } else if (e.code === "ArrowRight" && !wordBtnIsStop()) {
        playPauseLetter();
        e.preventDefault();
      } else if (/^[a-z]$/i.test(e.key)) {
        setGuess(e.key.toUpperCase());
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      className={clsx(
        "quiz quiz--receive beep-glow",
        wordBtnIsStop() && "quiz--playing-word",
      )}
    >
      <div className="quiz__content">
        <QuizSelect
          phase={phase}
          setPhase={setPhase}
          quizQty={quizQty ?? 1}
          source={source}
          sources={receiveSources}
          setSource={setSource}
          maxQty={maxSourceQty}
          setQuizQty={setQuizQty}
        />

        {phase === "guess" && (
          <>
            <div className="quiz__content__word">
              <Word guess={guess} word={word} letterIndex={letterIndex} />
            </div>

            <div className="quiz__content__action-buttons">
              <button
                className={clsx(
                  "btn  btn--outlined",
                  wordBtnIsStop() && "btn--stop",
                )}
                onClick={playPauseWord}
                disabled={letterBtnIsStop()}
              >
                {wordBtnIsStop() ? <StopIcon /> : <SpeakerIcon />}
                <span>{wordBtnIsStop() ? "Stop" : "Word"}</span>
              </button>

              <button
                className={clsx(
                  "btn btn--outlined",
                  letterBtnIsStop() && "btn--stop",
                )}
                onClick={playPauseLetter}
                disabled={wordBtnIsStop()}
              >
                {letterBtnIsStop() ? <StopIcon /> : <SpeakerIcon />}
                <span>{letterBtnIsStop() ? "Stop" : "Letter"}</span>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="quiz__bottom">
        {["standby", "stats"].includes(phase) && (
          <button
            className="btn btn--large"
            onClick={async () => {
              await playMorse(initCode);
              setPhase("prepare");
            }}
          >
            <span>Start</span>
          </button>
        )}

        {phase === "guess" && (
          <Keyboard
            setGuess={setGuess}
            isSpecialChars={source === Sources.SpecialChars}
          />
        )}
      </div>
    </div>
  );
};
