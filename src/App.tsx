import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./css/styles.scss";
import { alphaToMorse } from "./data";
import useLongPress from "./hooks/useLongPress";
import tone from "./audio/tone.mp3";
import clsx from "clsx";

const longPressDuration = 250;

const enum Multipliers {
  longDash = 3,
  elementSpacing = 1,
  letterSpacing = 3,
  wordSpacing = 7,
}

function App() {
  const audio = useMemo(() => new Audio(tone), [tone]);
  audio.loop = false;

  const [tickDuration, setTickDuration] = useState(500);

  const [timerRunning, setTimmerRunning] = useState(false);
  const [ticks, setTicks] = useState(0);
  const [buffer, setBuffer] = useState("");
  const [output, setOutput] = useState<string[]>([]);

  // Timer functions
  const start = () => setTimmerRunning(true);
  const pause = () => setTimmerRunning(false);
  const reset = () => setTicks(0);
  const stop = () => {
    pause();
    reset();
  };

  const onTick = useCallback(
    () => (timerRunning ? setTicks((t) => t + 1) : 0),
    [timerRunning]
  );

  useEffect(() => {
    const doTick = setInterval(onTick, tickDuration);

    return () => clearInterval(doTick);
  }, [onTick]);

  const addToOutput = (text: string) => {
    setOutput((output) => [...output, text]);
  };

  const processLetter = () => {
    const letterMatch = Object.keys(alphaToMorse).find(
      (key) => alphaToMorse[key] === buffer
    );

    if (letterMatch) {
      addToOutput(letterMatch);
    }

    setBuffer("");
  };

  const processWord = () => {
    if (output.length !== 0) {
      addToOutput("/");
    }
  };

  useEffect(() => {
    if (ticks > Multipliers.elementSpacing && buffer !== "") {
      processLetter();
    }
    if (ticks > Multipliers.wordSpacing) {
      processWord();
      stop();
    }
  }, [ticks]);

  // Handle click
  const onClickLong = () => {
    setBuffer((l) => l + "-");
  };

  const onClickShort = () => {
    setBuffer((l) => l + ".");
  };

  const onMouseDown = () => {
    audio.loop = true;
    audio.play();
    stop();
  };

  const onMouseUp = () => {
    audio.pause();
    audio.currentTime = 0;
    reset();
    start();
  };

  const longPressEvent = useLongPress({
    onMouseDown,
    onMouseUp,
    onClickLong,
    onClickShort,
    shouldPreventDefault: true,
    delay: longPressDuration,
  });

  return (
    <div className="main">
      <div className="dictionary">
        {Object.keys(alphaToMorse).map((key: string, i: number) => (
          <div className="letter" key={alphaToMorse[key]}>
            <span>{key}</span>
            <span>{alphaToMorse[key]}</span>
          </div>
        ))}
      </div>

      <div className="timing">
        <input
          type="number"
          min="10"
          max="1000"
          value={tickDuration}
          onChange={(e) => setTickDuration(Number(e.target.value))}
        />

        <span>Ticks: {ticks}</span>

        {/* <div
          className="tick-progress"
          style={{ animationDuration: `${tickDuration}ms` }}
        /> */}
      </div>

      <div className="output">
        <div className="output__letters">
          {output.map((letter, i) => {
            return (
              <div
                className={clsx(
                  "output__letter",
                  letter === "/" && "output__letter--word-break"
                )}
                key={`${letter}-${i}`}
              >
                <span>{letter}</span>
                <span>{alphaToMorse[letter] ?? ""}</span>
              </div>
            );
          })}
        </div>

        <button
          className="output__clear"
          onClick={() => {
            setOutput([]);
          }}
        >
          Clear
        </button>
      </div>

      <div className="controls">
        <span className="controls__buffer">{buffer}</span>

        <button className="controls__button" {...longPressEvent}>
          Press
        </button>
      </div>
    </div>
  );
}

export default App;
