import { useRef } from "react";
import useGameEngine from "../hooks/useGameEngine";

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

return <canvas ref={canvasRef} width={400} height={700} />;

}
