// src/utils/audioManager.js
export function createAudioManager({ engine, crash, pickup }) {
  const engineAudio = new Audio(engine);
  engineAudio.loop = true;
  engineAudio.volume = 0.6;
  engineAudio.preload = "auto";

  const crashAudio = new Audio(crash);
  crashAudio.volume = 1.0;

  const pickupAudio = new Audio(pickup);
  pickupAudio.volume = 0.8;

  // 🔥 expose engine audio globally so Start button can play it
  window.__engineAudio = engineAudio;

  return {
    playEngine() {
      engineAudio.currentTime = 0;
      return engineAudio.play();
    },

    pauseEngine() {
      engineAudio.pause();
    },

    playCrash() {
      engineAudio.pause();
      crashAudio.currentTime = 0;
      crashAudio.play();
    },

    playPickup() {
      pickupAudio.currentTime = 0;
      pickupAudio.play();
    },

    dispose() {
      engineAudio.pause();
      delete window.__engineAudio;
    },
  };
}
