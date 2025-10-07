// src/components/RecordPanel.tsx
import { useRecorder } from "../recording/SceneRecorderContext";
import styles from "./RecordPanel.module.css";

type Props = {
  onSaveScene: () => void;
  onFinish: () => void;
};

export default function RecordPanel({ onSaveScene, onFinish }: Props) {
  const { scenes, maxScenes, clearScenes, removeLast } = useRecorder();
  const disabled = scenes.length >= maxScenes;

  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <div className={styles.counter}>
          Sahneler: <strong>{scenes.length}</strong> / {maxScenes}
        </div>
      </div>

      <div className={styles.right}>
        <button
          className={styles.btnGhost}
          onClick={removeLast}
          disabled={scenes.length === 0}
          title="Son sahneyi sil"
        >
          Geri Al
        </button>
        <button
          className={styles.btnGhost}
          onClick={clearScenes}
          disabled={scenes.length === 0}
          title="Tüm sahneleri temizle"
        >
          Temizle
        </button>
        <button
          className={styles.btnPrimary}
          onClick={onSaveScene}
          disabled={disabled}
          title="Anlık konumları sahne olarak kaydet"
        >
          Sahne Kaydet
        </button>
        <button
          className={styles.btnAccent}
          onClick={onFinish}
          disabled={scenes.length < 2}
          title="Bitir ve oynatıcıya geç"
        >
          Bitir
        </button>
      </div>
    </div>
  );
}
