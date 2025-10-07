// src/components/Header.tsx
import styles from "./Header.module.css";
import TacticbeamLogo from "./TacticbeamLogo";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <TacticbeamLogo height={54} neon />
      </div>
    </header>
  );
}
