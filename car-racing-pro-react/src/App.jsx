import { useState } from "react";
import GameCanvas from "./components/GameCanvas";
import HUD from "./components/HUD";
import Overlay from "./components/Overlay";
import Controls from "./components/Controls";
import MobileControls from "./components/MobileControls";
import "./styles/App.css";
export default function App() {
  const [gameState, setGameState] = useState("MENU"); // MENU | PLAYING | PAUSED | GAMEOVER
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(Number(localStorage.getItem("high") || 0));
  const [muted, setMuted] = useState(false);

  return (
    <div className="app">
      <header className="topbar" role="banner">
        <div className="brand">
          <img src="/assets/images/player.png" alt="" className="brand-icon" aria-hidden="true" />
          <h1 className="brand-title">Car Racing Pro</h1>
        </div>
        <Controls
          gameState={gameState}
          setGameState={setGameState}
          muted={muted}
          setMuted={setMuted}
        />
      </header>

      <main className="game-wrap" role="main">
        <section className="canvas-wrap">
          <GameCanvas
            gameState={gameState}
            setGameState={setGameState}
            score={score}
            setScore={setScore}
            highScore={highScore}
            setHighScore={setHighScore}
            muted={muted}
          />
          <MobileControls />
        </section>

        <HUD score={score} highScore={highScore} />

        {gameState !== "PLAYING" && (
          <Overlay
            gameState={gameState}
            score={score}
            highScore={highScore}
            onStart={() => setGameState("PLAYING")}
            onToggleSound={() => setMuted((m) => !m)}
          />
        )}
      </main>

      <footer className="footer" role="contentinfo">
        <p>© Car Racing Pro — React edition</p>
      </footer>
    </div>
  );
}
