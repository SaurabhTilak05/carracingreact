import React, { useRef, useEffect } from "react";
import useGameEngine from "../hooks/useGameEngine";
import "../styles/GameCanvas.css";

export default function GameCanvas({
  gameState,
  setGameState,
  score,
  setScore,
  highScore,
  setHighScore,
  muted,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const width = Math.min(rect.width, 480);
      const height = Math.round((width / 400) * 700);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    window.addEventListener("orientationchange", resize);
    return () => { ro.disconnect(); window.removeEventListener("orientationchange", resize); };
  }, []);

  useGameEngine({
    canvasRef,
    gameState,
    setGameState,
    score,
    setScore,
    highScore,
    setHighScore,
    muted,
  });

  return (
    <div className="game-wrapper">
      <div className="game-container" ref={containerRef}>
        <canvas ref={canvasRef} id="gameCanvas" />
      </div>

      <div className="controls-row">
        <button id="btnLeft" className="control-btn">◀</button>
        <button id="startBtn" className="primary-btn">Start</button>
        <button id="btnRight" className="control-btn">▶</button>
        <button id="btnNitro" className="control-btn">Nitro</button>
      </div>
    </div>
  );
}
