import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { alphaToMorse } from "../data";
import clsx from "clsx";
import tone from "../audio/tone.mp3";
import "./Telegraph.scss";

const enum Multipliers {
  longDash = 3,
  elementSpacing = 1,
  letterSpacing = 3,
  wordSpacing = 7,
}

export const Telegraph = () => {
  const audio = useMemo(() => new Audio(tone), []);

  const [tickDuration, setTickDuration] = useState(200);
  const [longPressDuration, setLongPressDuration] = useState(125);
  const [addWordBreaks, setAddWordBreaks] = useState(false);

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
    const tickInterval = setInterval(onTick, tickDuration);
    return () => clearInterval(tickInterval);
  }, [onTick, tickDuration]);

  useEffect(() => {
    if (ticks > Multipliers.elementSpacing && buffer !== "") {
      processLetter();
    }
    if (ticks > Multipliers.wordSpacing) {
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
    const signalDuration = long ? longPressDuration : longPressDuration / 3;

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
    timeout.current = setTimeout(() => {
      sendSignal(true);

      signalInProgressRef.current = true;
      longPressTriggeredRef.current = true;
    }, longPressDuration);

    audio.play();
    stopTimer();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendSignal, longPressDuration]);

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

  return (
    <>
      <div className="message">
        <div className="message__letters">
          {message.map((letter, i) => {
            return (
              <div
                className={clsx(
                  "message__letter",
                  letter === "/" && "message__letter--word-break"
                )}
                key={`${letter}-${i}`}
              >
                <span>{letter}</span>
                <span>{alphaToMorse[letter] ?? ""}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="controls">
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

        <div className="controls__buttons">
          <div className="controls__buttons__button">
            <button
              className="tkey tkey--sec"
              onClick={() => emulateSignal(false)}
            >
              .
            </button>
            <div className="key-hints">
              <span className="key-guide">.</span>
              <span className="key-guide">z</span>
            </div>
          </div>

          <div className="controls__buttons__button">
            <button
              className="tkey tkey--sec"
              onClick={() => emulateSignal(true)}
            >
              -
            </button>
            <div className="key-hints">
              <span className="key-guide">-</span>
              <span className="key-guide">x</span>
            </div>
          </div>

          <div className="controls__buttons__button">
            <button
              className="tkey tkey--main"
              onMouseDown={() => startSignal()}
              onMouseUp={() => endSignal()}
            />
            <div className="key-hints">
              <span>Press and hold</span>
              <span className="key-guide">m</span>
            </div>
          </div>
        </div>
      </div>

      <button
        className="clear-message-btn"
        onClick={() => {
          setMessage([]);
        }}
      >
        Clear message
      </button>

      <div className="timing">
        <div>
          <input
            type="checkbox"
            checked={addWordBreaks}
            onChange={() => {
              setAddWordBreaks(!addWordBreaks);
            }}
          />
          <label>Add Word Breaks</label>
        </div>
        <div>
          <label>Delay</label>
          <input
            type="number"
            min="10"
            max="1000"
            value={tickDuration}
            onChange={(e) => setTickDuration(Number(e.target.value))}
          />
        </div>

        <div>
          <label>Long Press</label>
          <input
            type="number"
            min="10"
            max="1000"
            value={longPressDuration}
            onChange={(e) => setLongPressDuration(Number(e.target.value))}
          />
        </div>
      </div>
    </>
  );
};
