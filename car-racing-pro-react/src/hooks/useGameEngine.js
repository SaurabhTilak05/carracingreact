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

    // Determine if we should be playing immediately (game started)
    if (gameState === "PLAYING" && musicOn) {
      audio.playEngine().catch(() => { });
    }


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

    // Dynamic dimensions
    const MAX_ROAD_WIDTH = 480;
    const roadW = () => Math.min(W(), MAX_ROAD_WIDTH);
    const roadMargin = () => (W() - roadW()) / 2;

    const laneCount = 3;
    const laneW = () => roadW() / laneCount;

    // Cap car width relative to lane
    const carW = () => laneW() * 0.5;
    const carH = () => carW() * 2;
    const playerY = () => {
      // Mobile controls take up space at bottom, lift car up
      const bottomMargin = W() < 900 ? 160 : 30;
      return H() - carH() - bottomMargin;
    };

    function laneX(lane) {
      // lane is 0, 1, 2
      // x = margin + (lane * laneW) + (laneW/2) - (carW/2)
      return roadMargin() + (lane * laneW()) + (laneW() / 2) - (carW() / 2);
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
        lane: Math.floor(Math.random() * laneCount),
        y: -140,
        img: Math.random() < 0.5 ? enemy1 : enemy2,
      });
    }

    function spawnNitro() {
      nitros.push({
        lane: Math.floor(Math.random() * laneCount),
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
      if (t < laneCount && canChangeToLane(t)) playerRef.current.lane = t;
    }

    function onKeyDown(e) {
      if (e.key === "ArrowLeft") moveLeft();
      if (e.key === "ArrowRight") moveRight();
    }

    // Touch Handling (Swipe)
    let touchStartX = 0;

    function onTouchStart(e) {
      touchStartX = e.touches[0].clientX;
    }

    function onTouchEnd(e) {
      if (gameState !== "PLAYING") return;
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      const threshold = 30; // Minimum distance for swipe

      if (Math.abs(diff) > threshold) {
        if (diff > 0) moveRight();
        else moveLeft();
      }
    }

    document.addEventListener("game-left", moveLeft);
    document.addEventListener("game-right", moveRight);
    document.addEventListener("game-start", startGame);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);

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
      const margin = roadMargin();
      const rW = roadW();

      // Draw road texture tiled
      for (let y = -tileH; y < H(); y += tileH) {
        ctx.drawImage(road, margin, y + roadOffset, rW, tileH);
      }

      // Draw lane markers
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 2;

      // Calculate lane dividers
      // Lane 1 start = margin + laneW
      // Lane 2 start = margin + 2*laneW
      const lW = laneW();

      [margin + lW, margin + 2 * lW].forEach((x) => {
        ctx.setLineDash([12, 14]);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H());
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    function draw() {
      // Draw Background (Striped Grass)
      ctx.fillStyle = "#0a2a0a"; // Dark base
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grass stripes
      const stripeH = 100;
      ctx.fillStyle = "#0f3f0f"; // Lighter grass
      for (let y = -stripeH; y < H(); y += stripeH * 2) {
        ctx.fillRect(0, y + (roadOffset % (stripeH * 2)), canvas.width, stripeH);
      }

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
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);

      delete window.__START_ENGINE_SOUND__;
      audio.dispose?.();
    };
  }, [canvasRef, gameState, muted]);
}
