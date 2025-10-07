// src/App.tsx
import "./index.css";
import styles from "./App.module.css";
import Header from "./components/Header";
import Workspace from "./components/Workspace";
import { SceneRecorderProvider } from "./recording/SceneRecorderContext";

export default function App() {
  return (
    <div className={styles.appWrap}>
      <Header />
      <div className={styles.main}>
        <SceneRecorderProvider max={10}>
          <Workspace />
        </SceneRecorderProvider>
      </div>
    </div>
  );
}
