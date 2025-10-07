import { Group, Circle, Text } from "react-konva";

type PlayerNodeProps = {
  x: number;
  y: number;
  r: number;
  number: number | string;
  name?: string;
  fill?: string;
  stroke?: string;
  draggable?: boolean;
  dragBound?: (pos: { x: number; y: number }) => { x: number; y: number };
  onDragMove?: (x: number, y: number) => void;
};

export default function PlayerNode({
  x, y, r, number, name,
  fill = "#1f6feb",
  stroke = "#93c5fd",
  draggable = true,
  dragBound,
  onDragMove,
}: PlayerNodeProps) {
  return (
    <Group
      x={x}
      y={y}
      draggable={draggable}
      dragBoundFunc={dragBound}
      onDragMove={(e) => {
        onDragMove?.(e.target.x(), e.target.y());
      }}
    >
      <Circle radius={r} fill={fill} stroke={stroke} strokeWidth={2} />
      <Text
        text={String(number)}
        fontSize={r * 0.9}
        fontStyle="700"
        fill="#ffffff"
        align="center"
        verticalAlign="middle"
        offsetX={r * 0.35}
        offsetY={r * 0.6}
      />
      {name && (
        <Text
          text={name}
          fontSize={Math.max(12, r * 0.45)}
          fill="#e5e7eb"
          align="center"
          offsetX={name.length * 3.5}
          y={r + 6}
        />
      )}
    </Group>
  );
}
