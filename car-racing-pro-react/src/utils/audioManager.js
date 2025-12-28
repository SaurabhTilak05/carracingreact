export function createAudioManager(paths) {
  const ASSET_BASE = import.meta.env.BASE_URL || "/";

  function makeUrl(path) {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    return `${ASSET_BASE}${path.replace(/^\/+/, "")}`;
  }

  const engine = new Audio(makeUrl(paths.engine));
  engine.loop = true;
  engine.volume = 0.5;

  const crash = new Audio(makeUrl(paths.crash));
  const pickup = new Audio(makeUrl(paths.pickup));
  const click = new Audio(makeUrl(paths.click));

  const audios = [engine, crash, pickup, click];
  audios.forEach((a) => (a.muted = !!paths.muted));

  return {
    async playEngine() {
      try { await engine.play(); } catch (e) {}
    },
    pauseEngine() { try { engine.pause(); } catch (e) {} },
    isEnginePlaying() { return !engine.paused; },
    playCrash() { try { crash.currentTime = 0; crash.play().catch(()=>{}); } catch(e){} },
    playPickup() { try { pickup.currentTime = 0; pickup.play().catch(()=>{}); } catch(e){} },
    playClick() { try { click.currentTime = 0; click.play().catch(()=>{}); } catch(e){} },
    setMuted(flag) { audios.forEach((a) => (a.muted = !!flag)); },
    dispose() { try { engine.pause(); } catch (e) {} },
  };
}
