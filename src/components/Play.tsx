import { useContext, useEffect, useState } from "react";
import clsx from "clsx";
import "./Play.scss";
import { Modes, MorseContext } from "../context/MorseContext";
import { useAudioContext } from "../context/AudioContext";
import { useProgress } from "../context/ProgressContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { initCode } from "../hooks/useAudio";
import { routeToHash } from "../hooks/useHashRoute";
import { gameGroups, games } from "../games/registry";
import { GameDef, GameResult } from "../games/types";
import { ArrowLeftIcon } from "../icons/ArrowLeftIcon";
import { HelpIcon } from "../icons/HelpIcon";
import { CloseIcon } from "../icons/CloseIcon";

export const bestKey = (game: GameDef, level: string) => `${game.id}.${level}`;

export const Play = () => {
  const { routeParam } = useContext(MorseContext);
  const game = games.find((g) => g.id === routeParam);

  return game ? <GameShell key={game.id} game={game} /> : <GameList />;
};

const GameList = () => {
  const { setSelectedMode } = useContext(MorseContext);
  const { progress } = useProgress();

  return (
    <div className="play">
      {gameGroups.map((group) => (
        <section key={group.title} className="play-group">
          <h2>{group.title}</h2>
          <div className="play-group__games">
            {group.games.map((game) => {
              // The best across this game's levels
              const bests = game.levels
                .map(([level]) => progress.bests[bestKey(game, level)])
                .filter((b): b is number => b !== undefined);
              const best =
                bests.length === 0
                  ? undefined
                  : game.lowerIsBetter
                    ? Math.min(...bests)
                    : Math.max(...bests);

              return (
                <a
                  key={game.id}
                  className="game-tile"
                  href={routeToHash({ mode: Modes.Play, param: game.id })}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedMode(Modes.Play, game.id);
                  }}
                >
                  <span className="game-tile__name">{game.name}</span>
                  <span className="game-tile__desc">{game.desc}</span>
                  <span className="game-tile__meta">
                    <span>{game.trains}</span>
                    {best !== undefined && <span>Best {best}</span>}
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

type ShellState = "ready" | "playing" | "over";

const GameShell = ({ game }: { game: GameDef }) => {
  const { setSelectedMode, setPhase, phase } = useContext(MorseContext);
  const { playMorse, stopMorse } = useAudioContext();
  const { progress, submitBest } = useProgress();

  const [storedLevel, setLevel] = useLocalStorage(
    `gameLevel.${game.id}`,
    game.levels[0][0],
  );
  const level = game.levels.some(([id]) => id === storedLevel)
    ? storedLevel
    : game.levels[0][0];

  const [state, setState] = useState<ShellState>("ready");
  const [showHelp, setShowHelp] = useState(false);
  const [result, setResult] = useState<GameResult | undefined>(undefined);
  const [isNewBest, setIsNewBest] = useState(false);
  // A fresh game each round
  const [round, setRound] = useState(0);

  const best = progress.bests[bestKey(game, level)];
  const Game = game.component;

  async function start() {
    await playMorse(initCode);
    setResult(undefined);
    setRound((r) => r + 1);
    setState("playing");
    setPhase("play");
  }

  function end(gameResult: GameResult) {
    stopMorse();
    setIsNewBest(
      !gameResult.lost &&
        gameResult.score > 0 &&
        submitBest(bestKey(game, level), gameResult.score, game.lowerIsBetter),
    );
    setResult(gameResult);
    setState("over");
    setPhase("standby");
  }

  function quit() {
    stopMorse();
    setState("ready");
    setPhase("standby");
  }

  // Leaving by the back button ends the round
  useEffect(() => {
    if (phase !== "play" && state === "playing") setState("ready");
  }, [phase]);

  if (state === "playing") {
    return (
      <div className="play play--game">
        <div className="game-bar">
          <span>{game.name}</span>
          <button className="btn btn--small" onClick={quit}>
            <CloseIcon />
            <span>Quit</span>
          </button>
        </div>
        <Game key={round} level={level} best={best} onEnd={end} />
      </div>
    );
  }

  return (
    <div className="play play--setup">
      <div className="game-bar">
        <button
          className="btn btn--small"
          onClick={() => setSelectedMode(Modes.Play)}
        >
          <ArrowLeftIcon />
          <span>Games</span>
        </button>
        <button
          className={clsx("btn btn--small", showHelp && "btn--active")}
          onClick={() => setShowHelp(!showHelp)}
          aria-expanded={showHelp}
        >
          <HelpIcon />
          <span>How to play</span>
        </button>
      </div>

      <div className="game-setup">
        <h2>{game.name}</h2>

        {state === "over" && result ? (
          <div className="game-result">
            {result.lost ? (
              <span className="game-result__lost">{result.lost}</span>
            ) : (
              <>
                <span className="game-result__score">{result.score}</span>
                <span className="game-result__unit">{game.scoreUnit}</span>
              </>
            )}
            {result.summary && <p>{result.summary}</p>}
            <p className={clsx(isNewBest && "game-result__best")}>
              {isNewBest
                ? "New best!"
                : best !== undefined
                  ? `Best: ${best}`
                  : ""}
            </p>
          </div>
        ) : (
          <p className="game-setup__desc">{game.desc}</p>
        )}

        {showHelp && (
          <ul className="game-help">
            {game.help.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}

        {game.levels.length > 1 && (
          <div
            className={clsx(
              "button-menu game-levels",
              (game.levels.length > 3 || game.levels.join("").length > 36) &&
                "button-menu--vertical button-menu--vertical-wrap",
            )}
            aria-label={game.levelName ?? "Level"}
          >
            {game.levels.map(([id, label]) => (
              <button
                key={id}
                className={`btn-menu-item btn-menu-item--${level === id ? "selected" : "not-selected"}`}
                onClick={() => {
                  setLevel(id);
                  setState("ready");
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {state !== "over" && best !== undefined && (
          <p className="game-setup__best">
            Best: {best} {game.scoreUnit}
          </p>
        )}
      </div>

      <div className="game-setup__start">
        <button className="btn btn--large" onClick={start}>
          <span>{state === "over" ? "Play again" : "Start"}</span>
        </button>
      </div>
    </div>
  );
};
