// src/recording/SceneRecorderContext.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { SceneFrame } from "../types/recording";

type RecorderContextValue = {
  scenes: SceneFrame[];
  maxScenes: number;
  addScene: (frame: SceneFrame) => void;
  clearScenes: () => void;
  removeLast: () => void;
};

const RecorderContext = createContext<RecorderContextValue | null>(null);

export function SceneRecorderProvider({ children, max = 10 }: { children: ReactNode; max?: number }) {
  const [scenes, setScenes] = useState<SceneFrame[]>([]);
  const maxScenes = max;

  function addScene(frame: SceneFrame) {
    setScenes((prev) => (prev.length >= maxScenes ? prev : [...prev, frame]));
  }
  function clearScenes() { setScenes([]); }
  function removeLast() { setScenes((prev) => prev.slice(0, -1)); }

  return (
    <RecorderContext.Provider value={{ scenes, maxScenes, addScene, clearScenes, removeLast }}>
      {children}
    </RecorderContext.Provider>
  );
}

export function useRecorder() {
  const ctx = useContext(RecorderContext);
  if (!ctx) throw new Error("useRecorder must be used within SceneRecorderProvider");
  return ctx;
}
