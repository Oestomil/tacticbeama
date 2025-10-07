// src/pages/PlayerPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Board from "../components/Board";
import type { SceneFrame } from "../types/recording";
import type { ArrowItem } from "../types/draw";
import styles from "./PlayerPage.module.css";

type LocationState = { scenes: SceneFrame[]; arrows?: ArrowItem[] };

type TeamID = "top" | "bottom";
type PlayerFull = {
  id: string;
  team: TeamID;
  number: number;
  name: string;
  nx: number;
  ny: number;
};
type Ball = { nx: number; ny: number };

function inferMetaFromId(id: string): { team: TeamID; number: number; name: string } {
  const side = id.startsWith("top_") ? "top" : id.startsWith("bottom_") ? "bottom" : "top";
  const parts = id.split("_");
  const n = Number(parts[1]);
  const number = Number.isFinite(n) ? n : 0;
  return { team: side as TeamID, number, name: `P${number || ""}` };
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function PlayerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  const scenes = state?.scenes ?? [];
  const arrows: ArrowItem[] = state?.arrows ?? []; // 🔹 pas & koşu çizgileri

  const [sceneIndex, setSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  const reqRef = useRef<number | null>(null);
  const stageRef = useRef<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);

  if (scenes.length < 2) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Kayıt yok</h2>
        <button onClick={() => navigate(-1)}>Geri</button>
      </div>
    );
  }

  // oyuncular
  const roster: PlayerFull[] = useMemo(
    () =>
      scenes[0].players.map((p0) => {
        const meta = (p0 as any).team
          ? { team: (p0 as any).team as TeamID, number: (p0 as any).number ?? 0, name: (p0 as any).name ?? "P" }
          : inferMetaFromId(p0.id);
        return { id: p0.id, ...meta, nx: p0.nx, ny: p0.ny };
      }),
    [scenes]
  );

  const teams = {
    top: { name: "Takım 1", fill: "#1f6feb", stroke: "#5ea0f6" },
    bottom: { name: "Takım 2", fill: "#ef4444", stroke: "#f87171" },
  };

  const from = scenes[sceneIndex];
  const to = scenes[sceneIndex + 1];
  const eased = easeInOutCubic(progress);

  const interpPlayers: PlayerFull[] = roster.map((base) => {
    const pFrom = from.players.find((x) => x.id === base.id) ?? base;
    const pTo = to.players.find((x) => x.id === base.id) ?? base;
    return {
      ...base,
      nx: pFrom.nx + (pTo.nx - pFrom.nx) * eased,
      ny: pFrom.ny + (pTo.ny - pFrom.ny) * eased,
    };
  });

  const interpBall: Ball = {
    nx: from.ball.nx + (to.ball.nx - from.ball.nx) * eased,
    ny: from.ball.ny + (to.ball.ny - from.ball.ny) * eased,
  };

  // oynatma
  useEffect(() => {
    if (!playing) return;
    let start: number | null = null;
    const DURATION = 1500;

    const tick = (ts: number) => {
      if (start == null) start = ts;
      const t = Math.min(1, (ts - start) / DURATION);
      setProgress(t);

      if (t < 1) {
        reqRef.current = requestAnimationFrame(tick);
      } else {
        if (sceneIndex < scenes.length - 2) {
          setSceneIndex((s) => s + 1);
          setProgress(0);
          start = null;
          reqRef.current = requestAnimationFrame(tick);
        } else {
          setPlaying(false);
          setProgress(1);
          stopRecording(); // sahne bitti → kaydı durdur
        }
      }
    };

    reqRef.current = requestAnimationFrame(tick);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [playing, sceneIndex, scenes.length]);

  function onPlay() {
    if (sceneIndex >= scenes.length - 1) setSceneIndex(0);
    setProgress(0);
    setPlaying(true);
  }
  function onPause() { setPlaying(false); }
  function onRestart() {
    setPlaying(false);
    setSceneIndex(0);
    setProgress(0);
  }

  // 🎥 kayıt (webm)
  async function startRecording() {
    if (!stageRef.current) return;

    const canvasList = stageRef.current.container().querySelectorAll("canvas");
    if (!canvasList || canvasList.length === 0) {
      console.error("Canvas bulunamadı");
      return;
    }

    const width = 1080;
    const height = 1920; // ✅ düzeltildi
    const mergedCanvas = document.createElement("canvas");
    mergedCanvas.width = width;
    mergedCanvas.height = height;
    const ctx = mergedCanvas.getContext("2d")!;

    function drawMerge() {
      ctx.clearRect(0, 0, width, height);
      canvasList.forEach((c: any) => ctx.drawImage(c, 0, 0, width, height));
      requestAnimationFrame(drawMerge);
    }
    drawMerge();

    const stream = mergedCanvas.captureStream(60);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp8" });
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setLastBlob(blob);
    };

    recorder.start(200);
    onPlay();
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  async function downloadWebM() {
    if (!lastBlob) return;
    const url = URL.createObjectURL(lastBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tacticbeam.webm";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.page}>
      {/* Sticky panel */}
      <div className={styles.topBar}>
        <button className={styles.btn} onClick={() => navigate(-1)}>⬅ Geri</button>
        <button
          className={`${styles.btn} ${playing ? styles.btnDisabled : ""}`}
          onClick={onPlay}
          disabled={playing}
        >
          ▶ Oynat
        </button>
        <button
          className={`${styles.btn} ${!playing ? styles.btnDisabled : ""}`}
          onClick={onPause}
          disabled={!playing}
        >
          ⏸ Durdur
        </button>
        <button className={styles.btn} onClick={onRestart}>⏮ Başa Al</button>

        <button className={styles.btn} onClick={startRecording}>⏺ Kaydı Başlat & Oynat</button>
        {lastBlob && (
          <button className={styles.btn} onClick={downloadWebM}>💾 WebM indir</button>
        )}
      </div>

      {/* Responsive saha */}
      <div className={styles.boardWrap}>
        <Board
          ref={stageRef}
          players={interpPlayers}
          ball={interpBall}
          teams={teams}
          onMovePlayer={() => {}}
          onMoveBall={() => {}}
          arrows={arrows}         // 🔹 çizgiler
          onAddArrow={() => {}}
          drawMode="none"
          runCurved={true}
        />
      </div>
    </div>
  );
}
