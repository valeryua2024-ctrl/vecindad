import { BOTTOMS, HOODS, SHOES, SKINS, TOPS, type AvatarLook } from "@/data/avatar-options";
import { getImg } from "@/lib/media";
import { starPath } from "./shapes";

/* La muñequita: capucha navideña con la foto de la cara adentro, cuerpo redondeado y femenino,
   y la ropa que cada vecina eligió. Todo se dibuja en un lienzo, en unidades de 0 a 100 de alto.
   Orden: piernas, medias y zapatos, encima la prenda de abajo (el ruedo tapa el zapato),
   brazos, mangas, camiseta, manos y al final la capucha con la cara. */

type Pt = [number, number];
type Cmd = [string, ...number[]];

export function drawAvatar(
  x: CanvasRenderingContext2D, a: AvatarLook, cx: number, footY: number, hh: number,
  up: boolean, sc = 1, redraw?: () => void,
) {
  if (sc === 0) return;
  const u = hh / 100;
  const T = TOPS[a.top || 0], B = BOTTOMS[a.bottom || 0], Z = SHOES[a.shoes || 0], HD = HOODS[a.hood || 0];
  const SK = SKINS[a.skin == null ? 1 : a.skin].c, K = "#161616", HA = a.hair || "#171313", lw = Math.max(1.6, u * 0.9);
  x.save();
  x.translate(cx, footY);
  if (sc !== 1) x.scale(sc, sc);
  x.lineJoin = "round";
  x.lineCap = "round";
  x.strokeStyle = K;
  x.lineWidth = lw;

  const E = (X: number, Y: number, rx: number, ry: number, f: string, noStroke?: boolean, rot = 0) => { x.fillStyle = f; x.beginPath(); x.ellipse(X * u, Y * u, rx * u, ry * u, rot, 0, 7); x.fill(); if (!noStroke) x.stroke(); };
  const limb = (pts: Pt[], w: number, col: string) => {
    ([[w + 1.9, K], [w, col]] as [number, string][]).forEach(([ww, c]) => {
      x.lineWidth = ww * u; x.strokeStyle = c; x.beginPath(); x.moveTo(pts[0][0] * u, pts[0][1] * u);
      if (pts.length === 3) x.quadraticCurveTo(pts[1][0] * u, pts[1][1] * u, pts[2][0] * u, pts[2][1] * u);
      else for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0] * u, pts[i][1] * u);
      x.stroke();
    });
    x.lineWidth = lw; x.strokeStyle = K;
  };
  const dots = (list: Pt[], r: number, c?: string) => list.forEach((p) => E(p[0], p[1], r, r, c || "#fff", true));
  const ln = (pts: Pt[], c: string, w: number) => { x.strokeStyle = c; x.lineWidth = w * u; x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0] * u, p[1] * u) : x.moveTo(p[0] * u, p[1] * u))); x.stroke(); x.strokeStyle = K; x.lineWidth = lw; };
  const trace = (cmds: Cmd[]) => {
    x.beginPath();
    cmds.forEach((c) => {
      const v = c.slice(1).map((n) => (n as number) * u);
      if (c[0] === "M") x.moveTo(v[0], v[1]);
      else if (c[0] === "L") x.lineTo(v[0], v[1]);
      else if (c[0] === "Q") x.quadraticCurveTo(v[0], v[1], v[2], v[3]);
      else x.bezierCurveTo(v[0], v[1], v[2], v[3], v[4], v[5]);
    });
    x.closePath();
  };
  const PT = (cmds: Cmd[], f: string) => { trace(cmds); x.fillStyle = f; x.fill(); x.strokeStyle = K; x.lineWidth = lw; x.stroke(); };
  const fl = (cmds: Cmd[], s: number): Cmd[] => cmds.map((c) => [c[0], ...c.slice(1).map((n, i) => (i % 2 ? (n as number) : (n as number) * s))] as Cmd);
  const both = (cmds: Cmd[], f: string) => { PT(cmds, f); PT(fl(cmds, -1), f); };

  /* piernas con rubor en las rodillas */
  both([["M", 1, -31], ["C", 1, -22, 2.2, -12, 2.6, -6], ["L", 6.4, -6], ["C", 7, -12, 8.2, -22, 8.2, -31]], SK);
  x.globalAlpha = 0.45;
  [-1, 1].forEach((s) => E(s * 4.8, -16.5, 1.8, 1.3, "#F07A7A", true));
  x.globalAlpha = 1;

  /* medias y zapatos */
  [-1, 1].forEach((s) => {
    const F = (c: Cmd[]) => fl(c, s), f = (pts: Pt[]) => pts.map((p) => [p[0] * s, p[1]] as Pt), k = Z.k;
    if (k === "tenis") { PT(F([["M", 2.7, -14.2], ["L", 6.4, -14.2], ["L", 6.5, -7], ["L", 2.6, -7]]), "#fff"); ln(f([[2.7, -12.4], [6.4, -12.4]]), "#1747B5", 0.9); ln(f([[2.7, -10.9], [6.4, -10.9]]), "#17A35A", 0.9); }
    if (k === "sock") PT(F([["M", 2.7, -13], ["L", 6.4, -13], ["L", 6.5, -4.6], ["Q", 9, -4.6, 11.4, -3.2], ["Q", 12.6, -2.2, 12, -1.4], ["L", 2.3, -1.4]]), "#fff");
    if (k === "boot") PT(F([["M", 2.1, -15.5], ["Q", 4.5, -16.4, 7, -15.5], ["L", 7.2, -6], ["L", 1.9, -6]]), Z.c);
    if (k === "tenis") { PT(F([["M", 1.9, -8.8], ["Q", 4.5, -9.7, 7.2, -8.8], ["Q", 7.8, -5.8, 10.2, -4.8], ["Q", 13.6, -4, 13.2, -1.4], ["Q", 13, 0, 11.2, 0], ["L", 2.5, 0], ["Q", 1.1, 0, 1.2, -1.6], ["Q", 1.1, -5, 1.9, -8.8]]), Z.c); PT(F([["M", 1.2, -1.8], ["L", 13.1, -1.8], ["Q", 13, 0, 11.2, 0], ["L", 2.5, 0], ["Q", 1.1, 0, 1.2, -1.8]]), "#DDD8CC"); ln(f([[3.3, -7], [7, -6.6]]), K, 0.45); ln(f([[4.1, -5.4], [8.4, -5]]), K, 0.45); }
    else if (k === "boot") { PT(F([["M", 1.7, -6.8], ["L", 7.2, -6.8], ["Q", 8.4, -4.6, 11.1, -3.8], ["Q", 13.6, -3, 13, -1], ["Q", 12.6, 0, 10.7, 0], ["L", 2.3, 0], ["Q", 1.3, 0, 1.4, -1.4]]), Z.c); PT(F([["M", 1.4, -1.5], ["L", 12.9, -1.5], ["Q", 12.6, 0, 10.7, 0], ["L", 2.3, 0], ["Q", 1.3, 0, 1.4, -1.5]]), "#0B0B0D"); }
    else if (k === "heel") { PT(F([["M", 2.3, -6.8], ["L", 6.6, -6.8], ["Q", 8.8, -3.4, 12.3, -2.2], ["Q", 13.9, -1.6, 12.7, -0.7], ["Q", 8.8, -1, 6.6, -1.6], ["Q", 4.4, -1.4, 3.5, -1.2]]), Z.c); PT(F([["M", 1.9, -2.6], ["L", 3.7, -2.6], ["Q", 3.5, -1, 3.2, 0], ["L", 2.4, 0], ["Q", 2.1, -1, 1.9, -2.6]]), Z.c); }
    else if (k === "sock") { PT(F([["M", 1.3, -1.8], ["L", 12.5, -1.8], ["Q", 13.3, -0.9, 12.5, 0], ["L", 1.5, 0], ["Q", 0.8, -0.9, 1.3, -1.8]]), Z.c); ln(f([[4.1, -4], [9.4, -2.6]]), Z.c, 1.6); }
    else if (k === "bare") {
      PT(F([["M", 2, -7], ["Q", 4.8, -7.8, 7.6, -6.6], ["L", 8.2, -2.5], ["Q", 8.5, -0.5, 6.4, 0], ["L", 2, 0], ["Q", 0.8, -1.1, 1.3, -2.8]]), SK);
      [-1, 1].forEach((toe) => ln(f([[3.2 + toe * 1.8, -2.4], [3.3 + toe * 1.8, -0.6]]), K, 0.35));
    }
    else { PT(F([["M", 1.7, -7], ["Q", 4.6, -7.8, 7.6, -7], ["Q", 10.8, -6, 13.1, -3.6], ["Q", 14.3, -1.6, 13.3, 0], ["L", 2.1, 0], ["Q", 1.1, 0, 1.2, -1.4]]), Z.c); dots(f([[8.4, -4.4], [10.4, -3.6], [12, -2.4]]), 0.55, K); }
  });

  /* pantalón o falda, encima del zapato */
  if (B.k === "flare") both([["M", 0, -31.5], ["L", 8.6, -31.5], ["C", 8.6, -22, 7.4, -15, 9.2, -4.6], ["Q", 4.8, -3.6, 0.2, -4.6], ["C", 1.4, -15, 0.3, -22, 0, -31.5]], B.c);
  else if (B.k === "skirt") PT([["M", -8.6, -32], ["Q", 0, -33.4, 8.6, -32], ["Q", 11.6, -26, 13, -21.6], ["Q", 0, -19.4, -13, -21.6], ["Q", -11.6, -26, -8.6, -32]], B.c);
  else if (B.k === "midi") { PT([["M", -8.6, -32], ["Q", 0, -33.4, 8.6, -32], ["Q", 13.6, -22, 16.6, -13.4], ["Q", 0, -10.6, -16.6, -13.4], ["Q", -13.6, -22, -8.6, -32]], B.c); dots([[-7, -25], [0, -28], [7, -24], [-11, -17], [-3, -19], [5, -15], [11, -18]], 1.4); }
  else if (B.k === "jogger") { both([["M", 0, -31.5], ["L", 8.8, -31.5], ["C", 8.8, -22, 8.2, -14, 7.5, -9.6], ["Q", 4.8, -9, 2, -9.6], ["C", 1.3, -14, 0.3, -22, 0, -31.5]], B.c); both([["M", 2.1, -9.9], ["Q", 4.8, -10.5, 7.4, -9.9], ["L", 7.1, -6.6], ["Q", 4.8, -6, 2.4, -6.6]], "#C9CED3"); }
  else if (B.k === "plaid") {
    const leg: Cmd[] = [["M", 0, -31.5], ["L", 8.6, -31.5], ["C", 8.6, -22, 8.1, -13, 7.6, -5.2], ["Q", 4.8, -4.3, 1.8, -5.2], ["C", 1.2, -13, 0.3, -22, 0, -31.5]];
    [-1, 1].forEach((side) => {
      x.save();
      x.scale(side, 1);
      trace(leg); x.clip();
      x.fillStyle = B.c; x.fillRect(0, -32 * u, 9 * u, 28 * u);
      for (let y = -30; y < -3; y += 6) { x.fillStyle = "#151515"; x.fillRect(0, y * u, 9 * u, 3 * u); }
      for (let col = 0; col < 3; col++) for (let y = -30; y < -3; y += 12) { x.fillStyle = "#151515"; x.fillRect((1.5 + col * 3) * u, y * u, 1.5 * u, 6 * u); }
      x.restore();
    });
    [-1, 1].forEach((side) => { x.save(); x.scale(side, 1); trace(leg); x.strokeStyle = K; x.lineWidth = lw; x.stroke(); x.restore(); });
    ln([[-8.5, -31], [8.5, -31]], K, 0.8);
    ln([[-3, -29.2], [0, -27.8], [3, -29.2]], K, 0.65);
    ln([[-1.8, -28], [-2.2, -24.5]], K, 0.65); ln([[1.8, -28], [2.2, -24.5]], K, 0.65);
  } else both([["M", 0, -31.5], ["L", 8.6, -31.5], ["C", 8.8, -22, 7.8, -13, 7.6, -5.2], ["Q", 4.8, -4.3, 1.8, -5.2], ["C", 1.5, -13, 0.3, -22, 0, -31.5]], B.c);

  /* brazos curvos y manos de guante con deditos */
  const armP = (s: number): Pt[] => (up ? [[s * 7.2, -46.8], [s * 14, -51.5], [s * 17, -62.5]] : [[s * 7.2, -46.4], [s * 13, -41], [s * 15.5, -31.5]]);
  const hand = (s: number) => {
    const p = armP(s), m = p[1], e = p[2], ang = Math.atan2(e[1] - m[1], e[0] - m[0]);
    const hx = e[0] + Math.cos(ang) * 1.9, hy = e[1] + Math.sin(ang) * 1.9;
    const b: [number, number, number][] = [[0, 0, 2.6]];
    [-0.78, -0.26, 0.26, 0.78].forEach((o, i) => { const L = i === 1 || i === 2 ? 3.2 : 2.8; b.push([Math.cos(ang + o) * L, Math.sin(ang + o) * L, 1.3]); });
    const ta = ang + s * (up ? -1.55 : 1.55);
    b.push([Math.cos(ta) * 2.5, Math.sin(ta) * 2.5, 1.2]);
    x.fillStyle = K;
    b.forEach((c) => { x.beginPath(); x.arc((hx + c[0]) * u, (hy + c[1]) * u, c[2] * u + lw * 0.85, 0, 7); x.fill(); });
    x.fillStyle = SK;
    b.forEach((c) => { x.beginPath(); x.arc((hx + c[0]) * u, (hy + c[1]) * u, c[2] * u, 0, 7); x.fill(); });
  };
  [-1, 1].forEach((s) => limb(armP(s), T.long ? 3.2 : 2.6, T.long ? T.c : SK));

  /* cuello a la vista y camiseta con cintura */
  PT([["M", -1.7, -56], ["L", 1.7, -56], ["L", 1.9, -47.4], ["L", -1.9, -47.4]], SK);
  const TOR: Cmd[] = [["M", -5.6, -48.6], ["Q", 0, -49.6, 5.6, -48.6], ["Q", 8.4, -48, 8.2, -44.5], ["C", 8, -40.5, 6.4, -38, 7.6, -32.5], ["Q", 8.8, -28.8, 7.2, -28.2], ["L", -7.2, -28.2], ["Q", -8.8, -28.8, -7.6, -32.5], ["C", -6.4, -38, -8, -40.5, -8.2, -44.5], ["Q", -8.4, -48, -5.6, -48.6]];
  if (T.k === "ruana") {
    PT([["M", -5.6, -49], ["Q", 0, -50.4, 5.6, -49], ["Q", 14, -41, 18.5, -33], ["Q", 9, -27.6, 0, -28], ["Q", -9, -27.6, -18.5, -33], ["Q", -14, -41, -5.6, -49]], T.c);
    x.strokeStyle = "#F3E2BF";
    x.lineWidth = u * 1.1;
    [-43, -38, -33.5].forEach((y) => { const w2 = 5.6 + ((y + 49) * 12.9) / 16 - 1.6; x.beginPath(); x.moveTo(-w2 * u, y * u); x.quadraticCurveTo(0, (y + 1) * u, w2 * u, y * u); x.stroke(); });
    x.strokeStyle = K;
    x.lineWidth = lw;
  } else {
    if (!T.long) [-1, 1].forEach((s) => { const p = armP(s), a2 = Math.atan2(p[1][1] - p[0][1], p[1][0] - p[0][0]); E(s * 8.4 + Math.cos(a2), (up ? -47.6 : -45.6) + Math.sin(a2), 3.4, 2.6, T.c, false, a2); });
    PT(TOR, T.c);
    x.save();
    trace(TOR);
    x.clip();
    if (T.k === "tri") { x.fillStyle = "#1747B5"; x.fillRect(-10 * u, -40.6 * u, 20 * u, 2.4 * u); x.fillStyle = "#D81E27"; x.fillRect(-10 * u, -38.2 * u, 20 * u, 2.4 * u); }
    if (T.k === "zig") { x.strokeStyle = "#fff"; x.lineWidth = u * 1.2; x.beginPath(); for (let i = 0; i <= 7; i++) x.lineTo((-9 + i * 2.6) * u, (i % 2 ? -42.5 : -39) * u); x.stroke(); }
    if (T.k === "dots") dots([[-4, -44.5], [3, -45.5], [0, -40], [-3.5, -34], [4, -33], [-5.5, -30.5], [5.4, -39]], 1.2);
    x.globalAlpha = 0.25;
    ln([[2.6, -43], [3.8, -38.5]], K, 0.8);
    x.globalAlpha = 1;
    x.restore();
    trace(TOR);
    x.strokeStyle = K;
    x.lineWidth = lw;
    x.stroke();
    x.beginPath(); x.moveTo(-3.4 * u, -48.9 * u); x.quadraticCurveTo(0, -45.8 * u, 3.4 * u, -48.9 * u); x.stroke();
    if (T.k === "zig") dots([[0, -34]], 1.3, "#D81E27");
    if (T.k === "btn") dots([[0, -44], [0, -40], [0, -36]], 0.9, "#FFC918");
  }
  hand(-1);
  hand(1);

  /* capucha y cara */
  if (HD.k === "none") {
    E(-14.5, -73, 3, 4, SK); E(14.5, -73, 3, 4, SK);
    PT([["M", -14, -84], ["C", -22, -97, -19, -108, -9, -108], ["Q", -3, -109, 0, -103], ["C", 8, -111, 19, -105, 20, -96], ["C", 22, -87, 17, -78, 15, -72], ["L", 15, -64], ["Q", 14, -59, 11, -60], ["Q", 8, -61, 9, -68], ["L", 9, -81], ["Q", 0, -91, -9, -81], ["L", -9, -68], ["Q", -9, -61, -12, -60], ["Q", -16, -60, -15, -65]], HA);
    E(-13, -62, 5, 6, HA); E(13, -62, 5, 6, HA);
  }
  if (HD.k === "arbol") {
    x.fillStyle = "#1FA04B";
    x.beginPath(); x.moveTo(0, -101 * u); x.quadraticCurveTo(21 * u, -92 * u, 22.5 * u, -63 * u); x.quadraticCurveTo(15 * u, -50 * u, 0, -51 * u); x.quadraticCurveTo(-15 * u, -50 * u, -22.5 * u, -63 * u); x.quadraticCurveTo(-21 * u, -92 * u, 0, -101 * u); x.fill(); x.stroke();
    ([[-19, -84], [19, -84], [-23, -66], [23, -66]] as Pt[]).forEach((p) => E(p[0], p[1], 2.5, 2.5, "#D81E27"));
    x.fillStyle = "#FFD23A"; starPath(x, 0, -102.5 * u, 5.6 * u, 5, 0.45); x.fill(); x.stroke();
  }
  if (HD.k === "noel") { limb([[2, -96], [21, -104], [26.5, -89]], 5.5, "#C3161E"); E(26.5, -86, 2.7, 2.7, "#FFC918"); E(0, -75, 21, 23, "#C3161E"); E(0, -73.5, 17, 20, "#fff"); }
  if (HD.k === "reno") {
    [-1, 1].forEach((s) => { limb([[s * 8, -95], [s * 11, -104], [s * 16, -108]], 2.5, "#D81E27"); limb([[s * 11.5, -102], [s * 6.5, -107]], 2.1, "#D81E27"); E(s * 20, -90, 5.2, 3.2, "#FFF6DC", false, s * 0.6); E(s * 20, -90, 3, 1.5, "#F0A0A8", true, s * 0.6); });
    E(0, -75, 21, 23, "#FFF6DC");
  }
  const im = a.face ? getImg(a.face, redraw) : null;
  x.save();
  x.beginPath(); x.ellipse(0, -73 * u, 14.5 * u, 17 * u, 0, 0, 7); x.clip();
  if (im && im.complete && im.naturalWidth) {
    const bw = 29 * u, bh = 34 * u, q = Math.max(bw / im.naturalWidth, bh / im.naturalHeight), sw = bw / q, sh = bh / q;
    x.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, -14.5 * u, -90 * u, bw, bh);
  } else {
    x.fillStyle = SK; x.fillRect(-15 * u, -90 * u, 30 * u, 34 * u);
    if (HD.k !== "none") { x.fillStyle = HA; x.beginPath(); x.ellipse(-4 * u, -91 * u, 15 * u, 9.5 * u, -0.2, 0, 7); x.fill(); }
    E(-5, -73, 1.5, 2, K, true); E(5, -73, 1.5, 2, K, true);
    x.globalAlpha = 0.55; E(-8, -68, 2.6, 1.9, "#F0787F", true); E(8, -68, 2.6, 1.9, "#F0787F", true); x.globalAlpha = 1;
    x.fillStyle = "#D81E27"; x.beginPath(); x.moveTo(-5 * u, -66.5 * u); x.quadraticCurveTo(0, -59 * u, 5 * u, -66.5 * u); x.quadraticCurveTo(0, -64 * u, -5 * u, -66.5 * u); x.fill(); x.lineWidth = lw * 0.7; x.stroke(); x.lineWidth = lw;
  }
  if (HD.k === "none") {
    x.fillStyle = HA;
    x.beginPath(); x.moveTo(-14 * u, -84 * u); x.quadraticCurveTo(-9 * u, -94 * u, -1 * u, -98 * u); x.quadraticCurveTo(-3 * u, -89 * u, -10 * u, -83 * u); x.lineTo(-10 * u, -70 * u); x.quadraticCurveTo(-12 * u, -66 * u, -15 * u, -69 * u); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(14 * u, -84 * u); x.quadraticCurveTo(9 * u, -94 * u, 1 * u, -98 * u); x.quadraticCurveTo(3 * u, -89 * u, 10 * u, -83 * u); x.lineTo(10 * u, -70 * u); x.quadraticCurveTo(12 * u, -66 * u, 15 * u, -69 * u); x.closePath(); x.fill();
  }
  x.restore();
  x.beginPath(); x.ellipse(0, -73 * u, 14.5 * u, 17 * u, 0, 0, 7); x.stroke();
  x.restore();
}
