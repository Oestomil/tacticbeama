// src/types/draw.ts
export type DrawMode = "none" | "pass" | "run";

export type ArrowItem = {
  id: string;
  kind: "pass" | "run";
  from: { x: number; y: number };
  to: { x: number; y: number };
  curved?: boolean;
};
