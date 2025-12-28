export default function HUD({ score, highScore }) {
  return (
    <aside className="hud" aria-live="polite">
      <div className="stat"><span className="label">Score</span><b>{score}</b></div>
      <div className="stat"><span className="label">Speed</span><b id="speed-readout">0</b></div>
      <div className="stat"><span className="label">High</span><b>{highScore}</b></div>
    </aside>
  );
}
