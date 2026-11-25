import { PAL, dayOf } from "@/data/days";
import { NAMES, VECINAS } from "@/data/vecinas";
import { FONT } from "@/lib/fonts";
import { getImg, gozo, iconImg } from "@/lib/media";
import {
  allPhotos, dateKnown, everyone, featOf, featPhoto, featText, lookOf, meName, myLook, placeKnown, placeParts,
  retoPhotos, topOf, votes, weekday, winner, type PhotoItem,
} from "@/lib/rules";
import type { AppState } from "@/lib/state";
import { drawAvatar } from "./avatar";
import { ease, rnd, starPath } from "./shapes";

/* El videíto del encuentro: escenas en un lienzo vertical de 1080×1920 (formato historia/TikTok).
   La muñequita de cada vecina cuenta lo que pasó y al final sale el cartel de tienda con la fecha y el lugar. */

export const W = 1080;
export const H = 1920;
const INK = "#161616";
const BG = ["#FFC918", "#FF8CC6", "#6FE89A", "#8AD8FF", "#FFA552", "#FFF6DC"];

export interface Slide {
  hola?: boolean; crew?: boolean; cartel?: boolean;
  who?: string; up?: boolean; day?: number;
  k?: string; t?: string; sub?: string; big?: string; quote?: string;
  photo?: PhotoItem; photos?: PhotoItem[]; dur?: number;
}

export function buildSlides(s: AppState): Slide[] {
  const me = meName(s), f1 = featText(s, 1), f5 = featText(s, 5), p2 = featPhoto(s, 2), p19 = featPhoto(s, 19);
  const nm = (v: string) => (v === "Yo misma" ? me : v), late = nm(topOf(s, 4)), g16 = featOf(s, 16);
  const gItem: PhotoItem = g16 === me && gozo.el ? { vid: true, by: me } : { by: g16, day: 16, play: true };
  return [
    { hola: true },
    { crew: true, k: "Así llegamos todas a", t: s.room, sub: `24 ventanitas · ${NAMES.length + 1} vecinas · un encuentro` },
    { who: f1[0], day: 1, k: f1[0] + " resumió su año", t: "en tres emojis", big: f1[1] },
    { who: p2.by, day: 2, k: p2.by + " desempolvó", t: "su foto de niña", photo: p2 },
    { who: late, up: true, day: 4, k: 'La que llega tarde diciendo "ya voy llegando"', t: late, sub: `con ${votes(s, 4)} votos y sin derecho a réplica` },
    { who: f5[0], day: 5, k: "Lo mejor del año de " + f5[0], quote: f5[1] },
    { day: 7, k: "Noche de velitas", t: "Así se prendió el barrio", photos: allPhotos(s, 7) },
    { who: me, up: true, day: 8, k: "Desayuno oficial del festivo", t: topOf(s, 8), sub: votes(s, 8) + " votos" },
    { who: g16, up: true, day: 16, k: g16 + " cantó su gozo", t: "a todo pulmón", photo: gItem, dur: gItem.vid ? Math.min(Math.max(gozo.dur || 8, 3), 15) + 0.6 : 3.2 },
    { who: p19.by, day: 19, k: "La peor pinta fue la de", t: p19.by, photo: p19 },
    { who: "Vero", day: 20, k: "¿Y la prima?", t: topOf(s, 20) },
    { day: 22, k: "Brindamos a distancia", t: "¡Salud y pesetas!", photos: allPhotos(s, 22) },
    { who: me, day: 23, k: "El agüero más popular del 31", t: topOf(s, 23), sub: votes(s, 23) + " vecinas lo van a hacer" },
    { cartel: true },
  ];
}

export const slideDur = (sl: Slide) => sl.dur || (sl.cartel ? 6 : sl.hola ? 4.2 : 2.8);
export const totalDur = (slides: Slide[]) => slides.reduce((a, sl) => a + slideDur(sl), 0);

/** Fotos que hay que tener listas antes de reproducir */
export const slidePhotos = (s: AppState, slides: Slide[]) =>
  [...slides.flatMap((sl) => [sl.photo, ...(sl.photos || [])]), ...retoPhotos(s)].filter((p): p is PhotoItem => !!p && !!p.src);

/* ---------- texto ---------- */
function wrapLines(x: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = String(text).split(/\s+/), lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (x.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}
function fitLines(x: CanvasRenderingContext2D, text: string, family: string, size: number, maxW: number, maxLines: number) {
  let lines: string[];
  for (;;) {
    x.font = size + "px " + family;
    lines = wrapLines(x, text, maxW);
    if ((lines.length <= maxLines && lines.every((l) => x.measureText(l).width <= maxW)) || size <= 30) break;
    size -= 6;
  }
  return { lines, size };
}
function fit(x: CanvasRenderingContext2D, text: string, family: string, size: number, maxW: number) {
  x.font = size + "px " + family;
  while (x.measureText(text).width > maxW && size > 24) { size -= 4; x.font = size + "px " + family; }
  return size;
}
function painted(x: CanvasRenderingContext2D, text: string, px: number, py: number, fill: string, shadow: string, off: number) {
  x.fillStyle = shadow; x.fillText(text, px + off, py + off);
  x.fillStyle = fill; x.fillText(text, px, py);
}

/* ---------- fondo y decoración ---------- */
function wall(x: CanvasRenderingContext2D, color: string) {
  x.fillStyle = color;
  x.fillRect(0, 0, W, H);
  for (let i = 0; i < 2200; i++) { x.fillStyle = `rgba(90,45,0,${rnd(i) * 0.09})`; x.fillRect(rnd(i + 50) * W, rnd(i + 90) * H, 3 + rnd(i + 7) * 5, 2); }
  for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,255,255,${rnd(i + 3) * 0.14})`; x.fillRect(rnd(i + 500) * W, rnd(i + 900) * H, 60 + rnd(i) * 160, 3); }
}
/** Festón a los lados, luces arriba, estrellitas y velitas abajo */
function decor(x: CanvasRenderingContext2D, t: number, seed: number, lights: boolean, candles: boolean) {
  x.save();
  for (let i = 0; i < 28; i++) {
    const px = 60 + rnd(seed * 31 + i) * (W - 120), py = 200 + rnd(seed * 17 + i + 40) * 1560, q = (14 + rnd(i + seed) * 26) * (1 + 0.14 * Math.sin(t * 4 + i));
    x.globalAlpha = i % 3 === 2 ? 0.14 : 0.34;
    x.fillStyle = i % 3 === 2 ? INK : "#fff";
    starPath(x, px, py, q, i % 2 ? 4 : 5, i % 2 ? 0.35 : 0.45);
    x.fill();
  }
  x.globalAlpha = 1; x.strokeStyle = INK; x.lineWidth = 4;
  for (let side = 0; side < 2; side++) for (let j = 0; j < 17; j++) {
    const px = side ? W : 0, py = 60 + j * 112;
    x.fillStyle = j % 2 ? "#17A35A" : "#0E7C43"; x.beginPath(); x.arc(px, py, 44, 0, 7); x.fill(); x.stroke();
    if (j % 3 === 1) { x.fillStyle = j % 2 ? "#D81E27" : "#FFC918"; x.beginPath(); x.arc(side ? W - 28 : 28, py + 54, 15, 0, 7); x.fill(); x.stroke(); }
  }
  if (lights) for (let k = 0; k < 4; k++) {
    const x0 = k * 270;
    x.lineWidth = 5; x.beginPath(); x.moveTo(x0, 84); x.quadraticCurveTo(x0 + 135, 150, x0 + 270, 84); x.stroke();
    for (let b = 1; b <= 3; b++) {
      const v = b / 4, bx = x0 + 270 * v, by = 84 + 2 * v * (1 - v) * 66 + 20, on = Math.floor(t * 3 + k * 3 + b) % 3 !== 0;
      x.fillStyle = on ? ["#FFE14A", "#FF8CC6", "#8AD8FF", "#C7F23A", "#FF5A4A"][(k * 3 + b) % 5] : "#7A6A55";
      x.lineWidth = 4; x.beginPath(); x.ellipse(bx, by, 13, 19, 0, 0, 7); x.fill(); x.stroke();
    }
  }
  if (candles) for (let i = 0; i < 10; i++) {
    const px = 60 + i * 107, f = 1 + 0.15 * Math.sin(t * 9 + i * 2);
    x.fillStyle = PAL[(i + seed) % 6]; x.lineWidth = 5; x.fillRect(px - 18, 1838, 36, 90); x.strokeRect(px - 18, 1838, 36, 90);
    x.fillStyle = "#FFE14A"; x.beginPath(); x.ellipse(px, 1812, 11 * f, 21 * f, 0, 0, 7); x.fill(); x.stroke();
  }
  x.restore();
}
/** Estrella de promoción de tienda con texto */
function burst(x: CanvasRenderingContext2D, cx: number, cy: number, r: number, rot: number, fill: string, lines: string[], sc: number, tc?: string) {
  if (!sc) return;
  x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(sc, sc);
  x.fillStyle = INK; starPath(x, 6, 6, r, 14, 0.78); x.fill();
  x.fillStyle = fill; starPath(x, 0, 0, r, 14, 0.78); x.fill(); x.lineWidth = 5; x.strokeStyle = INK; x.stroke();
  x.textAlign = "center";
  const fs = r * 0.36;
  x.font = fs + "px " + FONT.display;
  lines.forEach((l, i) => { const y = (i - (lines.length - 1) / 2) * fs * 1.05 + fs * 0.38; x.fillStyle = tc ? "#fff" : INK; x.fillText(l, 3, y + 3); x.fillStyle = tc || "#fff"; x.fillText(l, 0, y); });
  x.restore();
}
/** Polaroid: la foto real, un cuadro del video del gozo, o un espacio con el dibujo del reto y el nombre */
function polaroid(x: CanvasRenderingContext2D, it: PhotoItem, cx: number, cy: number, w: number, hh: number, rot: number, sc: number, redraw: () => void) {
  if (!sc) return;
  x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(sc, sc);
  x.fillStyle = INK; x.fillRect(-w / 2 + w * 0.03, -hh / 2 + w * 0.03, w, hh);
  x.fillStyle = "#fff"; x.fillRect(-w / 2, -hh / 2, w, hh); x.lineWidth = Math.max(3, w * 0.012); x.strokeStyle = INK; x.strokeRect(-w / 2, -hh / 2, w, hh);
  const m = Math.round(w * 0.06), cap = Math.round(hh * 0.17), iw = w - m * 2, ih = hh - m - cap, ix = -w / 2 + m, iy = -hh / 2 + m;
  const vid = it.vid ? gozo.el : null, img = !it.vid && it.src ? getImg(it.src, redraw) : null;
  const vw = vid ? vid.videoWidth : img ? img.naturalWidth : 0, vh = vid ? vid.videoHeight : img ? img.naturalHeight : 0;
  const ready = vid ? vid.readyState >= 2 : !!img && img.complete;
  if ((vid || img) && vw && ready) {
    const q = Math.max(iw / vw, ih / vh), sw = iw / q, sh = ih / q;
    x.drawImage((vid || img)!, (vw - sw) / 2, (vh - sh) / 2, sw, sh, ix, iy, iw, ih);
  } else {
    const d = it.day ? dayOf(it.day) : null;
    x.fillStyle = (VECINAS.find((f) => f.n === it.by) || { c: "#1747B5" }).c; x.fillRect(ix, iy, iw, ih);
    x.fillStyle = "rgba(255,255,255,.16)"; x.beginPath(); x.arc(ix + iw * 0.78, iy + ih * 0.2, ih * 0.42, 0, 7); x.fill();
    if (d) { const im = iconImg(d.ic, "#FFFDF6", "#FFC918", redraw); if (im.complete && im.naturalWidth) { const s2 = Math.min(iw, ih) * 0.56; x.drawImage(im, -s2 / 2, iy + (ih - s2) / 2, s2, s2); } }
    if (it.play) {
      const r = ih * 0.16, cy2 = iy + ih / 2;
      x.fillStyle = "rgba(22,22,22,.62)"; x.beginPath(); x.arc(0, cy2, r, 0, 7); x.fill();
      x.fillStyle = "#fff"; x.beginPath(); x.moveTo(-r * 0.3, cy2 - r * 0.45); x.lineTo(r * 0.5, cy2); x.lineTo(-r * 0.3, cy2 + r * 0.45); x.closePath(); x.fill();
    }
  }
  x.lineWidth = Math.max(2, w * 0.006); x.strokeStyle = INK; x.strokeRect(ix, iy, iw, ih);
  if (it.by) { x.fillStyle = INK; x.textAlign = "center"; x.font = `700 ${Math.round(cap * 0.62)}px ${FONT.hand}`; x.fillText(it.by, 0, hh / 2 - cap * 0.3); }
  x.restore();
}

/* ---------- escenas ---------- */
function drawHola(x: CanvasRenderingContext2D, s: AppState, lt: number, redraw: () => void) {
  wall(x, "#C3161E");
  decor(x, lt > 50 ? 0 : lt, 5, false, false);
  const a = ease(lt / 0.5), b = ease((lt - 0.3) / 0.5), c = ease((lt - 0.7) / 0.5), d = ease((lt - 1.1) / 0.45), t = lt > 50 ? 0 : lt;
  const cx = 540, cy = 1010, rx = 345, ry = 520;
  x.textAlign = "center";
  if (b) {
    x.save(); x.translate(cx, cy); x.scale(b, b); x.strokeStyle = INK;
    for (let i = 0; i < 56; i++) { const an = (i / 56) * Math.PI * 2; x.fillStyle = i % 2 ? "#17A35A" : "#0E7C43"; x.lineWidth = 4; x.beginPath(); x.arc(Math.cos(an) * (rx + 18), Math.sin(an) * (ry + 18), 46, 0, 7); x.fill(); x.stroke(); }
    x.fillStyle = "#FFF6DC"; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, 7); x.fill(); x.lineWidth = 7; x.stroke();
    for (let i = 0; i < 14; i++) { const an = (i / 14) * Math.PI * 2 + 0.2; x.fillStyle = i % 2 ? "#FFC918" : "#D81E27"; x.beginPath(); x.arc(Math.cos(an) * (rx + 22), Math.sin(an) * (ry + 22), 20, 0, 7); x.fill(); x.lineWidth = 4; x.stroke(); }
    for (let i = 0; i < 26; i++) { const an = (i / 26) * Math.PI * 2, on = Math.floor(t * 3 + i) % 3 !== 0; x.fillStyle = on ? ["#FFE14A", "#FF8CC6", "#8AD8FF", "#C7F23A", "#FFA552"][i % 5] : "#7A5A45"; x.beginPath(); x.ellipse(Math.cos(an) * (rx + 80), Math.sin(an) * (ry + 80), 15, 22, an + Math.PI / 2, 0, 7); x.fill(); x.lineWidth = 4; x.stroke(); }
    x.restore();
  }
  drawAvatar(x, myLook(s), cx, cy + 445, 860, false, c, redraw);
  if (a) { x.save(); x.translate(350, 300); x.rotate(-0.1); x.scale(a, a); fit(x, "¡HOLA!", FONT.display, 300, 620); painted(x, "¡HOLA!", 0, 0, "#FFC918", INK, 12); x.restore(); }
  burst(x, 905, 330, 150, 0.25, "#FFC918", ["LLEGÓ", "DICIEMBRE"], d, INK);
  burst(x, 150, 1500, 140, -0.2, "#EC3F8C", ["SÍ HAY", "BUÑUELOS"], d);
  if (d) {
    x.globalAlpha = Math.min(1, d); x.textAlign = "center";
    const intro = "soy " + meName(s) + ", de " + s.room;
    fit(x, intro, FONT.script, 86, W - 120); painted(x, intro, W / 2, 1700, "#fff", INK, 4);
    x.fillStyle = "#FFF6DC"; x.font = "500 34px " + FONT.body; x.fillText("Le cuento cómo fue nuestro diciembre, ventanita por ventanita", W / 2, 1756);
    x.globalAlpha = 1;
  }
  for (let i = 0; i < 9; i++) {
    const px = 80 + i * 115, f = 1 + 0.15 * Math.sin(t * 9 + i * 2);
    x.fillStyle = PAL[i % 6]; x.strokeStyle = INK; x.lineWidth = 5; x.fillRect(px - 20, 1815, 40, 110); x.strokeRect(px - 20, 1815, 40, 110);
    x.fillStyle = "#FFE14A"; x.beginPath(); x.ellipse(px, 1787, 13 * f, 24 * f, 0, 0, 7); x.fill(); x.stroke();
  }
}

function crew(x: CanvasRenderingContext2D, s: AppState, lt: number, redraw: () => void) {
  const all = everyone(s), N = all.length, cols = N > 6 ? 4 : 3, rows = Math.ceil(N / cols), rowH = 980 / rows, hh = Math.min(440, rowH * 0.96);
  all.forEach((n, i) => {
    const r = Math.floor(i / cols), cnt = Math.min(cols, N - r * cols), j = i % cols;
    drawAvatar(x, lookOf(s, n), W / 2 + (j - (cnt - 1) / 2) * ((W - 120) / cols), 900 + rowH * (r + 1), hh, i % 2 === 0, ease((lt - 0.3 - i * 0.12) / 0.45), redraw);
  });
}

function photoGrid(x: CanvasRenderingContext2D, list: PhotoItem[], y: number, lt: number, redraw: () => void) {
  const n = list.length, cols = n <= 1 ? 1 : n <= 4 ? 2 : 3, w = Math.min(340, (W - 160) / cols - 24), hh = w * 1.12, top = Math.max(y + 40, 700);
  list.forEach((it, i) => {
    const r = Math.floor(i / cols), cnt = Math.min(cols, n - r * cols), j = i % cols;
    polaroid(x, it, W / 2 + (j - (cnt - 1) / 2) * (w + 28), top + hh / 2 + r * (hh + 28), w, hh, (rnd(i + 5) - 0.5) * 0.14, ease((lt - 0.4 - i * 0.15) / 0.45), redraw);
  });
}

function drawSlide(x: CanvasRenderingContext2D, s: AppState, sl: Slide, i: number, lt: number, redraw: () => void) {
  wall(x, BG[i % 6]);
  decor(x, lt > 50 ? 0 : lt, i, true, true);
  const a = ease(lt / 0.45), b = ease((lt - 0.25) / 0.45), c = ease((lt - 0.5) / 0.45);
  x.textAlign = "center";
  x.fillStyle = INK; x.font = "700 30px " + FONT.body; x.fillText(s.room.toUpperCase() + " · ADVIENTO 2026", W / 2, 222);
  x.globalAlpha = Math.min(1, a);
  const kf = fitLines(x, sl.k || "", FONT.script, 80, 920, 2);
  kf.lines.forEach((l, j) => painted(x, l, W / 2, 370 + j * kf.size * 1.1 - (1 - Math.min(1, a)) * 40, INK, "#fff", 3));
  x.globalAlpha = 1;
  let y = 370 + kf.lines.length * kf.size * 1.1 + 60;
  if (sl.t && b) {
    const tf = fitLines(x, sl.t.toUpperCase(), FONT.display, 130, 960, 3);
    x.save(); x.translate(W / 2, y + tf.size * 0.5); x.rotate(-0.02); x.scale(b, b);
    tf.lines.forEach((l, j) => painted(x, l, 0, j * tf.size * 1.02, "#1747B5", "#fff", 6));
    x.restore();
    y += tf.lines.length * tf.size * 1.02 + 40;
  }
  if (sl.sub && c) {
    x.globalAlpha = Math.min(1, c);
    const sf = fitLines(x, sl.sub, FONT.body, 44, 900, 2);
    x.fillStyle = INK; x.font = `500 ${sf.size}px ${FONT.body}`;
    sf.lines.forEach((l, j) => x.fillText(l, W / 2, y + 30 + j * sf.size * 1.25));
    x.globalAlpha = 1;
    y += sf.lines.length * sf.size * 1.25 + 40;
  }
  if (sl.big && c) {
    x.save(); x.translate(W / 2, y + 190); x.scale(c, c);
    x.fillStyle = "#fff"; x.strokeStyle = INK; x.lineWidth = 7; x.fillRect(-400, -150, 800, 300); x.strokeRect(-400, -150, 800, 300);
    x.fillStyle = INK; fit(x, sl.big, "serif", 170, 720); x.textBaseline = "middle"; x.fillText(sl.big, 0, 10); x.textBaseline = "alphabetic";
    x.restore();
  }
  if (sl.quote && c) {
    x.save(); x.translate(W / 2, y + 230); x.rotate(0.02); x.scale(c, c);
    x.fillStyle = INK; x.fillRect(-430 + 10, -200 + 10, 860, 400); x.fillStyle = "#fff"; x.fillRect(-430, -200, 860, 400); x.lineWidth = 6; x.strokeStyle = INK; x.strokeRect(-430, -200, 860, 400);
    x.fillStyle = INK;
    const qf = fitLines(x, "“" + sl.quote + "”", FONT.hand, 84, 780, 4);
    x.font = `700 ${qf.size}px ${FONT.hand}`;
    qf.lines.forEach((l, j) => x.fillText(l, 0, (j - (qf.lines.length - 1) / 2) * qf.size * 1.05 + qf.size * 0.3));
    x.restore();
  }
  if (sl.photo) polaroid(x, sl.photo, W / 2 - 120, Math.max(y + 330, 1050), 600, 560, -0.05, c, redraw);
  if (sl.crew) crew(x, s, lt, redraw);
  else if (sl.photos) photoGrid(x, sl.photos, y, lt, redraw);
  else {
    const solo = !(sl.photo || sl.quote || sl.big);
    drawAvatar(x, lookOf(s, sl.who || meName(s)), solo ? 640 : 850, 1885, solo ? 900 : 600, !!sl.up, ease((lt - 0.1) / 0.5), redraw);
  }
  if (sl.day) {
    x.save(); x.translate(210, 1690); x.rotate(-0.1);
    const d = ease((lt - 0.6) / 0.4); x.scale(d, d);
    if (d) {
      x.fillStyle = INK; x.fillRect(-140 + 8, -80 + 8, 280, 160); x.fillStyle = "#C7F23A"; x.fillRect(-140, -80, 280, 160); x.lineWidth = 6; x.strokeStyle = INK; x.strokeRect(-140, -80, 280, 160);
      x.fillStyle = INK; x.font = "96px " + FONT.display; x.fillText("DÍA " + sl.day, 0, 38);
    }
    x.restore();
  }
}

/* ---------- el cartel final ---------- */
/** Árbol de fotos: tantas filas como hagan falta según cuántas fotos haya */
function treeSlots(n: number) {
  let R = 1;
  while ((R * (R + 1)) / 2 < n) R++;
  const top = 480, bottom = 1150, rowH = (bottom - top) / R, hh = Math.min(rowH * 0.94, 300), w = Math.min(hh * 0.86, ((W - 140) / R) * 0.95);
  const out: { x: number; y: number; w: number; h: number }[] = [];
  let k = 0;
  for (let r = 0; r < R && k < n; r++) {
    const cnt = Math.min(r + 1, n - k);
    for (let j = 0; j < cnt; j++, k++) out.push({ x: W / 2 + (j - (cnt - 1) / 2) * w * 1.08, y: top + rowH * (r + 0.5), w, h: hh });
  }
  return out;
}

function drawCartel(x: CanvasRenderingContext2D, s: AppState, lt: number, redraw: () => void) {
  wall(x, "#FFC918");
  decor(x, lt > 50 ? 0 : lt, 3, false, false);
  const ph = retoPhotos(s), sl = treeSlots(ph.length), N = sl.length, pop = (i: number) => ease((lt - 0.2 - i * 0.14) / 0.4);
  x.textAlign = "center";
  x.font = "84px " + FONT.script; painted(x, "Gran encuentro de", W / 2, 150, INK, "#fff", 4);
  const room = (s.room || "La Vecindad").toUpperCase();
  x.save(); x.translate(W / 2, 300); x.rotate(-0.03); fit(x, room, FONT.display, 150, W - 110); painted(x, room, 0, 0, "#1747B5", "#fff", 8); x.restore();
  sl.forEach((p, i) => polaroid(x, ph[i], p.x, p.y, p.w, p.h, (rnd(i + 11) - 0.5) * 0.16, pop(N - 1 - i), redraw));
  burst(x, 540, 410, 76, -0.1, "#D81E27", ["¡HOY", "SÍ HAY!"], pop(N));
  burst(x, 930, 640, 118, 0.2, "#EC3F8C", ["ENTRADA:", "UN ABRAZO"], pop(N + 1));
  const all = everyone(s), sp = Math.min(170, (W - 140) / all.length), ah = Math.min(230, sp * 1.5);
  all.forEach((n, i) => drawAvatar(x, lookOf(s, n), W / 2 + (i - (all.length - 1) / 2) * sp, 1395, ah, i % 2 === 1, pop(N + 2 + i * 0.5), redraw));
  const w = winner(s), date = dateKnown(s) ? `${weekday(w)} ${w} de diciembre`.toUpperCase() : "FECHA: SE VOTA EL 3";
  x.textAlign = "center";
  x.save(); x.translate(W / 2, 1510); x.rotate(0.015); fit(x, date, FONT.display, 112, W - 90); painted(x, date, 0, 0, "#D81E27", INK, 7); x.restore();
  const [pre, place] = placeParts(topOf(s, 15));
  const l1 = placeKnown(s) ? [topOf(s, 12), pre].filter(Boolean).join(" ") : "Plan y lugar por votar", l2 = placeKnown(s) ? place.toUpperCase() : "";
  fit(x, l1, FONT.script, 78, W - 120); painted(x, l1, W / 2, 1612, INK, "#fff", 3);
  if (l2) { fit(x, l2, FONT.display, 84, W - 120); painted(x, l2, W / 2, 1716, "#1747B5", "#fff", 5); }
  x.fillStyle = INK; x.fillRect(0, 1770, W, 150);
  const jokes = "NO SE FÍA ★ SÍ HAY BUÑUELOS ★ PROHIBIDO FALTAR";
  fit(x, jokes, FONT.display, 56, W - 70); x.fillStyle = "#FFC918"; x.fillText(jokes, W / 2, 1850);
  x.fillStyle = "#fff"; x.font = "700 28px " + FONT.body; x.fillText("ADVIENTO ENTRE AMIGAS 2026 · 24 VENTANITAS", W / 2, 1895);
}

/** Pinta el cuadro del momento vt. Devuelve qué escena está en pantalla y cuándo empezó. */
export function drawFrame(x: CanvasRenderingContext2D, s: AppState, slides: Slide[], vt: number, playing: boolean, redraw: () => void) {
  let acc = 0, i = 0;
  for (; i < slides.length - 1 && vt >= acc + slideDur(slides[i]); i++) acc += slideDur(slides[i]);
  const sl = slides[i], lt = playing ? vt - acc : 99;
  if (sl.cartel) drawCartel(x, s, lt, redraw);
  else if (sl.hola) drawHola(x, s, lt, redraw);
  else drawSlide(x, s, sl, i, lt, redraw);
  // barra de avance arriba
  const n = slides.length, gap = 8, sw = (W - 80 - gap * (n - 1)) / n;
  let a2 = 0;
  slides.forEach((it, j) => {
    const px = 40 + j * (sw + gap), f = Math.max(0, Math.min(1, (vt - a2) / slideDur(it)));
    x.fillStyle = "rgba(22,22,22,.28)"; x.fillRect(px, 50, sw, 10);
    x.fillStyle = INK; x.fillRect(px, 50, sw * f, 10);
    a2 += slideDur(it);
  });
  return { i, acc, slide: sl };
}
