// src/components/DrawToolbar.tsx
import styles from "./DrawToolbar.module.css";
import type { DrawMode } from "../types/draw";

type Dock = "auto" | "top" | "bottom";

type Props = {
  mode: DrawMode;
  setMode: (m: DrawMode) => void;
  runCurved: boolean;
  setRunCurved: (v: boolean) => void;
  onClear?: () => void;

  /** Yeni: mobilde konumlandırma kontrolü */
  dock?: Dock;            // "auto" (default), "top", "bottom"
  offsetTop?: number;     // px cinsinden; header/recording panel yüksekliği
  offsetBottom?: number;  // px cinsinden; alttaki panel yüksekliği
};

export default function DrawToolbar({
  mode, setMode, runCurved, setRunCurved, onClear,
  dock = "auto", offsetTop = 64, offsetBottom = 0
}: Props) {
  const isPass = mode === "pass";
  const isRun  = mode === "run";

  // Mobil için konum sınıfı
  const mobileDockClass =
    dock === "top" ? styles.isTopMobile :
    dock === "bottom" ? styles.isBottomMobile :
    styles.isAutoMobile;

  return (
    <div
      className={`${styles.toolbar} ${mobileDockClass}`}
      role="region"
      aria-label="Çizim araçları"
      // offset’leri CSS değişkeni ile ilet (mobil media query’lerinde kullanıyoruz)
      style={
        { 
          // üstte sabitlemek istersen: header/recording panel yüksekliği kadar it
          // (sadece mobilde etkin)
          ["--offset-top" as any]: `${offsetTop}px`,
          ["--offset-bottom" as any]: `${offsetBottom}px`,
        } as React.CSSProperties
      }
    >
      <div className={styles.row}>
        <div className={styles.group} role="group" aria-label="Ok çizim modları">
          <button
            type="button"
            className={styles.btn}
            aria-pressed={isPass}
            onClick={() => setMode(isPass ? "none" : "pass")}
            title="Pas oku: düz & kesikli"
          >
            ➜ Pas
          </button>

          <button
            type="button"
            className={styles.btn}
            aria-pressed={isRun}
            onClick={() => setMode(isRun ? "none" : "run")}
            title="Koşu oku: düz/ya da kıvrımlı"
          >
            ➜ Koşu
          </button>

          <label className={styles.toggle} title="Koşu okunu kıvrımlı yap">
            <input
              type="checkbox"
              checked={runCurved}
              onChange={(e) => setRunCurved(e.target.checked)}
            />
            <span>Kıvrımlı</span>
          </label>
        </div>

        <div className={styles.group} role="group" aria-label="Yardımcı işlemler">
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => setMode("none")}
            title="Modu kapat"
          >
            Modu Kapat
          </button>

          {onClear && (
            <button
              type="button"
              className={styles.btnGhost}
              onClick={onClear}
              title="Tüm okları sil"
            >
              Temizle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
