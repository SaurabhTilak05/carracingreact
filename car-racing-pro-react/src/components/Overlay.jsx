export default function Overlay({ gameState, score, highScore, onStart, onToggleSound }) {
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

        <div className="overlay-actions">
          <button className="btn primary" onClick={onStart}>Start</button>
          <button className="btn ghost" onClick={onToggleSound}>Toggle Sound</button>
        </div>

        <div className="help">
          <h3>How to play</h3>
          <ul>
            <li><b>Desktop:</b> Arrow keys to change lanes, Space for nitro, P to pause</li>
            <li><b>Mobile:</b> Tap ◀ ▶ for lanes, ⚡ for nitro; swipe also works</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
