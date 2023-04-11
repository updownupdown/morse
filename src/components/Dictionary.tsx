import { IProsign, alphaToMorse, dictionaryLists, prosigns } from "../data";
import "./Dictionary.scss";

export const Dictionary = () => {
  const parseProsign = (sign: string) => {
    if (sign.indexOf("<") === -1) {
      return <span>{sign}</span>;
    }

    const signParts = sign.split(">");

    return (
      <span>
        {signParts.map((part) => {
          if (part.indexOf("<") !== -1) {
            return (
              <span className="linked" key={part}>
                {part.replace("<", "")}
              </span>
            );
          }

          return <span key={part}>{part}</span>;
        })}
      </span>
    );
  };

  const prosignDictionary = (list: IProsign[]) => {
    return (
      <div className="table-wrap">
        <table className="prosign">
          <tbody>
            {list.map((sign) => {
              return (
                <tr key={sign.prosign}>
                  <td className="prosign__sign">
                    {parseProsign(sign.prosign)}
                  </td>
                  <td className="prosign__voice">{sign.voice}</td>
                  <td className="prosign__code">{sign.code}</td>
                  <td className="prosign__details">{sign.details}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="dictionary-wrap">
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

      {prosignDictionary(prosigns)}
    </div>
  );
};
