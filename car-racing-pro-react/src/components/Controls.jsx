export default function Controls({ gameState, setGameState, muted, setMuted }) {
  return (
    <nav className="controls" aria-label="Game controls">
      <button className="btn primary" onClick={() => setGameState("PLAYING")}>Start</button>
      <button
        className="btn"
        onClick={() => setGameState(gameState === "PAUSED" ? "PLAYING" : "PAUSED")}
      >
        {gameState === "PAUSED" ? "Resume" : "Pause"}
      </button>
      <button className="btn" onClick={() => setMuted((m) => !m)}>
        {muted ? "Unmute" : "Mute"}
      </button>
    </nav>
  );
}
