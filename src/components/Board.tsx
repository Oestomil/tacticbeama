// src/components/Board.tsx
import { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Arrow, Text } from "react-konva";
import useImage from "use-image";
import PlayerNode from "./PlayerNode";
import BallNode from "./BallNode";
import styles from "./Board.module.css";
import type { ArrowItem, DrawMode } from "../types/draw";

/** 9:16 oran */
const RATIO = 9 / 16;

/** 🔵 ARKA PLAN RESMİ
 *  - `/public/field.svg` varsa aşağıdaki satır yeterli.
 *  - Eğer `src/assets/field.svg` içindeyse, alttaki import’u aç ve FIELD_SRC’yi ona ayarla.
 */
const FIELD_SRC = "/field.svg";
// import fieldSrc from "../assets/field.svg"; // <- dosya src/assets'teyse aç
// const FIELD_SRC = fieldSrc as string;

type TeamID = "top" | "bottom";
type Player = { id: string; team: TeamID; number: number; name: string; nx: number; ny: number };
type Ball   = { nx: number; ny: number };
type TeamMeta = { name: string; fill: string; stroke: string };

type Props = {
  players: Player[];
  ball: Ball;
  teams: Record<TeamID, TeamMeta>;
  onMovePlayer: (id: string, nx: number, ny: number) => void;
  onMoveBall: (nx: number, ny: number) => void;
  arrows: ArrowItem[];
  onAddArrow: (a: ArrowItem) => void;
  drawMode: DrawMode;
  runCurved: boolean;
};

const Board = forwardRef<any, Props>(function Board(
  { players, ball, teams, onMovePlayer, onMoveBall, arrows, onAddArrow, drawMode, runCurved }, ref
) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<any>(null);
  const [dims, setDims] = useState({ w: 300, h: 300 });

  // SVG arka planını yükle
  const [fieldImg] = useImage(FIELD_SRC, "anonymous");

  // temp çizim state
  const [tempStart, setTempStart] = useState<{ x: number; y: number } | null>(null);
  const [tempPos,   setTempPos]   = useState<{ x: number; y: number } | null>(null);

  // container -> Stage boyutu
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const compute = () => {
      const cw = el.clientWidth;
      const vh = (window.visualViewport?.height ?? window.innerHeight);
      const ch = Math.min(el.clientHeight || vh, vh);

      let w = cw, h = Math.round(cw / RATIO);
      if (h > ch) { h = ch; w = Math.round(ch * RATIO); }
      setDims({ w, h });
    };

    const ro = new ResizeObserver(compute);
    ro.observe(el);

    window.visualViewport?.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    compute();

    return () => {
      ro.disconnect();
      window.visualViewport?.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, []);

  // Stage ref dışarı aç
  useEffect(() => {
    if (ref && stageRef.current) {
      if (typeof ref === "function") ref(stageRef.current);
      else (ref as any).current = stageRef.current;
    }
  }, [ref]);

  // Boyuta göre ölçek bazlı metrik
  const scale = useMemo(() => Math.max(0.75, Math.min(1.6, dims.w / 390)), [dims.w]);

  // Oyuncu/Top yarıçapları
  const pRadius   = useMemo(() => Math.round(Math.max(14, 14 * scale)), [scale]);
  const ballRadius= useMemo(() => Math.round(Math.max(10, 10 * scale)), [scale]);

  const boundGeneric = (pad: number) => (pos: { x: number; y: number }) => {
    const x = Math.min(Math.max(pos.x, pad), dims.w - pad);
    const y = Math.min(Math.max(pos.y, pad), dims.h - pad);
    return { x, y };
  };
  const boundPlayer = boundGeneric(pRadius + 2);
  const boundBall   = boundGeneric(ballRadius + 2);

  // sahnede tıklama: ok çizim
  function handleStageClick() {
    if (drawMode === "none") return;
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    if (!tempStart) {
      setTempStart({ x: pointer.x, y: pointer.y });
      setTempPos({ x: pointer.x, y: pointer.y });
    } else {
      // 🔴 DİKKAT: ArrowItem now expects {x,y} normalized
      const from = { x: tempStart.x / dims.w, y: tempStart.y / dims.h };
      const to   = { x: pointer.x   / dims.w, y: pointer.y   / dims.h };
      const item: ArrowItem = {
        id: `arr_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        kind: drawMode === "pass" ? "pass" : "run",
        curved: drawMode === "run" ? runCurved : false,
        from, to,
      };
      onAddArrow(item);
      setTempStart(null);
      setTempPos(null);
    }
  }

  function handleMouseMove() {
    if (!tempStart) return;
    const stage = stageRef.current;
    if (!stage) return;
    const p = stage.getPointerPosition();
    if (!p) return;
    setTempPos({ x: p.x, y: p.y });
  }

  function midCurve(x1: number, y1: number, x2: number, y2: number) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const amp = Math.min(60 * scale, len * 0.2);
    return { cx: mx + nx * amp, cy: my + ny * amp };
  }

  // çizim aktifken body scroll kilidi
  useEffect(() => {
    const shouldLock = drawMode !== "none" && (tempStart !== null);
    if (shouldLock) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [drawMode, tempStart]);

  const pixelRatio = useMemo(() => Math.min(window.devicePixelRatio || 1, 2), []);

  // Ok stilleri
  const arrowPointerLen = Math.round(14 * scale);
  const arrowPointerWid = Math.round(12 * scale);
  const arrowStroke     = Math.max(3, Math.round(4 * scale));
  const ghostStroke     = Math.max(2, Math.round(3 * scale));

  return (
    <div className={styles.shell}>
      <div ref={wrapRef} className={styles.wrap}>
        <Stage
          ref={stageRef}
          width={dims.w}
          height={dims.h}
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
          onClick={handleStageClick}
          onTap={handleStageClick}
          pixelRatio={pixelRatio}
          perfectDrawEnabled={false}
        >
          {/* Arka plan */}
          <Layer listening={false}>
            <Rect x={0} y={0} width={dims.w} height={dims.h} fill="#0a0f1f" />
            {fieldImg && (
              <KonvaImage
                image={fieldImg}
                x={0}
                y={0}
                width={dims.w}
                height={dims.h}
                listening={false}
              />
            )}
          </Layer>

          {/* Oklar */}
          <Layer>
            {arrows.map((a) => {
              const x1 = a.from.x * dims.w, y1 = a.from.y * dims.h;
              const x2 = a.to.x   * dims.w, y2 = a.to.y   * dims.h;
              const isPass = a.kind === "pass";

              if (a.curved) {
                const { cx, cy } = midCurve(x1, y1, x2, y2);
                return (
                  <Arrow
                    key={a.id}
                    points={[x1, y1, cx, cy, x2, y2]}
                    tension={0.5}
                    pointerLength={arrowPointerLen}
                    pointerWidth={arrowPointerWid}
                    stroke={isPass ? "#ffffff" : "#fbbf24"}
                    dash={isPass ? [10 * scale, 8 * scale] as any : undefined}
                    strokeWidth={arrowStroke}
                  />
                );
              }
              return (
                <Arrow
                  key={a.id}
                  points={[x1, y1, x2, y2]}
                  pointerLength={arrowPointerLen}
                  pointerWidth={arrowPointerWid}
                  stroke={isPass ? "#ffffff" : "#fbbf24"}
                  dash={isPass ? [10 * scale, 8 * scale] as any : undefined}
                  strokeWidth={arrowStroke}
                />
              );
            })}

            {/* Geçici çizgi */}
            {drawMode !== "none" && tempStart && tempPos && (
              <Arrow
                points={[tempStart.x, tempStart.y, tempPos.x, tempPos.y]}
                pointerLength={arrowPointerLen}
                pointerWidth={arrowPointerWid}
                stroke={drawMode === "pass" ? "#ffffff" : "#fbbf24"}
                dash={drawMode === "pass" ? [8 * scale, 6 * scale] as any : [4 * scale, 4 * scale] as any}
                strokeWidth={ghostStroke}
                opacity={0.6}
              />
            )}
          </Layer>

          {/* Oyuncular */}
          <Layer>
            {players.map((p) => {
              const px = Math.round(p.nx * dims.w);
              const py = Math.round(p.ny * dims.h);
              const { fill, stroke } = teams[p.team];
              return (
                <PlayerNode
                  key={p.id}
                  x={px}
                  y={py}
                  r={pRadius}
                  number={p.number}
                  name={p.name}
                  fill={fill}
                  stroke={stroke}
                  dragBound={boundPlayer}
                  onDragMove={(x, y) => onMovePlayer(p.id, x / dims.w, y / dims.h)}
                />
              );
            })}
          </Layer>

          {/* Top */}
          <Layer>
            <BallNode
              x={ball.nx * dims.w}
              y={ball.ny * dims.h}
              r={ballRadius}
              dragBound={boundBall}
              onDragMove={(x, y) => onMoveBall(x / dims.w, y / dims.h)}
            />
          </Layer>

          {/* Watermark */}
          <Layer listening={false}>
            <Text
              text="powered by TacticbeaM"
              fontSize={Math.round(18 * scale)}
              fontStyle="bold"
              fill="rgba(255,255,255,0.7)"
              x={dims.w - Math.round(200 * scale)}
              y={dims.h - Math.round(28 * scale)}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
});

export default Board;
