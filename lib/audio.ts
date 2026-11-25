let el: HTMLAudioElement | null = null;
let ready = false;
const subs = new Set<() => void>();

function markReady() {
  if (ready) return;
  ready = true;
  subs.forEach((fn) => fn());
}

export function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!el) {
    const a = new Audio("/audio/jingle.m4a");
    a.loop = true;
    a.preload = "auto";
    a.volume = 0;
    a.addEventListener("loadeddata", markReady, { once: true });
    a.addEventListener("canplay", markReady, { once: true });
    a.addEventListener("canplaythrough", markReady, { once: true });
    a.load();
    el = a;
    (window as unknown as { __jingle?: HTMLAudioElement }).__jingle = a;
  }
  return el;
}

export function audioReady() {
  return ready;
}

export function onAudioReady(fn: () => void) {
  if (ready) {
    fn();
    return () => {};
  }
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}
