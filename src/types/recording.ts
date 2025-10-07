// src/types/recording.ts
export type SceneFrame = {
  players: { id: string; nx: number; ny: number }[];
  ball: { nx: number; ny: number };
};
