import { useState } from "react";
import GameCanvas from "./components/GameCanvas";
import HUD from "./components/HUD";
import Overlay from "./components/Overlay";
import MobileControls from "./components/MobileControls";
import "./styles/App.css";

export default function App() {
  const [gameState, setGameState] = useState("MENU"); // MENU | PLAYING | GAMEOVER
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("high") || 0)
  );

  // 🔊 Engine music toggle
  const [musicOn, setMusicOn] = useState(true);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img
            src="assets/images/player.png"
            alt=""
            className="brand-icon"
          />
          <h1 className="brand-title">Car Racing Pro</h1>
        </div>

        {/* 🔊 MUSIC TOGGLE */}
        <button
          className="music-btn"
          onClick={() => {
            setMusicOn((m) => !m);

            if (window.__engineAudio) {
              if (musicOn) {
                window.__engineAudio.pause();
              } else {
                window.__engineAudio.play().catch(() => {});
              }
            }
          }}
        >
          {musicOn ? "🔊 Music On" : "🔇 Music Off"}
        </button>
      </header>

      <main className="game-wrap">
        <section className="canvas-wrap">
          <GameCanvas
            gameState={gameState}
            setGameState={setGameState}
            score={score}
            setScore={setScore}
            highScore={highScore}
            setHighScore={setHighScore}
            musicOn={musicOn}
          />

          <MobileControls />
        </section>

        <HUD score={score} highScore={highScore} />

        {gameState !== "PLAYING" && (
          <Overlay
            gameState={gameState}
            score={score}
            highScore={highScore}
            onStart={() => {
              // 🔥 Start engine sound safely
              window.__engineAudio?.play().catch(() => {});
              setGameState("PLAYING");
            }}
          />
        )}
      </main>

      <footer className="footer">
        <p>© Car Racing Pro — React edition</p>
      </footer>
    </div>
  );
}
