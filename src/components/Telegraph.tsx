import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { alphaToMorse } from "../data";
import tone from "../audio/tone.mp3";
import "./Telegraph.scss";
import { Message } from "./Message";
import { useTiming } from "../hooks/useTiming";
import { SettingsContext } from "../context/SettingsContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const Telegraph = () => {
  const { addWordBreaks } = useContext(SettingsContext);
  const { gaps, timing } = useTiming();

  const audio = useMemo(() => new Audio(tone), []);

  const [timerRunning, setTimmerRunning] = useState(false);
  const [ticks, setTicks] = useState(0);
  const [buffer, setBuffer] = useState("");
  const [message, setMessage] = useLocalStorage("telegraphMessage", "");

  // Timer functions
  const startTimer = () => setTimmerRunning(true);
  const pauseTimer = () => setTimmerRunning(false);
  const resetTimer = () => setTicks(0);
  const stopTimer = () => {
    pauseTimer();
    resetTimer();
  };

  // Tick
  const onTick = useCallback(
    () => (timerRunning ? setTicks((t) => t + 1) : 0),
    [timerRunning]
  );

  useEffect(() => {
    const tickInterval = setInterval(onTick, timing.short);
    return () => clearInterval(tickInterval);
  }, [onTick, timing]);

  useEffect(() => {
    if (ticks > gaps.gapLetters && buffer !== "") {
      processLetter();
    }
    if (ticks > gaps.gapWords) {
      processWord();
      stopTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticks]);

  // Add to message
  const addToMessage = (text: string) => {
    setMessage((message) => message + text);
  };

  const processLetter = () => {
    const letterMatch = Object.keys(alphaToMorse).find(
      (key) => alphaToMorse[key] === buffer
    );

    if (letterMatch) {
      addToMessage(letterMatch);
    }

    setBuffer("");
  };

  const processWord = () => {
    if (
      message.length !== 0 &&
      message[message.length - 1] !== "/" &&
      addWordBreaks
    ) {
      addToMessage("/");
    }
  };

  // Event listeners
  const keyDownHandler = (e: KeyboardEvent) => {
    if (e.key === "m") {
      if (!signalInProgressRef.current) {
        startSignal();
      }
    } else if (e.key === "Delete" || e.key === "Backspace") {
      deleteLastCharacter();
    }
  };

  const keyUpHandler = ({ key }: any) => {
    if (key === "m") {
      endSignal();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);

    return () => {
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendSignal = (long: boolean) => {
    const signal = long ? "-" : ".";
    setBuffer((l) => l + signal);
  };

  const signalInProgressRef = useRef(false);
  const longPressTriggeredRef = useRef(false);
  const timeout = useRef<any>(null);

  const startSignal = useCallback(() => {
    if (signalInProgressRef.current) return;
    signalInProgressRef.current = true;

    timeout.current = setTimeout(() => {
      sendSignal(true);

      longPressTriggeredRef.current = true;
    }, timing.shortLongThreshold);

    audio.play();
    stopTimer();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendSignal, timing]);

  const endSignal = useCallback(() => {
    clearTimeout(timeout.current);
    !longPressTriggeredRef.current && sendSignal(false);

    longPressTriggeredRef.current = false;
    signalInProgressRef.current = false;

    audio.pause();
    audio.currentTime = 0;
    resetTimer();
    startTimer();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendSignal]);

  const deleteLastCharacter = () => {
    setMessage((message) => message.slice(0, -1));
  };

  const clearMessage = () => {
    setMessage("");
  };

  return (
    <>
      <Message
        message={message}
        buffer={buffer}
        clearMessage={clearMessage}
        deleteLastCharacter={deleteLastCharacter}
      />

      <div className="controls">
        <div className="controls__buffer">
          {Array.from(buffer).map((element, i) => (
            <div
              className={`buffer-symbol buffer-symbol--${
                element === "." ? "dot" : "dash"
              }`}
              key={i}
            />
          ))}
        </div>

        <button
          className="controls__tkey large-button"
          onPointerDown={() => startSignal()}
          onPointerUp={() => endSignal()}
          onMouseLeave={() => {
            if (signalInProgressRef.current) {
              endSignal();
            }
          }}
        >
          M
        </button>
      </div>
    </>
  );
};
