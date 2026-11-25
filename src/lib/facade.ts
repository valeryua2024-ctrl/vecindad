import { rnd } from "@/canvas/shapes";
import { FONT } from "./fonts";

/* La caja cerrada: fachada pintada de una casa colonial (amarillo y naranja, ventanas azules,
   balcones con veraneras, puertas en arco, faroles y matas) y el lazo blanco que la amarra.
   Se arma como texto SVG porque se parte en dos puertas que se abren. */

const esc = (t: string) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function facadeSVG(room: string): string {
  const K = "#2B2118", S2 = `stroke="${K}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"`;
  let o = "";
  const rect = (x: number, y: number, w: number, hh: number, f: string, ex = "") => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="${f}" ${S2} ${ex}/>`;
  const path = (d: string, f: string, ex = "") => `<path d="${d}" fill="${f}" ${S2} ${ex}/>`;
  const circ = (cx: number | string, cy: number | string, r: number | string, f: string, ex = "") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" ${ex}/>`;
  const arch = (cx: number, top: number, w: number, bot: number) => { const r = w / 2; return `M${cx - r} ${bot}V${top + r}A${r} ${r} 0 0 1 ${cx + r} ${top + r}V${bot}Z`; };

  // paredes y brochazos
  o += '<rect x="0" y="0" width="281" height="600" fill="#F5B82E"/><rect x="280" y="0" width="280" height="600" fill="#EF8A3C"/>';
  for (let i = 0; i < 16; i++) {
    const x = 10 + rnd(i + 70) * 520, y = 80 + rnd(i + 90) * 440, w = 40 + rnd(i + 3) * 60;
    o += `<path d="M${x.toFixed(0)} ${y.toFixed(0)}q${(w / 2).toFixed(0)} -5 ${w.toFixed(0)} 2" stroke="#FFF6DC" stroke-opacity=".28" stroke-width="${(5 + rnd(i) * 7).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
  }
  // tejado de barro
  o += rect(-4, -4, 568, 54, "#B9472F");
  for (let row = 0; row < 2; row++) for (let i = 0; i < 23; i++) { const x = i * 26 - 8 + (row ? 13 : 0), y = row ? 46 : 26; o += path(`M${x} ${y}q13 -18 26 0`, row ? "#D2603F" : "#C4553A"); }
  o += rect(-4, 46, 568, 12, "#3A64A8");
  // segundo piso
  const winUp = (cx: number, top: number, bot: number) => {
    o += path(arch(cx, top - 12, 96, bot + 4), "#3A64A8") + path(arch(cx, top, 72, bot), "#8A4B2A") + path(arch(cx, top + 8, 56, bot - 4), "#CFE6F2");
    o += `<path d="M${cx} ${top + 8}V${bot - 4}M${cx - 28} ${top + 48}H${cx + 28}M${cx - 28} ${top + 76}H${cx + 28}" stroke="#8A4B2A" stroke-width="4"/><path d="M${cx - 22} ${top + 30}q10 18 0 40M${cx + 22} ${top + 30}q-10 18 0 40" stroke="#fff" stroke-opacity=".85" stroke-width="3" fill="none"/>`;
  };
  const balcony = (cx: number, y: number, w: number) => {
    o += rect(cx - w / 2, y, w, 10, "#3A64A8");
    for (let b = 0; b < 3; b++) o += path(`M${cx - w / 2 + 10 + (b * (w - 20)) / 2} ${y + 10}l4 10h-8z`, "#3A64A8");
    let bars = "";
    for (let x = cx - w / 2 + 6; x <= cx + w / 2 - 6; x += 9) bars += `M${x} ${y - 36}V${y}`;
    o += `<path d="M${cx - w / 2 + 4} ${y - 38}H${cx + w / 2 - 4}M${cx - w / 2 + 4} ${y - 30}H${cx + w / 2 - 4}${bars}" stroke="${K}" stroke-width="2.2" fill="none"/>`;
  };
  const flowers = (cx: number, y: number, spread: number, down: number, seed: number) => {
    for (let i = 0; i < 10; i++) o += circ((cx - spread + rnd(seed + i + 80) * spread * 2).toFixed(1), (y - 8 + rnd(seed + i + 60) * down * 0.8).toFixed(1), 4, "#3F8A3A");
    for (let i = 0; i < 40; i++) {
      const a = rnd(seed + i) * Math.PI, r = rnd(seed + i + 50) * spread, fx = cx + Math.cos(a) * r * 1.25, fy = y - Math.sin(a) * r * 0.55 + rnd(seed + i + 9) * down;
      o += circ(fx.toFixed(1), fy.toFixed(1), (4 + rnd(seed + i + 3) * 4).toFixed(1), ["#E8447A", "#F06A9A", "#D9306A", "#FF8CB4"][i % 4], 'stroke="#9E1F4A" stroke-width=".8"');
    }
  };
  winUp(105, 92, 206); balcony(105, 212, 128);
  o += rect(212, 64, 136, 16, "#C4553A");
  for (let i = 0; i < 6; i++) o += path(`M${214 + i * 22} 80q11 -12 22 0`, "#D2603F");
  o += rect(220, 80, 120, 8, "#3A64A8");
  winUp(280, 108, 206); balcony(280, 212, 120); flowers(280, 214, 58, 46, 11);
  o += rect(405, 86, 100, 128, "#F2E6CC");
  for (let i = 0; i < 15; i++) { const yy = 89 + i * 8; o += `<rect x="408" y="${yy}" width="7" height="7" fill="${["#3A64A8", "#E8447A", "#F5B82E", "#4E9B3A"][i % 4]}"/><rect x="495" y="${yy}" width="7" height="7" fill="${["#4E9B3A", "#3A64A8", "#E8447A", "#F5B82E"][i % 4]}"/>`; }
  o += rect(417, 98, 76, 112, "#8A4B2A") + rect(425, 106, 60, 100, "#CFE6F2") + '<path d="M455 106V206M425 140H485M425 172H485" stroke="#8A4B2A" stroke-width="4"/>';
  balcony(455, 212, 124); flowers(468, 214, 62, 52, 31);
  // letrero con guirnalda
  const sy = 238, name = (room || "La Vecindad").toUpperCase(), fs = Math.min(34, 500 / Math.max(8, name.length));
  o += rect(112, sy, 336, 50, "#FFF6DC", 'rx="6"');
  o += `<text x="280" y="${sy + 25 + fs * 0.36}" text-anchor="middle" font-family="${esc(FONT.display)}" font-size="${fs.toFixed(1)}" fill="#C8352A" letter-spacing="2">${esc(name)}</text>`;
  o += `<path d="M100 ${sy - 4}q45 26 90 0q45 26 90 0q45 26 90 0q45 26 90 0" fill="none" stroke="#2F7D3A" stroke-width="8" stroke-linecap="round"/>`;
  for (let i = 0; i < 5; i++) { const bx = 100 + i * 90; o += path(`M${bx} ${sy - 4}l-11 -7v14zM${bx} ${sy - 4}l11 -7v14z`, "#D8452F") + circ(bx, sy - 4, 3.5, "#B8272A", `stroke="${K}" stroke-width="1.2"`); }
  // primer piso: arcos, puertas, faroles
  const bot = 538;
  o += path(arch(112, 348, 128, bot), "#D9674E") + path(arch(112, 362, 100, bot), "#1F6F6F");
  o += `<path d="M112 412V${bot}M78 440H102M122 440H146M78 482H102M122 482H146" stroke="${K}" stroke-width="1.6"/>`;
  o += circ(104, 462, 3, "#E8B64A", `stroke="${K}" stroke-width="1.2"`) + circ(120, 462, 3, "#E8B64A", `stroke="${K}" stroke-width="1.2"`);
  o += path(arch(280, 340, 148, bot), "#D9674E") + path(arch(280, 354, 118, bot), "#9A5630") + `<path d="M280 354V${bot}" stroke="${K}" stroke-width="2"/>`;
  [250, 310].forEach((x) => {
    o += rect(x - 20, 430, 40, 34, "#8A4B2A") + rect(x - 20, 476, 40, 44, "#8A4B2A");
    o += `<circle cx="${x}" cy="400" r="17" fill="none" stroke="#2F7D3A" stroke-width="9"/><circle cx="${x}" cy="400" r="17" fill="none" stroke="${K}" stroke-width="1" stroke-dasharray="3 5"/>`;
    o += path(`M${x} 384l-8 -6v12zM${x} 384l8 -6v12z`, "#D8452F");
  });
  o += path(arch(448, 348, 128, bot), "#D9674E") + path(arch(448, 362, 100, 490), "#3B2A22");
  let grid = "";
  for (let x = 412; x <= 484; x += 12) grid += `M${x} 376V490`;
  for (let y = 404; y <= 490; y += 16) grid += `M398 ${y}H498`;
  o += `<path d="${grid}" stroke="#7A5A45" stroke-width="2"/>` + rect(392, 490, 112, 8, "#3A64A8");
  ([[192, 360], [368, 360]] as [number, number][]).forEach(([x, y]) => { o += path(`M${x - 9} ${y}h18l-3 26h-12z`, K) + rect(x - 6, y + 4, 12, 16, "#F7D774") + path(`M${x - 11} ${y}l11 -10l11 10z`, K); });
  ([[112, "#3A64A8"], [280, "#E8447A"], [448, "#3A64A8"]] as [number, string][]).forEach(([x, c]) => { o += rect(x - 9, 322, 18, 14, "#FFF6DC") + `<path d="M${x - 9} 329h18M${x} 322v14" stroke="${c}" stroke-width="3"/>`; });
  o += rect(200, 522, 160, 8, "#E58C6A") + rect(190, 530, 180, 8, "#E58C6A");
  // andén y matas
  o += rect(-4, 538, 568, 34, "#E9A47E");
  for (let x = 0; x < 560; x += 40) o += `<path d="M${x} 538V572" stroke="#C97F5B" stroke-width="1.5"/>`;
  const pot = (x: number, y: number, big: boolean) => {
    const w = big ? 34 : 26, hh = big ? 32 : 24;
    let lv = "";
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.42, L = big ? 44 : 32; lv += `M${x} ${y - hh + 2}q${(Math.cos(a) * L * 0.5).toFixed(1)} ${(Math.sin(a) * L * 0.7).toFixed(1)} ${(Math.cos(a) * L).toFixed(1)} ${(Math.sin(a) * L).toFixed(1)}`; }
    o += `<path d="${lv}" stroke="#2F7D3A" stroke-width="6" fill="none" stroke-linecap="round"/><path d="${lv}" stroke="#4E9B3A" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    o += path(`M${x - w / 2} ${y - hh}h${w}l-4 ${hh}h${-(w - 8)}z`, "#C8632E") + rect(x - w / 2 - 2, y - hh - 4, w + 4, 7, "#D97A45");
  };
  pot(30, 562, true); pot(186, 556, false); pot(374, 556, false); pot(530, 562, true);
  // franja de abajo
  const label = (x: number, t: string) => `<text x="${x}" y="592" text-anchor="middle" font-family="${esc(FONT.body)}" font-size="13" font-weight="500" letter-spacing="3" fill="${K}">${t}</text>`;
  o += rect(-4, 572, 568, 32, "#FFF8EC") + label(140, "ADVIENTO 2026") + label(420, "ENTRE VECINAS");
  return `<svg viewBox="0 0 560 600" preserveAspectRatio="none" aria-hidden="true">${o}</svg>`;
}

export function ribbonSVG(): string {
  const st = 'stroke="#B9AE9A" stroke-width="1.6" stroke-linejoin="round"';
  return '<svg viewBox="0 0 560 600" preserveAspectRatio="none" aria-hidden="true">'
    + `<g class="bl"><rect x="-6" y="300" width="290" height="26" fill="#FFFDF6" ${st}/><path d="M-6 308H284" stroke="#E6DFD2" stroke-width="3"/></g>`
    + `<g class="br"><rect x="276" y="300" width="290" height="26" fill="#FFFDF6" ${st}/><path d="M276 308H566" stroke="#E6DFD2" stroke-width="3"/></g>`
    + `<g class="tails"><path d="M272 316L226 404L238 398L246 410L284 322Z" fill="#FFFDF6" ${st}/><path d="M288 316L340 400L328 396L322 410L276 322Z" fill="#FFFDF6" ${st}/></g>`
    + `<g class="bow"><path d="M280 313C246 270 204 282 214 312C222 336 258 330 280 313Z" fill="#FFFDF6" ${st}/><path d="M280 313C314 270 356 282 346 312C338 336 302 330 280 313Z" fill="#FFFDF6" ${st}/><path d="M262 300C240 296 230 304 236 314M298 300C320 296 330 304 324 314" stroke="#E6DFD2" stroke-width="3" fill="none"/><rect x="267" y="300" width="26" height="26" rx="8" fill="#FFFDF6" ${st}/></g></svg>`;
}
