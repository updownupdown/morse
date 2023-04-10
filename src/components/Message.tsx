import { alphaToMorse } from "../data";
import clsx from "clsx";
import "./Message.scss";

interface Props {
  message: string[];
  buffer: string;
  clearMessage?: () => void;
  deleteLastCharacter?: () => void;
}

export const Message = ({
  message,
  buffer,
  clearMessage,
  deleteLastCharacter,
}: Props) => {
  return (
    <div className="message-wrap">
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

      {clearMessage && deleteLastCharacter && (
        <div className="edit-message">
          <button onClick={deleteLastCharacter} disabled={message.length === 0}>
            Backspace
          </button>
          <button onClick={clearMessage} disabled={message.length === 0}>
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
