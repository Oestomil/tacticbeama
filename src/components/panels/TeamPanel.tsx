import { useMemo, useState, useRef, useEffect } from "react";
import type { FormationName } from "../../data/tactic";
import { FORMATION_LIST } from "../../data/tactic";
import styles from "./TeamPanel.module.css";

type PlayerLite = { id: string; number: number; name: string };
type Props = {
  side: "top" | "bottom";
  teamName: string;
  color: string;                // fill
  onChangeTeamName: (name: string) => void;
  onPickColor: (hex: string) => void;
  formation: FormationName;
  onChangeFormation: (f: FormationName) => void;
  onApplyFormation: () => void;

  players: PlayerLite[];
  onAddPlayer: (number: number, name: string) => void;
  onEditPlayer: (id: string, patch: Partial<PlayerLite>) => void;
  onRemovePlayer: (id: string) => void;
};

const PALETTE = [
  "#1f6feb", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4",
  "#e11d48", "#16a34a", "#22c55e", "#3b82f6", "#a855f7", "#f97316",
];

export default function TeamPanel({
  side, teamName, color, onChangeTeamName, onPickColor,
  formation, onChangeFormation, onApplyFormation,
  players, onAddPlayer, onEditPlayer, onRemovePlayer
}: Props) {
  const [tab, setTab] = useState<"tactic" | "players">("tactic");
  const [newNum, setNewNum] = useState<number>(9);
  const [newName, setNewName] = useState<string>("Yeni");

  const [openPalette, setOpenPalette] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);

  // Dış tıklama ile popover kapat
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!openPalette) return;
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpenPalette(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openPalette]);

  const title = useMemo(() => side === "top" ? "Takım 1" : "Takım 2", [side]);

  return (
    <div className={styles.panel}>

      {/* Üst header (sabit), popover referansı bu panel */}
      <div className={styles.header}>
        <input
          className={styles.teamName}
          value={teamName}
          onChange={(e) => onChangeTeamName(e.target.value)}
          aria-label={`${title} adı`}
          placeholder={title}
        />

        <button
          className={styles.colorTrigger}
          onClick={() => setOpenPalette((s) => !s)}
          title="Takım rengi"
        >
          <span className={styles.colorSwatch} style={{ background: color }} />
        </button>

        {openPalette && (
          <div className={styles.popover} ref={popRef}>
            <div className={styles.palette}>
              {PALETTE.map((c) => (
                <button
                  key={c}
                  className={styles.paletteDot}
                  style={{ background: c, outline: c === color ? "2px solid #fff" : "none" }}
                  onClick={() => { onPickColor(c); setOpenPalette(false); }}
                  title={c}
                />
              ))}
            </div>
            {/* Sistem renk seçicisi (fallback) */}
            <div style={{ marginTop: 8 }}>
              <input
                type="color"
                value={color}
                onChange={(e) => onPickColor(e.target.value)}
                style={{ width: "100%", height: 32, background: "transparent", border: "none" }}
                title="Özel renk seç"
              />
            </div>
          </div>
        )}
      </div>

      {/* Scroll’lanabilir içerik */}
      <div className={styles.scroll}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "tactic" ? styles.active : ""}`}
            onClick={() => setTab("tactic")}
          >
            Hazır Taktikler
          </button>
          <button
            className={`${styles.tab} ${tab === "players" ? styles.active : ""}`}
            onClick={() => setTab("players")}
          >
            Oyuncular
          </button>
        </div>

        {tab === "tactic" ? (
          <div className={styles.tactics}>

            <div className={styles.quickButtons}>
              {FORMATION_LIST.map((f) => (
                <button
                  key={"btn_"+f}
                  className={styles.quickBtn}
                  onClick={() => { onChangeFormation(f); onApplyFormation(); }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.playersTab}>
            <div className={styles.addRow}>
              <input
                type="number"
                className={styles.numInput}
                value={newNum}
                onChange={(e) => setNewNum(parseInt(e.target.value || "0", 10))}
                placeholder="No"
                min={0}
              />
              <input
                className={styles.nameInput}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ad"
              />
              <button
                className={styles.addBtn}
                onClick={() => {
                  if (!newName.trim()) return;
                  onAddPlayer(newNum, newName.trim());
                  setNewName("Yeni");
                }}
              >
                + Ekle
              </button>
            </div>

            <div className={styles.list}>
              {players.map((p) => (
                <div key={p.id} className={styles.row}>
                  <input
                    type="number"
                    className={styles.numInput}
                    value={p.number}
                    onChange={(e) => onEditPlayer(p.id, { number: parseInt(e.target.value || "0", 10) })}
                  />
                  <input
                    className={styles.nameInput}
                    value={p.name}
                    onChange={(e) => onEditPlayer(p.id, { name: e.target.value })}
                  />
                  <button className={styles.removeBtn} onClick={() => onRemovePlayer(p.id)}>Sil</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
