// src/components/GameCanvas.jsx
import React, { useRef, useEffect } from "react";
import useGameEngine from "../hooks/useGameEngine";
import Overlay from "./Overlay";
import "../styles/GameCanvas.css";

export default function GameCanvas({
  gameState,
  setGameState,
  score,
  highScore,
  ...rest
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = Math.min(container.clientWidth, 480);
      const height = (width / 400) * 700;

      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useGameEngine({
    canvasRef,
    gameState,
    setGameState,
    score,
    highScore,
    ...rest,
  });

 return (
  <div className="game-wrapper">
    <div className="game-container" ref={containerRef}>
      <canvas ref={canvasRef} />

      {/* 🔥 OVERLAY (START / GAME OVER) */}
      <Overlay
        gameState={gameState}
        score={score}
        highScore={highScore}
        onStart={() => {
          // start engine sound (browser-safe)
          window.__engineAudio?.play().catch(() => {});
          setGameState("PLAYING");
        }}
      />

      {/* 🔥 MOBILE CONTROLS (LEFT / RIGHT) */}
      <div className="controls-overlay">
        <button
          className="control-btn"
          onPointerDown={() =>
            document.dispatchEvent(new Event("game-left"))
          }
        >
          ◀
        </button>

        <button
          className="control-btn"
          onPointerDown={() =>
            document.dispatchEvent(new Event("game-right"))
          }
        >
          ▶
        </button>
      </div>
    </div>
  </div>
);

}
