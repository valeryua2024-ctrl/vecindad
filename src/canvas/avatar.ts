import { BOTTOMS, HOODS, SHOES, SKINS, TOPS, type AvatarLook } from "@/data/avatar-options";
import { getImg, getTintedImg } from "@/lib/media";
import { starPath } from "./shapes";
import { CHARACTER_TEMPLATES } from "@/data/character-templates";

type Pt = [number, number];
type Cmd = [string, ...number[]];

/* Usa la ilustración de referencia como cuerpo completo. Solo se dibujan encima
   las prendas y accesorios que la vecina cambie en el personalizador. */
export function drawAvatar(
  x: CanvasRenderingContext2D, a: AvatarLook, cx: number, footY: number, hh: number,
  up: boolean, sc = 1, redraw?: () => void,
) {
  if (sc === 0) return;
  void up;
  if (a.templateId) {
    const template = CHARACTER_TEMPLATES.find((item) => item.id === a.templateId);
    if (template) {
      const art = getImg(template.src, redraw);
      const face = a.face ? getImg(a.face, redraw) : null;
      if (!art.complete || !art.naturalWidth) return;
      const h = hh * 1.14, w = h * art.naturalWidth / art.naturalHeight, top = footY - h, left = cx - w / 2;
      x.drawImage(art, left, top, w, h);
      if (face?.complete && face.naturalWidth) {
        const f = template.face, faceCx = left + f.x * w, faceCy = top + f.y * h, fw = f.w * w, fh = f.h * h;
        const faceX = faceCx - fw / 2, faceY = faceCy - fh / 2;
        x.save(); x.beginPath(); x.ellipse(faceCx, faceCy, fw / 2, fh / 2, 0, 0, Math.PI * 2); x.clip();
        const q = Math.max(fw / face.naturalWidth, fh / face.naturalHeight), sw = fw / q, sh = fh / q;
        x.drawImage(face, (face.naturalWidth - sw) / 2, (face.naturalHeight - sh) / 2, sw, sh, faceX, faceY, fw, fh);
        x.restore();
      }
      return;
    }
  }
  const u = hh / 100;
  const T = TOPS[a.top] || TOPS[TOPS.length - 1];
  const B = BOTTOMS[a.bottom] || BOTTOMS[BOTTOMS.length - 1];
  const Z = SHOES[a.shoes] || SHOES[SHOES.length - 1];
  const HD = HOODS[a.hood] || HOODS[HOODS.length - 1];
  const skinColor = SKINS[a.skin]?.c || SKINS[0].c;
  const lines = getImg("/avatars/base-lines.png", redraw);
  const skin = getTintedImg("/avatars/skin-mask.png", skinColor, redraw);
  if (!skin || !lines.complete || !lines.naturalWidth) return;

  x.save();
  x.translate(cx, footY);
  if (sc !== 1) x.scale(sc, sc);
  const pixel = 1.06 * u / 14.86;
  const imgX = -512 * pixel, imgY = -1497 * pixel;
  const imgW = 1024 * pixel, imgH = 1536 * pixel;
  x.drawImage(skin, imgX, imgY, imgW, imgH);
  x.drawImage(lines, imgX, imgY, imgW, imgH);

  const K = "#111111", lw = Math.max(1.6, u * 0.9);
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
  const fillPath = (cmds: Cmd[], color: string, outline = true) => {
    trace(cmds); x.fillStyle = color; x.fill();
    if (outline) { x.strokeStyle = K; x.lineWidth = lw; x.stroke(); }
  };
  const mirror = (cmds: Cmd[], side: number): Cmd[] => cmds.map((c) => [c[0], ...c.slice(1).map((n, i) => i % 2 ? n as number : (n as number) * side)] as Cmd);
  const line = (pts: Pt[], color = K, width = 0.8) => {
    x.beginPath(); pts.forEach(([px, py], i) => i ? x.lineTo(px * u, py * u) : x.moveTo(px * u, py * u));
    x.strokeStyle = color; x.lineWidth = width * u; x.stroke(); x.strokeStyle = K; x.lineWidth = lw;
  };
  const dot = (px: number, py: number, r: number, color: string) => {
    x.beginPath(); x.arc(px * u, py * u, r * u, 0, Math.PI * 2); x.fillStyle = color; x.fill();
  };

  /* La imagen ya trae camiseta negra, pantalón a cuadros y pies descalzos.
     Estas capas conservan las demás prendas que ya se podían elegir. */
  if (T.k === "printed") {
    const tee = getImg("/avatars/tee-fiesta.png", redraw);
    if (tee.complete && tee.naturalWidth) {
      // Scale to cover the shoulders of the original base shirt underneath.
      const w = 36 * u, h = w * tee.naturalHeight / tee.naturalWidth;
      const top = -74.5 * u;
      x.drawImage(tee, -w / 2, top, w, h);

      // The shirt photo includes the back half of its collar. Cover that small
      // section with the avatar's skin so only the front collar remains visible.
      x.save();
      x.beginPath();
      x.moveTo(-5.2 * u, -74.2 * u);
      x.quadraticCurveTo(0, -72.2 * u, 5.2 * u, -74.2 * u);
      x.lineTo(4.6 * u, -71.5 * u);
      x.quadraticCurveTo(0, -70.4 * u, -4.6 * u, -71.5 * u);
      x.closePath();
      x.clip();
      x.drawImage(skin, imgX, imgY, imgW, imgH);
      x.restore();
    }
  } else if (T.k !== "plain") {
    const shirt: Cmd[] = [["M", -8.7, -72.4], ["Q", 0, -68.5, 8.7, -72.4], ["L", 12, -71.4], ["Q", 15.2, -70.5, 16.3, -67], ["L", 18.2, -59], ["Q", 16, -56.4, 13.2, -57.1], ["L", 11.7, -42], ["Q", 0, -40.4, -11.7, -42], ["L", -13.2, -57.1], ["Q", -16, -56.4, -18.2, -59], ["L", -16.3, -67], ["Q", -15.2, -70.5, -12, -71.4]];
    fillPath(shirt, T.c);
    x.save(); trace(shirt); x.clip();
    if (T.k === "tri") { x.fillStyle = "#1747B5"; x.fillRect(-20 * u, -53 * u, 40 * u, 3.2 * u); x.fillStyle = "#D81E27"; x.fillRect(-20 * u, -49.8 * u, 40 * u, 3.2 * u); }
    if (T.k === "zig") { x.strokeStyle = "#FFF"; x.lineWidth = 1.2 * u; x.beginPath(); for (let i = 0; i <= 8; i++) x.lineTo((-19 + i * 4.5) * u, (i % 2 ? -58 : -54) * u); x.stroke(); }
    if (T.k === "dots") [[-7, -62], [0, -57], [7, -62], [-5, -50], [5, -49]].forEach(([px, py]) => dot(px, py, 0.85, "#FFE6A3"));
    if (T.k === "btn") [-59, -54, -49].forEach((py) => dot(0, py, 0.55, "#FFC918"));
    x.restore();
    if (T.long) [-1, 1].forEach((side) => fillPath(mirror([["M", 12.8, -58], ["Q", 16.3, -60, 18, -56], ["L", 20, -38], ["Q", 18, -36, 14.8, -37], ["L", 12.3, -47]], side), T.c));
    if (T.k === "ruana") { line([[-10, -70], [-17, -55], [-13, -42]], "#F3E2BF", 1); line([[10, -70], [17, -55], [13, -42]], "#F3E2BF", 1); }
  }

  if (a.bottom !== BOTTOMS.length - 1) {
    if (B.k === "skirt" || B.k === "midi") {
      const hem = B.k === "midi" ? -10 : -19;
      fillPath([["M", -11.8, -42.8], ["Q", 0, -44.5, 11.8, -42.8], ["Q", 15, -30, 16, hem], ["Q", 0, hem - 2, -16, hem], ["Q", -15, -30, -11.8, -42.8]], B.c);
      if (B.k === "midi") [[-10, -28], [-4, -23], [3, -31], [9, -24], [0, -17]].forEach(([px, py]) => dot(px, py, 0.9, "#FFE5A5"));
    } else {
      const leg: Cmd[] = [["M", 0.5, -42.8], ["L", 11.3, -42.8], ["C", 11.2, -30, 10.6, -16, 10.2, -5.2], ["Q", 5.7, -4.3, 0.6, -5.2], ["C", 0.5, -17, 0.4, -30, 0.5, -42.8]];
      [-1, 1].forEach((side) => {
        if (B.k === "flare") fillPath(mirror([["M", 0.5, -42.8], ["L", 11.3, -42.8], ["C", 10.8, -28, 10.5, -18, 13, -5.2], ["Q", 6, -4.3, 0.5, -5.2], ["C", 0.5, -18, 0.4, -30, 0.5, -42.8]], side), B.c);
        else {
          fillPath(mirror(leg, side), B.c);
          if (B.k === "jogger") line([[side * 1.2, -7], [side * 9.5, -7]], "#D8D8D8", 0.8);
        }
      });
    }
  }

  if (Z.k !== "bare") {
    [-1, 1].forEach((side) => {
      const shoe: Cmd[] = [["M", 1, -5.4], ["Q", 4.4, -6.5, 7.5, -5.4], ["L", 8.4, -2.4], ["Q", 9, 0, 6, 0], ["L", 1, 0], ["Q", 0, -1, 0.6, -3.2]];
      if (Z.k === "boot") fillPath(mirror([["M", 1, -10], ["L", 8, -10], ["L", 8.4, -2.4], ["Q", 9, 0, 6, 0], ["L", 1, 0]], side), Z.c);
      else fillPath(mirror(shoe, side), Z.c);
      if (Z.k === "tenis") line([[side * 2, -2], [side * 7.5, -2]], "#DDD8CC", 1);
      if (Z.k === "sock") line([[side * 1.5, -4.8], [side * 7.5, -4]], "#1747B5", 1.3);
      if (Z.k === "heel") line([[side * 2, -2], [side * 8, -1], [side * 9, -0.3]], Z.c, 1.1);
    });
  }

  if (HD.k === "arbol") {
    fillPath([["M", 0, -110], ["Q", 18, -103, 20, -84], ["Q", 13, -76, 0, -78], ["Q", -13, -76, -20, -84], ["Q", -18, -103, 0, -110]], "#1FA04B");
    [[-15, -96], [15, -96], [-18, -85], [18, -85]].forEach(([px, py]) => dot(px, py, 1.5, "#D81E27"));
    x.fillStyle = "#FFD23A"; starPath(x, 0, -109 * u, 3.7 * u, 5, 0.45); x.fill(); x.stroke();
  } else if (HD.k === "noel") {
    fillPath([["M", -14, -88], ["Q", -10, -103, 2, -106], ["Q", 15, -103, 17, -87], ["Q", 0, -83, -14, -88]], "#C3161E");
    line([[-15, -87], [17, -87]], "#FFF", 2.8); dot(2, -106, 2, "#FFF");
  } else if (HD.k === "reno") {
    [-1, 1].forEach((side) => { line([[side * 6, -96], [side * 10, -105], [side * 15, -108]], "#8A5A32", 1.8); line([[side * 11, -102], [side * 6, -106]], "#8A5A32", 1.4); });
  }

  if (a.face) {
    const face = getImg(a.face, redraw);
    if (face.complete && face.naturalWidth) {
      x.save(); x.beginPath(); x.ellipse(0, -89.5 * u, 10.3 * u, 12.3 * u, 0, 0, Math.PI * 2); x.clip();
      const w = 20.6 * u, h = 24.6 * u, q = Math.max(w / face.naturalWidth, h / face.naturalHeight), sw = w / q, sh = h / q;
      x.drawImage(face, (face.naturalWidth - sw) / 2, (face.naturalHeight - sh) / 2, sw, sh, -10.3 * u, -101.8 * u, w, h);
      x.restore();
    }
  }
  x.restore();
}
