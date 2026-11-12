import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { alphaToMorse } from "../data/alphaToMorse";
import { MorseChar } from "../components/MorseChar";
import { useAudioContext } from "../context/AudioContext";
import { useProgress } from "../context/ProgressContext";
import { GameStats, pick, Stat, useTyping } from "./common";
import { GameProps } from "./types";
import { SpeakerIcon } from "../icons/SpeakerIcon";

// Characters whose codes are easy to mistake for one another
export const soundAlikeGroups: Record<string, string[]> = {
  easy: ["EI", "TM", "AN", "SH", "DB", "UV", "KR", "GW", "MO", "IS"],
  medium: ["EISH", "TMO", "AWJ", "NDB", "UVF", "KRC", "GZQ", "FL", "PX", "YQ"],
  hard: ["SH5", "HV4", "DB6", "MO0", "WJ1", "GZ7", "UV3", "O98", "KYC", "PXL"],
};

const rounds = 20;

type Round = { options: string[]; answer: string };

function makeRound(level: string, previous?: string): Round {
  const groups = soundAlikeGroups[level] ?? soundAlikeGroups.easy;
  let round: Round;

  do {
    const options = pick(groups).split("");
    round = { options, answer: pick(options) };
  } while (round.answer === previous);

  return round;
}

export const SoundAlikes = ({ level, onEnd }: GameProps) => {
  const { playMorse } = useAudioContext();
  const { record } = useProgress();

  const [round, setRound] = useState(() => makeRound(level));
  const [count, setCount] = useState(1);
  const [score, setScore] = useState(0);
  // The option picked this round, once answered
  const [picked, setPicked] = useState<string | undefined>(undefined);

  const scoreRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => playMorse(alphaToMorse(round.answer)),
      350,
    );
    return () => clearTimeout(timer);
  }, [round]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  function choose(option: string) {
    if (picked || !round.options.includes(option)) return;

    const correct = option === round.answer;
    record("receive", round.answer, correct);
    if (correct) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    } else {
      // Hear what it should have been
      playMorse(alphaToMorse(round.answer));
    }
    setPicked(option);

    timerRef.current = window.setTimeout(
      () => {
        if (count === rounds) {
          onEnd({ score: scoreRef.current, summary: `out of ${rounds}` });
          return;
        }
        setPicked(undefined);
        setCount(count + 1);
        setRound(makeRound(level, round.answer));
      },
      correct ? 500 : 1600,
    );
  }

  useTyping(choose, {
    " ": () => playMorse(alphaToMorse(round.answer)),
  });

  return (
    <div className="game game--alikes">
      <GameStats
        left={<Stat label="Round" value={`${count}/${rounds}`} />}
        right={<Stat label="Right" value={score} />}
      />

      <div className="game__stage">
        <button
          className="btn btn--outlined"
          onClick={() => playMorse(alphaToMorse(round.answer))}
        >
          <SpeakerIcon />
          <span>Play again</span>
        </button>
        <p className="game__prompt">Which one was it?</p>

        <div className="alikes-options">
          {round.options.map((option) => (
            <button
              key={option}
              className={clsx(
                "alikes-option",
                picked && option === round.answer && "alikes-option--right",
                picked === option &&
                  option !== round.answer &&
                  "alikes-option--wrong",
              )}
              onClick={() => choose(option)}
              disabled={picked !== undefined}
            >
              <span>{option}</span>
              {/* The codes are shown once you've answered */}
              <span className={clsx(!picked && "alikes-option__hidden")}>
                <MorseChar morse={alphaToMorse(option)} size="sm" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
