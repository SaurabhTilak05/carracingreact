export function createAudioManager(paths) {
  const ASSET_BASE = import.meta.env.BASE_URL || "/";

  const engine = new Audio(paths.engine.startsWith("http") ? paths.engine : `${ASSET_BASE}${paths.engine.replace(/^\/+/, "")}`);
  engine.loop = true;
  engine.volume = 0.5;

  const crash = new Audio(paths.crash.startsWith("http") ? paths.crash : `${ASSET_BASE}${paths.crash.replace(/^\/+/, "")}`);
  const pickup = new Audio(paths.pickup.startsWith("http") ? paths.pickup : `${ASSET_BASE}${paths.pickup.replace(/^\/+/, "")}`);
  const click = new Audio(paths.click.startsWith("http") ? paths.click : `${ASSET_BASE}${paths.click.replace(/^\/+/, "")}`);

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
