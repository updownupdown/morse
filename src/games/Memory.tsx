import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { alphaToMorse } from "../data/alphaToMorse";
import { letters } from "../data/chars";
import { MorseChar } from "../components/MorseChar";
import { useAudioContext } from "../context/AudioContext";
import { useProgress } from "../context/ProgressContext";
import { shuffle } from "../data/DataSources";
import { weightedOrder } from "../progress/progress";
import { GameStats, Stat } from "./common";
import { GameProps } from "./types";
import { SpeakerIcon } from "../icons/SpeakerIcon";

type Card = { id: number; char: string; kind: "letter" | "code" };

export const Memory = ({ level, onEnd }: GameProps) => {
  const { playMorse } = useAudioContext();
  const { progress, record } = useProgress();
  const pairs = level === "easy" ? 6 : 8;
  // Hard: the code cards can only be heard
  const byEar = level === "hard";

  const [cards] = useState<Card[]>(() => {
    // Letters you find hard are more likely to be dealt
    const chars = weightedOrder(letters, progress.receive).slice(0, pairs);
    return shuffle(
      chars.flatMap((char, i) => [
        { id: i * 2, char, kind: "letter" as const },
        { id: i * 2 + 1, char, kind: "code" as const },
      ]),
    );
  });

  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  function flip(card: Card) {
    if (open.length === 2 || open.includes(card.id)) return;
    if (matched.includes(card.char)) return;

    if (card.kind === "code") playMorse(alphaToMorse(card.char));

    if (open.length === 0) {
      setOpen([card.id]);
      return;
    }

    const first = cards.find((c) => c.id === open[0])!;
    const isPair = first.char === card.char;
    const nextMoves = moves + 1;
    setMoves(nextMoves);
    setOpen([first.id, card.id]);

    // Only a letter turned over with a code is a real attempt at reading
    if (first.kind !== card.kind) {
      const codeCard = first.kind === "code" ? first : card;
      record("receive", codeCard.char, isPair);
    }

    if (isPair) {
      const nextMatched = [...matched, card.char];
      timerRef.current = window.setTimeout(() => {
        setMatched(nextMatched);
        setOpen([]);
        if (nextMatched.length === pairs) onEnd({ score: nextMoves });
      }, 500);
    } else {
      timerRef.current = window.setTimeout(() => setOpen([]), 1100);
    }
  }

  return (
    <div className="game game--memory">
      <GameStats
        left={<Stat label="Moves" value={moves} />}
        right={<Stat label="Pairs" value={`${matched.length}/${pairs}`} />}
      />

      <div className="game__stage">
        <div className={clsx("memory-grid", `memory-grid--${pairs}`)}>
          {cards.map((card) => {
            const isMatched = matched.includes(card.char);
            const isOpen = open.includes(card.id) || isMatched;

            return (
              <button
                key={card.id}
                className={clsx(
                  "memory-card",
                  isOpen && "memory-card--open",
                  isMatched && "memory-card--matched",
                )}
                onClick={() => flip(card)}
                disabled={isMatched}
                aria-label={
                  !isOpen
                    ? "Face-down card"
                    : card.kind === "letter"
                      ? `Letter ${card.char}`
                      : byEar && !isMatched
                        ? "A code, by ear"
                        : `Code for ${card.char}`
                }
              >
                {!isOpen ? null : card.kind === "letter" ? (
                  <span>{card.char}</span>
                ) : byEar && !isMatched ? (
                  <SpeakerIcon />
                ) : (
                  <MorseChar morse={alphaToMorse(card.char)} size="sm" />
                )}
              </button>
            );
          })}
        </div>
        <p className="game__prompt">
          Pair each letter with its code. Code cards play when turned.
        </p>
      </div>
    </div>
  );
};
