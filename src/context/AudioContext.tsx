import React, { createContext, useContext } from "react";
import { useAudio } from "../hooks/useAudio";

export const AudioContext = createContext<ReturnType<typeof useAudio> | null>(
  null,
);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const audio = useAudio();
  return (
    <AudioContext.Provider value={audio}>{children}</AudioContext.Provider>
  );
};

export function useAudioContext() {
  const ctx = useContext(AudioContext);
  if (!ctx)
    throw new Error("useAudioContext must be used within AudioProvider");
  return ctx;
}
