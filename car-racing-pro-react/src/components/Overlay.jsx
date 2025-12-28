// src/components/Overlay.jsx
export default function Overlay({ gameState, score, highScore, onStart }) {
  if (gameState === "PLAYING") return null;

  const isGameOver = gameState === "GAMEOVER";

  return (
    <div className="overlay">
      <div className="panel">
        <h2>{isGameOver ? "Game Over" : "Car Racing Pro"}</h2>

        <p>
          {isGameOver
            ? `Score: ${score} — High: ${highScore}`
            : "Avoid traffic, collect nitro, and chase high scores."}
        </p>

        <button
          className="btn primary"
          onPointerDown={() => {
            // 🔊 START MUSIC IMMEDIATELY
            if (window.__engineAudio) {
              window.__engineAudio.currentTime = 0;
              window.__engineAudio.play().catch(() => {});
            }
            onStart(); // start game
          }}
        >
          {isGameOver ? "Restart" : "Start"}
        </button>
      </div>
    </div>
  );
}
