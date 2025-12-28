// src/hooks/useGameEngine.js
import { useEffect, useRef } from "react";
import { lanes, laneWidth } from "../utils/constants";
import { createAudioManager } from "../utils/audioManager";

const SAFE_LANE_DISTANCE = 30;
const COLLISION_PADDING = 18;

export default function useGameEngine({
  canvasRef,
  gameState,
  setGameState,
  score,
  setScore,
  highScore,
  setHighScore,
  musicOn,
  muted,
}) {
  const playerRef = useRef(null);
  const runningRef = useRef(false);
  const rafRef = useRef(null);
  const audioUnlockedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!musicOn) {
      audio.pauseEngine?.();
    }

    const BASE = import.meta.env.BASE_URL || "/";

    /* ================= ASSETS ================= */
    const playerImg = new Image();
    const enemy1 = new Image();
    const enemy2 = new Image();
    const road = new Image();
    const nitroImg = new Image();

    playerImg.src = `${BASE}assets/images/player.png`;
    enemy1.src = `${BASE}assets/images/enemy_1.png`;
    enemy2.src = `${BASE}assets/images/enemy_2.png`;
    road.src = `${BASE}assets/images/road_tile.png`;
    nitroImg.src = `${BASE}assets/images/nitro.png`;

    /* ================= AUDIO ================= */
   const audio = createAudioManager({
  engine: "assets/audio/engine.mp3",
  crash: "assets/audio/crash.wav",
  pickup: "assets/audio/pickup.wav",
});


    // 🔊 EXPOSE AUDIO START (REAL USER GESTURE REQUIRED)
    // expose engine start for real user gesture
    window.__START_ENGINE_SOUND__ = () => {
      if (audioUnlockedRef.current) return;
      audioUnlockedRef.current = true;
      audio.playEngine().catch(() => { });
    };


    /* ================= HELPERS ================= */
    const dpr = () => window.devicePixelRatio || 1;
    const W = () => canvas.width / dpr();
    const H = () => canvas.height / dpr();

    const carW = () => W() * 0.12;
    const carH = () => carW() * 2;
    const playerY = () => H() - carH() - 30;

    function laneX(lane) {
      return lanes[lane] - carW() / 2;
    }

    /* ================= GAME STATE ================= */
    let enemies = [];
    let nitros = [];
    let roadOffset = 0;

    playerRef.current = {
      lane: 1,
      speed: 5,
      baseSpeed: 5,
      nitro: 0,
      alive: true,
    };

    function resetGame() {
      enemies = [];
      nitros = [];
      roadOffset = 0;
      playerRef.current.lane = 1;
      playerRef.current.nitro = 0;
      playerRef.current.alive = true;
      setScore(0);
    }

    function startGame() {
      resetGame();
      if (musicOn) audio.playEngine?.();
      setGameState("PLAYING");
    }

    function endGame() {
      if (!playerRef.current.alive) return;

      playerRef.current.alive = false;

      audio.playCrash();   // 🔊 crash sound now works

      setHighScore(Math.max(highScore || 0, score || 0));
      setGameState("GAMEOVER");
    }


    function spawnEnemy() {
      enemies.push({
        lane: Math.floor(Math.random() * lanes.length),
        y: -140,
        img: Math.random() < 0.5 ? enemy1 : enemy2,
      });
    }

    function spawnNitro() {
      nitros.push({
        lane: Math.floor(Math.random() * lanes.length),
        y: -100,
      });
    }

    /* ================= SAFE LANE CHECK ================= */
    function canChangeToLane(targetLane) {
      return !enemies.some(
        (e) =>
          e.lane === targetLane &&
          Math.abs(e.y - playerY()) < SAFE_LANE_DISTANCE
      );
    }

    /* ================= INPUT ================= */
    function moveLeft() {
      if (gameState !== "PLAYING") return;
      const t = playerRef.current.lane - 1;
      if (t >= 0 && canChangeToLane(t)) playerRef.current.lane = t;
    }

    function moveRight() {
      if (gameState !== "PLAYING") return;
      const t = playerRef.current.lane + 1;
      if (t < lanes.length && canChangeToLane(t)) playerRef.current.lane = t;
    }

    function onKeyDown(e) {
      if (e.key === "ArrowLeft") moveLeft();
      if (e.key === "ArrowRight") moveRight();
    }

    document.addEventListener("game-left", moveLeft);
    document.addEventListener("game-right", moveRight);
    document.addEventListener("game-start", startGame);
    window.addEventListener("keydown", onKeyDown);

    /* ================= UPDATE ================= */
    function update() {
      if (gameState !== "PLAYING") return;

      if (Math.random() < 0.02) spawnEnemy();
      if (Math.random() < 0.005) spawnNitro();

      // Nitro speed boost
      if (playerRef.current.nitro > 0) {
        playerRef.current.speed = playerRef.current.baseSpeed * 1.7;
        playerRef.current.nitro--;
      } else {
        playerRef.current.speed = playerRef.current.baseSpeed;
      }

      enemies.forEach((e) => (e.y += playerRef.current.speed));
      enemies = enemies.filter((e) => e.y < H() + 200);

      nitros.forEach((n) => (n.y += playerRef.current.speed));
      nitros = nitros.filter((n) => n.y < H() + 100);

      // Enemy collision
      enemies.forEach((e) => {
        const enemyBottom = e.y + carH() - COLLISION_PADDING;
        const playerTop = playerY() + COLLISION_PADDING;

        if (
          e.lane === playerRef.current.lane &&
          enemyBottom > playerTop &&
          e.y < playerTop + carH() - COLLISION_PADDING
        ) {
          endGame();
        }
      });

      // Nitro pickup
      nitros.forEach((n) => {
        if (
          n.lane === playerRef.current.lane &&
          n.y + 40 > playerY() &&
          n.y < playerY() + carH()
        ) {
          playerRef.current.nitro = Math.min(
            playerRef.current.nitro + 120,
            240
          );
          audio.playPickup?.();
          n.y = H() + 200;
        }
      });

      roadOffset = (roadOffset + playerRef.current.speed) % H();
      setScore((s) => s + 1);
    }

    /* ================= DRAW ================= */
    function drawRoad() {
      const tileH = road.height || 256;
      for (let y = -tileH; y < H(); y += tileH) {
        ctx.drawImage(road, 40, y + roadOffset, W() - 80, tileH);
      }

      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 2;
      [laneWidth + 40, laneWidth * 2 + 40].forEach((x) => {
        ctx.setLineDash([12, 14]);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H());
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawRoad();

      ctx.drawImage(
        playerImg,
        laneX(playerRef.current.lane),
        playerY(),
        carW(),
        carH()
      );

      enemies.forEach((e) =>
        ctx.drawImage(e.img, laneX(e.lane), e.y, carW(), carH())
      );

      nitros.forEach((n) =>
        ctx.drawImage(nitroImg, laneX(n.lane), n.y, 40, 40)
      );
    }

    /* ================= LOOP ================= */
    function loop() {
      if (!runningRef.current) return;
      update();
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }

    if (gameState === "PLAYING" && !runningRef.current) {
      runningRef.current = true;
      loop();
    }

    if (gameState !== "PLAYING") {
      runningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }

    /* ================= CLEANUP ================= */
    return () => {
      runningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      document.removeEventListener("game-left", moveLeft);
      document.removeEventListener("game-right", moveRight);
      document.removeEventListener("game-start", startGame);
      window.removeEventListener("keydown", onKeyDown);

      delete window.__START_ENGINE_SOUND__;
      audio.dispose?.();
    };
  }, [canvasRef, gameState, muted]);
}
