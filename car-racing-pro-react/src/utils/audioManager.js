export function createAudioManager(paths) {
  const engine = new Audio(paths.engine);
  engine.loop = true;
  engine.volume = 0.5;

  const crash = new Audio(paths.crash);
  const pickup = new Audio(paths.pickup);
  const click = new Audio(paths.click);

  const audios = [engine, crash, pickup, click];
  audios.forEach((a) => (a.muted = !!paths.muted));

  return {
    playEngine() { engine.play().catch(() => {}); },
    pauseEngine() { engine.pause(); },
    isEnginePlaying() { return !engine.paused; },
    playCrash() { crash.currentTime = 0; crash.play().catch(() => {}); },
    playPickup() { pickup.currentTime = 0; pickup.play().catch(() => {}); },
    playClick() { click.currentTime = 0; click.play().catch(() => {}); },
    setMuted(flag) { audios.forEach((a) => (a.muted = !!flag)); },
    dispose() { this.pauseEngine(); },
  };
}
