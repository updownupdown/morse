import { alphaToMorse } from "../data";
import clsx from "clsx";
import "./Message.scss";

interface Props {
  message: string[];
  buffer: string;
}

export const Message = ({ message, buffer }: Props) => {
  return (
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
        {buffer && (
          <div className="message__letter">
            <span>&nbsp;</span>
            <span>{buffer}</span>
          </div>
        )}
      </div>
    </div>
  );
};
