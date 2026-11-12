import React from "react";

export type GameResult = {
  score: number;
  // One line shown under the score, e.g. "Longest run: SOS"
  summary?: string;
  // Set when the game was lost: shown in place of the score
  lost?: string;
};

export type GameProps = {
  level: string;
  // The stored best for this game and level, if any
  best: number | undefined;
  onEnd: (result: GameResult) => void;
};

export type GameDef = {
  id: string;
  name: string;
  desc: string;
  trains: "Sending" | "Receiving" | "Both";
  // [id, label] pairs; the first is the default
  levels: [string, string][];
  levelName?: string;
  help: string[];
  // What a score counts, e.g. "caught"
  scoreUnit: string;
  lowerIsBetter?: boolean;
  component: React.FC<GameProps>;
};

export type GameGroup = {
  title: string;
  games: GameDef[];
};
