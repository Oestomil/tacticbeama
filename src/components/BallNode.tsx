// src/components/BallNode.tsx
import { Group, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

type BallNodeProps = {
  x: number; // merkeze göre X
  y: number; // merkeze göre Y
  r: number; // yarıçap (görselin yarısı)
  draggable?: boolean;
  dragBound?: (pos: { x: number; y: number }) => { x: number; y: number };
  onDragMove?: (x: number, y: number) => void; // merkeze göre koordinatlar
  src?: string; // opsiyonel; varsayılan: /ball.svg
};

export default function BallNode({
  x,
  y,
  r,
  draggable = true,
  dragBound,
  onDragMove,
  src = "/ball.svg",
}: BallNodeProps) {
  const [img] = useImage(src, "anonymous"); // /public/ball.svg

  return (
    <Group
      x={x}
      y={y}
      draggable={draggable}
      dragBoundFunc={dragBound}
      onDragMove={(e) => onDragMove?.(e.target.x(), e.target.y())}
    >
      {img && (
        <KonvaImage
          image={img}
          width={r * 2}
          height={r * 2}
          offsetX={r}       // merkeze ortala
          offsetY={r}
          listening={true}
          perfectDrawEnabled={false}
          shadowForStrokeEnabled={false}
        />
      )}
    </Group>
  );
}
