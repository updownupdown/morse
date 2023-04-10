import { alphaToMorse } from "../data";
import { useLocalStorage } from "../hooks/useLocalStorage";
import "./Converter.scss";

export const Converter = () => {
  const [alpha, setAlpha] = useLocalStorage("convertedAlpha", "");
  const [morse, setMorse] = useLocalStorage("convertedMorse", "");

  const convertToMorse = (text: string) => {
    let outputText: string[] = [];
    const alphaChunks = Array.from(text);

    alphaChunks.forEach((char) => {
      let convertedLetter = "";
      const uppercaseChar = char.toUpperCase();

      if (char === " ") {
        convertedLetter = "/";
      } else if (alphaToMorse[uppercaseChar]) {
        convertedLetter = alphaToMorse[uppercaseChar];
      }

      outputText.push(convertedLetter);
    });

    setMorse(outputText.join(" "));
  };

  const regex = /^[/. -]*$/;

  const sanitizedMorse = (input: string) => {
    return input.replace(regex, "");
  };

  const convertToAlpha = (input: string) => {
    let outputText: string[] = [];
    const morseChunks = input.split(" ");

    if (morseChunks.length !== 0) {
      morseChunks.forEach((symbols) => {
        if (symbols === "/") {
          outputText.push(" ");
          return;
        }
        if (symbols === "") {
          return;
        }

        const match = Object.keys(alphaToMorse).find(
          (key) => alphaToMorse[key] === symbols
        );

        outputText.push(match ?? "�");
      });
    }

    setAlpha(outputText.join(""));
  };

  const clearAlpha = () => {
    setAlpha("");
  };

  const clearMorse = () => {
    setMorse("");
  };

  return (
    <div className="converter">
      <div className="converter__header">
        <h3>Text</h3>

        <button className="small-button" onClick={clearAlpha}>
          Clear
        </button>
      </div>

      <textarea
        className="converter__alpha"
        placeholder="Enter text to convert to morse"
        value={alpha}
        onChange={(e) => {
          const text = e.target.value.toUpperCase();

          setAlpha(text);
          convertToMorse(text);
        }}
      />

      <div className="converter__header">
        <h3>Morse</h3>

        <button className="small-button" onClick={clearMorse}>
          Clear
        </button>
      </div>

      <textarea
        className="converter__morse"
        value={morse}
        placeholder="Enter morse to convert to morse"
        onChange={(e) => {
          const text = e.target.value;

          if (text === "" || regex.test(text)) {
            setMorse(text);
            convertToAlpha(text);
          }
        }}
        onPaste={(e) => {
          const text = sanitizedMorse(e.clipboardData.getData("Text"));

          setMorse(text);
          convertToAlpha(text);
        }}
      />
    </div>
  );
};
