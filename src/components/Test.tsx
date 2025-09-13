import { useCallback, useContext, useEffect, useRef, useState } from "react";
import "./Receive.scss";
import { Telegrams, alphaToMorse } from "../data";
import { Message } from "./Message";
import { useTiming } from "../hooks/useTiming";
import Stop from "../icons/Stop";
import Play from "../icons/Play";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { SettingsContext } from "../context/SettingsContext";
import { useOscillator } from "./Oscillator";

export const Test = () => {
  const { timing } = useTiming();
  const { frequency, volume } = useContext(SettingsContext);
  var context = new AudioContext();
  var o = context.createOscillator();
  var g = context.createGain();
  o.frequency.value = frequency;
  o.connect(g);
  g.connect(context.destination);
  g.gain.value = volume;

  // const [isPlaying, setIsPlaying] = useState(false);
  // const [message, setMessage] = useLocalStorage(
  //   "receiveMessage",
  //   Telegrams["Simple SOS"]
  // );

  // const [messageSymbols, setMessageSymbols] = useState("");
  // const [playPosition, setPlayPosition] = useState(0);

  const timeout = useRef<any>(null);

  // const playGap = useCallback(() => {
  //   timeout.current = setTimeout(() => {
  //     setPlayPosition((p) => p + 1);
  //   }, timing.gapElements);
  // }, [timing]);

  // const playSymbol = useCallback(
  //   (duration: number) => {
  //     timeout.current = setTimeout(() => {
  //       stopSound();

  //       playGap();
  //     }, duration);
  //   },
  //   [stopSound, playGap]
  // );

  // Play/stop message
  const playMessage = () => {
    // const messageArray = Array.from(message.toUpperCase());
    const messageArray = Array.from("SOS SOS".toUpperCase());
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

    // setMessageSymbols(symbols.join(""));

    // if (message.length !== 0) {
    //   setIsPlaying(true);
    // }
  };

  const stopMessage = useCallback(() => {
    stopSound();

    clearTimeout(timeout.current);
    // setIsPlaying(false);
    // setMessageSymbols("");
    // setPlayPosition(0);
  }, [stopSound]);

  function playSound() {
    o.start();
  }

  function stopSound() {
    g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 1);
  }

  // Play symbols
  // useEffect(() => {
  //   if (!isPlaying) return;

  //   const symbolToPlay = messageSymbols[playPosition];
  //   if (!symbolToPlay) {
  //     stopMessage();
  //     return;
  //   }

  //   let playDuration = timing.short;
  //   if (symbolToPlay === "-") playDuration = timing.long;
  //   if (symbolToPlay === " ") playDuration = timing.gapLetters;
  //   if (symbolToPlay === "/") playDuration = timing.gapWords;

  //   if (symbolToPlay === "." || symbolToPlay === "-") {
  //     playSound();
  //   }

  //   playSymbol(playDuration);
  // }, [
  //   isPlaying,
  //   messageSymbols,
  //   playPosition,
  //   o,
  //   playSymbol,
  //   timing,
  //   stopMessage,
  // ]);

  const { isPlaying, setIsPlaying, setMorse } = useOscillator();

  return (
    <div className="receive">
      {/* <select
        value=""
        onChange={(e) => {
          setMessage(e.target.value.toUpperCase());
        }}
      >
        <option value="">Select message...</option>
        {Object.entries(Telegrams).map(([key, value]) => (
          <option value={value} key={key}>
            {key}
          </option>
        ))}
      </select> */}

      {/* <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.toUpperCase())}
        readOnly={isPlaying}
      />

      <Message message={message} buffer={""} /> */}

      <div className="receive__buttons">
        <button
          className="large-button"
          onClick={() => {
            setMorse("... --- ...");
            setIsPlaying(true);
          }}
          disabled={isPlaying}
        >
          <Play />
        </button>
        <button
          className="large-button"
          onClick={() => {
            setIsPlaying(false);
          }}
          disabled={!isPlaying}
        >
          <Stop />
        </button>
      </div>
    </div>
  );
};
