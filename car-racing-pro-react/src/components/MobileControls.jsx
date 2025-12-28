export default function MobileControls() {
  // Buttons are visual; input handled in engine via element IDs
  return (
    <div className="mobile-controls" aria-hidden="false">
      <button id="btnLeft" className="ctrl ctrl-left" aria-label="Move left">◀</button>
      <button id="btnNitro" className="ctrl ctrl-nitro" aria-label="Nitro boost">⚡</button>
      <button id="btnRight" className="ctrl ctrl-right" aria-label="Move right">▶</button>
    </div>
  );
}
