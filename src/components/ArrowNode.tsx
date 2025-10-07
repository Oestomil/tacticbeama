// src/components/ArrowNode.tsx
import { Arrow, Line } from "react-konva";
import type { ArrowItem } from "../types/draw";

export default function ArrowNode({ arrow }: { arrow: ArrowItem }) {
  const { from, to, kind, curved } = arrow;

  // koordinatları al
  const points = curved
    ? makeCurved(from.x, from.y, to.x, to.y)
    : [from.x, from.y, to.x, to.y];

  if (kind === "pass") {
    // Pas: kesikli çizgi + ok ucu
    return (
      <Arrow
        points={points}
        stroke="#facc15"
        fill="#facc15"
        strokeWidth={3}
        dash={[10, 6]}
        pointerLength={10}
        pointerWidth={10}
      />
    );
  }

  if (kind === "run") {
    // Koşu: düz ya da kıvrımlı çizgi, dolu ok ucu yok
    return (
      <Line
        points={points}
        stroke="#22d3ee"
        strokeWidth={3}
        tension={curved ? 0.5 : 0}
        lineCap="round"
        lineJoin="round"
        bezier={curved}
      />
    );
  }

  return null;
}

/**
 * Dört noktadan kıvrımlı çizgi üret
 * (basit cubic bezier approximation)
 */
function makeCurved(x1: number, y1: number, x2: number, y2: number): number[] {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 - 60; // orta noktayı biraz yukarı kaydır
  return [x1, y1, cx, cy, x2, y2];
}
