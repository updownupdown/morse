import { alphaToMorse } from "../data/alphaToMorse";
import "./Keyboard.scss";
import clsx from "clsx";
import { MorseChar } from "./MorseChar";

// A named layout, or just the characters to offer (e.g. a lesson's)
export type KeyboardLayout = "letters" | "special" | "alnum" | string[];

interface KeyboardProps {
  setGuess: (key: string) => void;
  layout?: KeyboardLayout;
  // Per-key state, e.g. for word games: a class suffix by character
  keyStates?: Record<string, string>;
  showMorse?: boolean;
  disabled?: boolean;
}

const letterRows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

const layouts: Record<string, string[]> = {
  letters: [letterRows[0], letterRows[1], letterRows[2] + ",'"],
  special: ["1234567", "890!?/@", "()'\"-+=", "&.,:;"],
  alnum: ["1234567890", ...letterRows],
  plain: letterRows,
};

function rowsFor(layout: KeyboardLayout): { rows: string[][]; kind: string } {
  if (typeof layout === "string") {
    return {
      rows: layouts[layout].map((row) => row.split("")),
      kind: layout === "special" ? "special-chars" : "regular",
    };
  }

  // Custom characters: rows of up to seven large keys
  const perRow = layout.length <= 7 ? 7 : Math.ceil(layout.length / Math.ceil(layout.length / 7));
  const rows: string[][] = [];
  for (let i = 0; i < layout.length; i += perRow) {
    rows.push(layout.slice(i, i + perRow));
  }
  return { rows, kind: layout.length > 28 ? "regular" : "special-chars" };
}

export const Keyboard = ({
  setGuess,
  layout = "letters",
  keyStates,
  showMorse = true,
  disabled,
}: KeyboardProps) => {
  // More than 28 custom characters: fall back to rows of ten
  const custom =
    Array.isArray(layout) && layout.length > 28
      ? {
          rows: Array.from({ length: Math.ceil(layout.length / 10) }, (_, i) =>
            layout.slice(i * 10, i * 10 + 10),
          ),
          kind: "regular",
        }
      : rowsFor(layout);

  return (
    <div className="keyboard-wrap">
      <div
        className={clsx(
          "keyboard",
          `keyboard--${custom.kind}`,
          layout === "alnum" && "keyboard--compact",
          Array.isArray(layout) && "keyboard--custom",
        )}
      >
        {custom.rows.map((row, i) => (
          <div className="keyboard__row" key={i}>
            {row.map((letter) => (
              <button
                key={letter}
                className={clsx(
                  "key",
                  keyStates?.[letter] && `key--${keyStates[letter]}`,
                )}
                disabled={disabled}
                onClick={() => {
                  setGuess(letter);
                }}
              >
                <span className="key__letter">{letter}</span>
                {showMorse && (
                  <MorseChar morse={alphaToMorse(letter)} size="sm" />
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
