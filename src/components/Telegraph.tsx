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

export const Telegraph = () => {
  const { addWordBreaks } = useContext(SettingsContext);
  const { gaps, timing } = useTiming();

  const audio = useMemo(() => new Audio(tone), []);

  const [timerRunning, setTimmerRunning] = useState(false);
  const [ticks, setTicks] = useState(0);
  const [buffer, setBuffer] = useState("");
  const [message, setMessage] = useState<string[]>([]);

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
    setMessage((message) => [...message, text]);
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
    if (e.key === "." || e.key === "z") {
      emulateSignal(false);
    } else if (e.key === "-" || e.key === "x") {
      emulateSignal(true);
    } else if (e.key === "m") {
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

  const emulateSignal = (long: boolean) => {
    if (signalInProgressRef.current) return;

    const signalDuration = long ? timing.long : timing.short;

    clearTimeout(timeout.current);

    startSignal();

    setTimeout(() => {
      endSignal();
    }, signalDuration);
  };

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

  return (
    <>
      <Message message={message} buffer={buffer} />

      <div className="controls">
        <div className="controls__edit-message">
          <button
            onClick={() => {
              deleteLastCharacter();
            }}
            disabled={message.length === 0}
          >
            Backspace
          </button>
          <button
            onClick={() => {
              setMessage([]);
            }}
            disabled={message.length === 0}
          >
            Clear message
          </button>
        </div>

        <span className="controls__buffer">
          {Array.from(buffer).map((element, i) => (
            <div
              className={`buffer-display buffer-display--${
                element === "." ? "dot" : "dash"
              }`}
              key={i}
            />
          ))}
        </span>

        <div className="guide">
          <div className="guide__section">
            <span>Dot</span>
            <div>
              <span>.</span> or
              <span>z</span>
            </div>
          </div>
          <div className="guide__section">
            <span>Dash</span>
            <div>
              <span>-</span> or
              <span>x</span>
            </div>
          </div>
          <div className="guide__section">
            <span>Manual operation</span>
            <div>
              <span>m</span>
            </div>
          </div>
          <div className="guide__section">
            <span>Delete last character</span>
            <div>
              <span>Delete</span> or
              <span>Backspace</span>
            </div>
          </div>
        </div>

        <div className="controls__buttons">
          <div className="controls__buttons__aux">
            <button
              className="tkey tkey--sec"
              onMouseDown={() => emulateSignal(false)}
            >
              <div className="tkey-symbol" />
            </button>

            <button
              className="tkey tkey--sec"
              onMouseDown={() => emulateSignal(true)}
            >
              <div className="tkey-symbol tkey-symbol--long" />
            </button>
          </div>

          <button
            className="tkey tkey--main"
            onMouseDown={() => startSignal()}
            onTouchStart={() => startSignal()}
            onMouseUp={() => endSignal()}
            onTouchEnd={() => endSignal()}
            onMouseLeave={() => {
              if (signalInProgressRef.current) {
                endSignal();
              }
            }}
          />
        </div>
      </div>
    </>
  );
};
