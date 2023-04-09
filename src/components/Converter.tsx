import { useEffect, useState } from "react";
import "./Converter.scss";
import { alphaToMorse } from "../data";

export const Converter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    let outputText: string[] = [];

    Array.from(input).forEach((char) => {
      let convertedLetter = "";
      const uppercaseChar = char.toUpperCase();

      if (char === " ") {
        convertedLetter = "   ";
      } else if (alphaToMorse[uppercaseChar]) {
        convertedLetter = alphaToMorse[uppercaseChar];
      }

      outputText.push(convertedLetter);
    });

    setOutput(outputText.join(" "));
  }, [input]);

  return (
    <div className="converter">
      <textarea
        placeholder="Enter text to convert to morse"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
      />

      <textarea value={output} readOnly />
    </div>
  );
};
