import { alphaToMorse, dictionaryLists } from "../data";
import "./Dictionary.scss";

export const Dictionary = () => {
  return (
    <div className="dictionary">
      {dictionaryLists.map((list) => {
        return (
          <div className="dictionary__list" key={`list-${list[0]}`}>
            {list.map((letter) => {
              return (
                <div className="letter" key={alphaToMorse[letter]}>
                  <span>{letter}</span>
                  <span>{alphaToMorse[letter]}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
