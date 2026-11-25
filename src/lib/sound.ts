/* Sonidos hechos en el navegador con Web Audio: nada se descarga.
   Solo suenan después de que la persona toca algo (así lo exigen los navegadores). */

let enabled = true;
let ctx: AudioContext | null = null;
let noiseBuf: AudioBuffer | null = null;
let music: { master: GainNode; iv: ReturnType<typeof setInterval> } | null = null;

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (!on) stopMusic();
}

function audio(): AudioContext | null {
  if (!enabled) return null;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx || new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function osc(a: AudioContext, out: AudioNode, f: number, t: number, d: number, type: OscillatorType, vol: number) {
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g);
  g.connect(out);
  o.start(t);
  o.stop(t + d + 0.05);
}

function noise(a: AudioContext, out: AudioNode, t: number, d: number, vol: number, freq: number, q: number, to?: number) {
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
    const c = noiseBuf.getChannelData(0);
    for (let i = 0; i < c.length; i++) c[i] = Math.random() * 2 - 1;
  }
  const s = a.createBufferSource();
  s.buffer = noiseBuf;
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(freq, t);
  if (to) f.frequency.exponentialRampToValueAtTime(to, t + d);
  f.Q.value = q;
  const g = a.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + Math.min(0.03, d * 0.3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(f);
  f.connect(g);
  g.connect(out);
  s.start(t, Math.random() * 0.4);
  s.stop(t + d + 0.05);
}

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
function play(fn: (a: AudioContext, out: AudioNode, t: number) => void) {
  const a = audio();
  if (a) try { fn(a, a.destination, a.currentTime + 0.01); } catch { /* sin audio */ }
}

export const SFX = {
  /** Roce del lazo al soltarlo */
  untie: () => play((a, o, t) => { noise(a, o, t, 0.32, 0.22, 1400, 0.9, 4200); noise(a, o, t + 0.18, 0.22, 0.14, 2600, 1.2, 900); }),
  /** ¡Zas! con campanitas cuando se abren las puertas */
  zas: () => play((a, o, t) => { noise(a, o, t, 0.45, 0.35, 500, 0.7, 160); osc(a, o, 95, t, 0.4, "sine", 0.4); [0, 4, 7, 12, 16].forEach((s, i) => osc(a, o, hz(79 + s), t + 0.12 + i * 0.07, 1.1, "triangle", 0.08)); }),
  drawer: () => play((a, o, t) => { noise(a, o, t, 0.1, 0.22, 2400, 2.5); osc(a, o, 180, t, 0.09, "square", 0.04); noise(a, o, t + 0.08, 0.25, 0.08, 700, 1.5, 300); }),
  dive: () => play((a, o, t) => noise(a, o, t, 0.5, 0.28, 260, 0.6, 3200)),
  sparkle: () => play((a, o, t) => [0, 3, 7, 12, 15].forEach((s, i) => osc(a, o, hz(84 + s), t + i * 0.045, 0.6, "sine", 0.06))),
  nope: () => play((a, o, t) => { osc(a, o, 196, t, 0.12, "square", 0.05); osc(a, o, 165, t + 0.1, 0.16, "square", 0.05); }),
  pop: () => play((a, o, t) => { osc(a, o, 660, t, 0.12, "triangle", 0.1); osc(a, o, 990, t + 0.05, 0.18, "sine", 0.06); }),
  done: () => play((a, o, t) => [0, 4, 7, 12].forEach((s, i) => osc(a, o, hz(72 + s), t + i * 0.08, 0.5, "triangle", 0.09))),
};

/* Música del videíto: melodía original con aire de parranda (bajo, guacharaca, cascabeles y campanitas) */
const MEL = [[76, 0, 79, 0, 76, 74, 72, 0], [77, 0, 81, 0, 79, 77, 76, 0], [74, 0, 79, 0, 77, 76, 74, 0], [76, 79, 84, 0, 79, 0, 0, 0], [81, 0, 84, 0, 83, 81, 79, 0], [77, 0, 81, 0, 79, 77, 76, 74], [74, 0, 77, 0, 71, 0, 74, 0], [72, 76, 79, 84, 0, 0, 0, 0]];
const ROOT = [48, 41, 43, 48, 45, 41, 43, 48];
const CHORD = [[60, 64, 67], [60, 65, 69], [59, 62, 67], [60, 64, 67], [57, 60, 64], [60, 65, 69], [59, 62, 67], [60, 64, 67]];

export function startMusic() {
  const a = audio();
  if (!a || music) return;
  const master = a.createGain();
  master.gain.value = 0.5;
  master.connect(a.destination);
  const step = 60 / 112 / 2;
  let n = 0;
  let next = a.currentTime + 0.08;
  const tick = () => {
    while (next < a.currentTime + 0.3) {
      const bar = Math.floor(n / 8) % 8, e = n % 8, t = next;
      if (e === 0 || e === 4) { osc(a, master, 62, t, 0.25, "sine", 0.45); osc(a, master, hz(ROOT[bar] - 12 + (e === 4 ? 7 : 0)), t, 0.3, "triangle", 0.28); }
      if (e === 6) osc(a, master, hz(ROOT[bar] - 12), t, 0.16, "triangle", 0.2);
      noise(a, master, t, 0.05, e % 2 ? 0.09 : 0.04, 6500, 1.2);
      if (e === 2 || e === 6) noise(a, master, t, 0.12, 0.05, 9000, 3);
      if (e % 2) CHORD[bar].forEach((m) => osc(a, master, hz(m), t, 0.14, "triangle", 0.025));
      const m = MEL[bar][e];
      if (m) { osc(a, master, hz(m), t, 0.42, "triangle", 0.11); osc(a, master, hz(m + 12), t, 0.25, "sine", 0.03); }
      n++;
      next += step;
    }
  };
  tick();
  music = { master, iv: setInterval(tick, 50) };
}

export function stopMusic() {
  if (!music || !ctx) return;
  clearInterval(music.iv);
  const m = music.master;
  music = null;
  try {
    m.gain.setTargetAtTime(0, ctx.currentTime, 0.06);
    setTimeout(() => m.disconnect(), 400);
  } catch { /* ya estaba desconectado */ }
}

/** Baja la música cuando suena el video del gozo, para que se oiga la voz */
export function setMusicLevel(level: number) {
  if (music && ctx) music.master.gain.setTargetAtTime(level, ctx.currentTime, 0.15);
}
