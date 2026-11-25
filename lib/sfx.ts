let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export function unlock() {
  const ac = context();
  if (ac && ac.state === "suspended") ac.resume().catch(() => {});
}

export function tick(freq = 1400, volume = 0.16) {
  if (localStorage.getItem("jingle") === "off") return;
  const ac = context();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});
  if (ac.state !== "running") return;

  const t = ac.currentTime;

  const len = Math.ceil(ac.sampleRate * 0.045);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const env = Math.pow(1 - i / len, 9);
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  const band = ac.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = freq * 1.9;
  band.Q.value = 1.1;
  const clickGain = ac.createGain();
  clickGain.gain.value = volume;
  src.connect(band).connect(clickGain).connect(ac.destination);
  src.start(t);

  const osc = ac.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.55, t + 0.05);
  const oscGain = ac.createGain();
  oscGain.gain.setValueAtTime(0.0001, t);
  oscGain.gain.linearRampToValueAtTime(volume * 0.55, t + 0.004);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  osc.connect(oscGain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.07);
}
