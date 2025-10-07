// src/components/Workspace.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Workspace.module.css";

import TeamPanel from "./panels/TeamPanel";
import Board from "./Board";
import DrawToolbar from "./DrawToolbar";
import RecordPanel from "./RecordPanel";

import { useRecorder } from "../recording/SceneRecorderContext";
import { generateFormation, type FormationName, type Side } from "../data/tactic";
import type { ArrowItem, DrawMode } from "../types/draw";
import type { SceneFrame } from "../types/recording";

/* ---------------- Types & helpers ---------------- */

type TeamID = "top" | "bottom";

type Player = {
  id: string;
  team: TeamID;
  number: number;
  name: string;
  nx: number;
  ny: number;
};

type Ball = { nx: number; ny: number };
type TeamMeta = { name: string; fill: string; stroke: string };

function lighten(hex: string, p = 0.35) {
  const n = hex.replace("#", "");
  const num = parseInt(n, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const mix = (c: number) => Math.min(255, Math.round(c + (255 - c) * p));
  const rr = mix(r), gg = mix(g), bb = mix(b);
  return `#${((1 << 24) + (rr << 16) + (gg << 8) + bb).toString(16).slice(1)}`;
}

const MAX_SCENES = 10;

/* ---------------- Component ---------------- */

export default function Workspace() {
  const navigate = useNavigate();
  const recorder = useRecorder();

  /* Team formations */
  const [formTop, setFormTop] = useState<FormationName>("4-4-2");
  const [formBot, setFormBot] = useState<FormationName>("4-4-2");

  /* Teams (name + colors) */
  const [teams, setTeams] = useState<Record<TeamID, TeamMeta>>({
    top:    { name: "Takım 1", fill: "#1f6feb", stroke: lighten("#1f6feb") },
    bottom: { name: "Takım 2", fill: "#ef4444", stroke: lighten("#ef4444") },
  });

  /* Players & ball */
  const [players, setPlayers] = useState<Player[]>([]);
  const [ball, setBall] = useState<Ball>({ nx: 0.5, ny: 0.5 });

  /* Arrows (pass/run) + draw mode */
  const [arrows, setArrows] = useState<ArrowItem[]>([]);
  const [drawMode, setDrawMode] = useState<DrawMode>("none");
  const [runCurved, setRunCurved] = useState<boolean>(true);

  /* -------- Team helpers -------- */
  function applyFormation(side: TeamID, f: FormationName) {
    const seeds = generateFormation(f, side as Side);
    setPlayers((prev) => {
      const keepOther = prev.filter((p) => p.team !== side);
      let idx = 0;
      const next: Player[] = seeds.map((s) => ({
        id: `${side}_${s.number}_${idx++}_${Math.random().toString(36).slice(2, 6)}`,
        team: side,
        number: s.number,
        name: s.name,
        nx: s.nx,
        ny: s.ny,
      }));
      return [...keepOther, ...next];
    });
    setBall({ nx: 0.5, ny: 0.5 });
  }

  /* Initial formations */
  useEffect(() => {
    applyFormation("top", formTop);
    applyFormation("bottom", formBot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearAllPlayers() {
    setPlayers([]);                 // tüm oyuncuları sil
    setBall({ nx: 0.5, ny: 0.5 });  // topu ortaya koy
    setArrows([]);                  // tüm okları temizle
  }

  const setTeamName = (side: TeamID, name: string) =>
    setTeams((t) => ({ ...t, [side]: { ...t[side], name } }));

  const setTeamColor = (side: TeamID, fill: string) =>
    setTeams((t) => ({ ...t, [side]: { ...t[side], fill, stroke: lighten(fill) } }));

  /* -------- Player CRUD -------- */
  function addPlayer(side: TeamID, number: number, name: string) {
    const ny = side === "top" ? 0.42 : 0.58;
    const nx = 0.5;
    setPlayers((prev) => [
      ...prev,
      { id: `${side}_custom_${Date.now()}`, team: side, number, name, nx, ny },
    ]);
  }
  function editPlayer(id: string, patch: Partial<Pick<Player, "name" | "number">>) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function removePlayer(id: string) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  /* -------- Board move handlers -------- */
  function onMovePlayer(id: string, nx: number, ny: number) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, nx, ny } : p)));
  }
  function onMoveBall(nx: number, ny: number) {
    setBall({ nx, ny });
  }

  /* -------- Arrows -------- */
  function onAddArrow(a: ArrowItem) { setArrows((prev) => [...prev, a]); }
  function clearArrows() { setArrows([]); }

  /* -------- Recording -------- */
  function saveCurrentScene() {
    if (recorder.scenes.length >= MAX_SCENES) {
      alert(`Maksimum ${MAX_SCENES} sahne kaydedebilirsiniz`);
      return;
    }
    const frame: SceneFrame = {
      players: players.map((p) => ({ id: p.id, nx: p.nx, ny: p.ny })),
      ball: { nx: ball.nx, ny: ball.ny },
    };
    recorder.addScene(frame);
  }

  function finishRecording() {
    if (recorder.scenes.length < 2) {
      alert("En az 2 sahne kaydedin");
      return;
    }
    navigate("/player", { state: { scenes: recorder.scenes, arrows } });
  }

  /* ---------------- Render ---------------- */
  return (
    <div className={styles.workspace}>
      {/* Left panel (Top team) */}
      <div className={styles.side}>
        <TeamPanel
          side="top"
          teamName={teams.top.name}
          color={teams.top.fill}
          onChangeTeamName={(v) => setTeamName("top", v)}
          onPickColor={(hex) => setTeamColor("top", hex)}
          formation={formTop}
          onChangeFormation={setFormTop}
          onApplyFormation={() => applyFormation("top", formTop)}
          players={players.filter((p) => p.team === "top").map(({ id, number, name }) => ({ id, number, name }))} 
          onAddPlayer={(num, nm) => addPlayer("top", num, nm)}
          onEditPlayer={editPlayer}
          onRemovePlayer={removePlayer}
        />
      </div>

      {/* Center: Record controls + Draw toolbar + Board */}
      <div className={styles.center}>
        <div className={styles.centerInner}>
          <RecordPanel
            onSaveScene={saveCurrentScene}
            onFinish={finishRecording}
            countLabel={`${recorder.scenes.length}/${MAX_SCENES}`}
          />

          <DrawToolbar
            mode={drawMode}
            setMode={setDrawMode}
            runCurved={runCurved}
            setRunCurved={setRunCurved}
            onClear={clearArrows}
            dock="top"            /* kayıt paneliyle çakışıyorsa "bottom" yap */
            offsetTop={64}        /* header/record panel yüksekliğine göre ayarla */
            usePortal={true}      /* stacking context sorunlarını yok et */
          />

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <button
              onClick={clearAllPlayers}
              style={{
                background: "rgba(239,68,68,0.2)",
                border: "1px solid rgba(239,68,68,0.4)",
                color: "#fca5a5",
                fontWeight: 600,
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              🚮 Komple Temizle (Top Hariç)
            </button>
          </div>

          <div className={styles.boardShell}>
            <Board
              players={players}
              ball={ball}
              teams={teams}
              onMovePlayer={onMovePlayer}
              onMoveBall={onMoveBall}
              arrows={arrows}
              onAddArrow={onAddArrow}
              drawMode={drawMode}
              runCurved={runCurved}
            />
          </div>
        </div>
      </div>

      {/* Right panel (Bottom team) */}
      <div className={styles.side}>
        <TeamPanel
          side="bottom"
          teamName={teams.bottom.name}
          color={teams.bottom.fill}
          onChangeTeamName={(v) => setTeamName("bottom", v)}
          onPickColor={(hex) => setTeamColor("bottom", hex)}
          formation={formBot}
          onChangeFormation={setFormBot}
          onApplyFormation={() => applyFormation("bottom", formBot)}
          players={players.filter((p) => p.team === "bottom").map(({ id, number, name }) => ({ id, number, name }))} 
          onAddPlayer={(num, nm) => addPlayer("bottom", num, nm)}
          onEditPlayer={editPlayer}
          onRemovePlayer={removePlayer}
        />
      </div>
    </div>
  );
}
