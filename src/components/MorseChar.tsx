import { useContext } from "react";
import "./MorseChar.scss";
import { MorseContext, Setting } from "../context/MorseContext";

interface MorseCharProps {
  morse: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const inProgressChar = "in-progress";

export const MorseChar = ({ morse, size }: MorseCharProps) => {
  const { settings } = useContext(MorseContext);
  const morseSplit = morse.split("");
  const inProgress = morse === inProgressChar;

  return (
    <div className={`morse-char morse-char--${size}`}>
      {inProgress ? (
        <span
          className="dit-dah dit-dah--in-progress"
          style={{ animationDuration: `${settings[Setting.UnitTime] * 3}ms` }}
        />
      ) : (
        morseSplit.map((char, index) => (
          <span
            key={index}
            className={`dit-dah dit-dah--${char === " " ? "space" : char === "." ? "dit" : "dah"}`}
          />
        ))
      )}
    </div>
  );
};
