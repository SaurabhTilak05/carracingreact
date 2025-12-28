import { useEffect } from "react";
import { lanes, laneWidth } from "../utils/constants";
import { createAudioManager } from "../utils/audioManager";

export default function useGameEngine({
    canvasRef,
    gameState,
    setGameState,
    score,
    setScore,
    highScore,
    setHighScore,
    muted,
}) {
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Images
        const playerImg = new Image();
        playerImg.src = "/assets/images/player.png";
        const enemyImg1 = new Image();
        enemyImg1.src = "/assets/images/enemy_1.png";
        const enemyImg2 = new Image();
        enemyImg2.src = "/assets/images/enemy_2.png";
        const roadTile = new Image();
        roadTile.src = "/assets/images/road_tile.png";
        const nitroImg = new Image();
        nitroImg.src = "/assets/images/nitro.png";

        // Audio
        const audio = createAudioManager({
            engine: "/assets/audio/engine.mp3",
            crash: "/assets/audio/crash.wav",
            pickup: "/assets/audio/pickup.wav",
            click: "/assets/audio/click.wav",
            muted,
        });


        // Proportional car sizing
        const carW = canvas.width * 0.12;
         const carH = carW * 2;
        const enemyW = carW;
        const enemyH = carH;

        // State
        let enemies = [];
        let powerUps = [];
        let particles = [];
        let cameraShake = 0;
        let screenFlash = 0;
        let roadOffset = 0;
        let rafId = null;
        let running = true;

        const player = {
            x: lanes[1],
            y: canvas.height - carH - 30,
            w: carW,
            h: carH,
            lane: 1,
            baseSpeed: 5,
            speed: 5,
            nitro: 0,
            alive: true,
        };

        let difficulty = { spawnRate: 0.02, speedScale: 1, tick: 0 };

        function resetGame() {
            enemies = [];
            powerUps = [];
            particles = [];
            cameraShake = 0;
            screenFlash = 0;

            player.lane = 1;
            player.x = lanes[1];
            player.y = canvas.height - carH - 30;
            player.nitro = 0;
            player.speed = player.baseSpeed;
            player.alive = true;

            difficulty = { spawnRate: 0.02, speedScale: 1, tick: 0 };
            roadOffset = 0;
            setScore(0);
        }

        function spawnEnemy() {
            const laneIdx = Math.floor(Math.random() * lanes.length);
            const img = Math.random() < 0.5 ? enemyImg1 : enemyImg2;
            enemies.push({ x: lanes[laneIdx], y: -enemyH, w: enemyW, h: enemyH, img });
        }

        function spawnNitro() {
            const laneIdx = Math.floor(Math.random() * lanes.length);
            powerUps.push({
                x: lanes[laneIdx] + laneWidth / 2 - 20,
                y: -60,
                w: 40,
                h: 40,
                type: "nitro",
            });
        }

        function endGame() {
            cameraShake = 12;
            screenFlash = 0.5;
            player.alive = false;
            audio.playCrash();
            audio.pauseEngine();

            const newHigh = Math.max(highScore, score);
            setHighScore(newHigh);
            localStorage.setItem("high", String(newHigh));

            setGameState("GAMEOVER");
        }

        function startGame() {
            resetGame();
            audio.playEngine();
            setGameState("PLAYING");
        }

        // Update
        function update() {
            if (gameState !== "PLAYING") return;

            difficulty.tick++;
            if (difficulty.tick % 600 === 0) {
                difficulty.spawnRate = Math.min(difficulty.spawnRate + 0.005, 0.08);
                difficulty.speedScale = Math.min(difficulty.speedScale + 0.05, 1.8);
            }

            if (Math.random() < difficulty.spawnRate) spawnEnemy();
            if (Math.random() < 0.003) spawnNitro();

            if (player.nitro > 0) {
                player.speed = player.baseSpeed * 1.8;
                player.nitro--;
            } else {
                player.speed = player.baseSpeed * difficulty.speedScale;
            }

            roadOffset = (roadOffset + player.speed) % canvas.height;

            enemies.forEach((e) => (e.y += player.speed + 0.4 * difficulty.tick / 600));
            enemies = enemies.filter((e) => e.y < canvas.height + enemyH);

            powerUps.forEach((p) => (p.y += player.speed));
            powerUps = powerUps.filter((p) => p.y < canvas.height + 100);

            enemies.forEach((e) => {
                const hit =
                    e.x < player.x + player.w &&
                    e.x + e.w > player.x &&
                    e.y < player.y + player.h &&
                    e.y + e.h > player.y;
                if (hit && player.alive) endGame();
            });

            powerUps.forEach((p) => {
                const got =
                    p.x < player.x + player.w &&
                    p.x + p.w > player.x &&
                    p.y < player.y + player.h &&
                    p.y + p.h > player.y;
                if (got) {
                    player.nitro = Math.min(player.nitro + 90, 180);
                    audio.playPickup();
                    p.y = canvas.height + 100;
                    particles.push({ x: player.x + player.w / 2, y: player.y + player.h / 2, life: 20 });
                }
            });

            particles.forEach((pt) => { pt.life--; pt.y += 1.5; });
            particles = particles.filter((pt) => pt.life > 0);

            setScore((s) => s + 1);
        }

        // Draw
        function drawRoad() {
            const roadX = 40, roadW = 320;
            const tileH = roadTile.height || 256;
            const offset = roadOffset % tileH;

            for (let y = -tileH; y < canvas.height + tileH; y += tileH) {
                ctx.drawImage(roadTile, roadX, y + offset, roadW, tileH);
            }

            ctx.strokeStyle = "rgba(255,255,255,0.25)";
            ctx.lineWidth = 2;
            [roadX + laneWidth, roadX + laneWidth * 2].forEach((x) => {
                ctx.setLineDash([12, 14]);
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
                ctx.setLineDash([]);
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (cameraShake > 0) {
                ctx.save();
                ctx.translate((Math.random() - 0.5) * cameraShake, (Math.random() - 0.5) * cameraShake);
                cameraShake *= 0.9;
            }

            drawRoad();

            ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
            enemies.forEach((e) => ctx.drawImage(e.img, e.x, e.y, e.w, e.h));
            powerUps.forEach((p) => ctx.drawImage(nitroImg, p.x, p.y, p.w, p.h));

            particles.forEach((pt) => {
                ctx.fillStyle = `rgba(255,200,0,${pt.life / 20})`;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 10 * (pt.life / 20), 0, Math.PI * 2);
                ctx.fill();
            });

            if (screenFlash > 0) {
                ctx.fillStyle = `rgba(255,255,255,${screenFlash})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                screenFlash -= 0.05;
            }

            if (cameraShake > 0) ctx.restore();
        }

        function loop() {
            if (!running) return;
            update();
            draw();

            const speedEl = document.getElementById("speed-readout");
            if (speedEl) speedEl.textContent = Math.round(player.speed * 20);

            rafId = requestAnimationFrame(loop);
        }

        // Input
        function applyLane() { player.x = lanes[player.lane]; }
        function onKeyDown(e) {
            if (e.key === "ArrowLeft" && player.lane > 0) { player.lane--; applyLane(); }
            if (e.key === "ArrowRight" && player.lane < 2) { player.lane++; applyLane(); }
            if (e.key === " ") { player.nitro = Math.min(player.nitro + 90, 180); }
            if (e.key.toLowerCase() === "p") {
                if (gameState === "PLAYING") {
                    audio.pauseEngine();
                    setGameState("PAUSED");
                } else if (gameState === "PAUSED") {
                    audio.playEngine();
                    setGameState("PLAYING");
                }
            }
        }

        let touchStartX = null;
        function onTouchStart(e) { touchStartX = e.changedTouches[0].clientX; }
        function onTouchEnd(e) {
            if (touchStartX === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (dx < -30 && player.lane > 0) { player.lane--; applyLane(); }
            else if (dx > 30 && player.lane < 2) { player.lane++; applyLane(); }
            else { player.nitro = Math.min(player.nitro + 90, 180); }
            touchStartX = null;
        }

        function onBtnLeft() { if (player.lane > 0) { player.lane--; applyLane(); } }
        function onBtnRight() { if (player.lane < 2) { player.lane++; applyLane(); } }
        function onBtnNitro() { player.nitro = Math.min(player.nitro + 90, 180); }

        function onVisibility() {
            if (document.hidden && gameState === "PLAYING") {
                audio.pauseEngine();
                setGameState("PAUSED");
            } else if (!document.hidden && gameState === "PAUSED") {
                audio.playEngine();
            }
        }

        // Start/Resume
        if (gameState === "PLAYING") {
            if (!audio.isEnginePlaying()) audio.playEngine();
            if (rafId === null) loop();
        } else {
            audio.pauseEngine();
        }

        // Start new game when entering PLAYING from MENU/GAMEOVER
        if (gameState === "PLAYING" && score === 0) startGame();

        // Listeners
        window.addEventListener("keydown", onKeyDown);
        canvas.addEventListener("touchstart", onTouchStart, { passive: true });
        canvas.addEventListener("touchend", onTouchEnd, { passive: true });

        const btnLeft = document.getElementById("btnLeft");
        const btnRight = document.getElementById("btnRight");
        const btnNitro = document.getElementById("btnNitro");
        btnLeft && btnLeft.addEventListener("click", onBtnLeft);
        btnRight && btnRight.addEventListener("click", onBtnRight);
        btnNitro && btnNitro.addEventListener("click", onBtnNitro);

        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener("keydown", onKeyDown);
            canvas.removeEventListener("touchstart", onTouchStart);
            canvas.removeEventListener("touchend", onTouchEnd);
            btnLeft && btnLeft.removeEventListener("click", onBtnLeft);
            btnRight && btnRight.removeEventListener("click", onBtnRight);
            btnNitro && btnNitro.removeEventListener("click", onBtnNitro);
            document.removeEventListener("visibilitychange", onVisibility);
            audio.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, muted]);
}
