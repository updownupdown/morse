import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Receive.scss";
import { Telegrams, alphaToMorse } from "../data";
import { Message } from "./Message";
import tone from "../audio/tone.mp3";
import { useTiming } from "../hooks/useTiming";
import Stop from "../icons/Stop";
import Play from "../icons/Play";

export const Receive = () => {
  const { timing } = useTiming();
  const audio = useMemo(() => new Audio(tone), []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState(Telegrams["Simple SOS"]);
  const messageArray = Array.from(message.toUpperCase());

  const [messageSymbols, setMessageSymbols] = useState("");
  const [playPosition, setPlayPosition] = useState(0);

  const timeout = useRef<any>(null);

  const playGap = useCallback(() => {
    timeout.current = setTimeout(() => {
      setPlayPosition((p) => p + 1);
    }, timing.gapElements);
  }, [timing]);

  const playSymbol = useCallback(
    (duration: number) => {
      timeout.current = setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;

        playGap();
      }, duration);
    },
    [audio, playGap]
  );

  // Play/stop message
  const playMessage = () => {
    const messageArray = Array.from(message.toUpperCase());
    let symbols: string[] = [];

    messageArray.forEach((char) => {
      if (char === " ") {
        symbols.push("/");
      } else {
        const charMorse = alphaToMorse[char];
        if (charMorse) {
          symbols.push(charMorse + " ");
        }
      }
    });

    setMessageSymbols(symbols.join(""));

    if (message.length !== 0) {
      setIsPlaying(true);
    }
  };

  const stopMessage = useCallback(() => {
    audio.pause();
    audio.currentTime = 0;
    clearTimeout(timeout.current);
    setIsPlaying(false);
    setMessageSymbols("");
    setPlayPosition(0);
  }, [audio]);

  // Play symbols
  useEffect(() => {
    if (!isPlaying) return;

    const symbolToPlay = messageSymbols[playPosition];
    if (!symbolToPlay) {
      stopMessage();
      return;
    }

    let playDuration = timing.short;
    if (symbolToPlay === "-") playDuration = timing.long;
    if (symbolToPlay === " ") playDuration = timing.gapLetters;
    if (symbolToPlay === "/") playDuration = timing.gapWords;

    if (symbolToPlay === "." || symbolToPlay === "-") {
      audio.play();
    }

    playSymbol(playDuration);
  }, [
    isPlaying,
    messageSymbols,
    playPosition,
    audio,
    playSymbol,
    timing,
    stopMessage,
  ]);

  return (
    <div className="receive">
      <select
        value=""
        onChange={(e) => {
          setMessage(e.target.value);
        }}
      >
        <option value="">Select message...</option>
        {Object.entries(Telegrams).map(([key, value]) => (
          <option value={value} key={key}>
            {key}
          </option>
        ))}
      </select>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        readOnly={isPlaying}
      />

      <Message message={messageArray} buffer={""} />

      <div className="receive__buttons">
        <button className="large-button" onClick={() => playMessage()}>
          <Play />
        </button>
        <button className="large-button" onClick={() => stopMessage()}>
          <Stop />
        </button>
      </div>
    </div>
  );
};
