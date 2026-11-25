import { BOTTOMS, HOODS, SHOES, SKINS, TOPS, type AvatarLook } from "@/data/avatar-options";
import { getImg } from "@/lib/media";
import { starPath } from "./shapes";

type Pt = [number, number];
type Cmd = [string, ...number[]];

/** Dibuja la figura alta, de contorno simple, usada como base para las muñequitas. */
export function drawAvatar(
  x: CanvasRenderingContext2D, a: AvatarLook, cx: number, footY: number, hh: number,
  up: boolean, sc = 1, redraw?: () => void,
) {
  if (sc === 0) return;
  const u = hh / 100;
  const T = TOPS[a.top] || TOPS[0], B = BOTTOMS[a.bottom] || BOTTOMS[0];
  const Z = SHOES[a.shoes] || SHOES[0], HD = HOODS[a.hood] || HOODS[HOODS.length - 1];
  const SK = SKINS[a.skin]?.c || SKINS[0].c;
  const K = "#111111", HA = "#101010", lw = Math.max(1.6, u * 0.9);

  x.save();
  x.translate(cx, footY);
  if (sc !== 1) x.scale(sc, sc);
  x.lineJoin = "round";
  x.lineCap = "round";
  x.strokeStyle = K;
  x.lineWidth = lw;

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
  const path = (cmds: Cmd[], fill: string, outline = true) => {
    trace(cmds); x.fillStyle = fill; x.fill();
    if (outline) { x.strokeStyle = K; x.lineWidth = lw; x.stroke(); }
  };
  const mirrored = (cmds: Cmd[], side: number): Cmd[] => cmds.map((c) => [c[0], ...c.slice(1).map((n, i) => (i % 2 ? n as number : (n as number) * side))] as Cmd);
  const line = (pts: Pt[], color = K, width = 0.65) => {
    x.beginPath(); pts.forEach(([px, py], i) => i ? x.lineTo(px * u, py * u) : x.moveTo(px * u, py * u));
    x.strokeStyle = color; x.lineWidth = width * u; x.stroke(); x.strokeStyle = K; x.lineWidth = lw;
  };
  const ellipse = (px: number, py: number, rx: number, ry: number, fill: string) => {
    x.beginPath(); x.ellipse(px * u, py * u, rx * u, ry * u, 0, 0, Math.PI * 2);
    x.fillStyle = fill; x.fill(); x.strokeStyle = K; x.lineWidth = lw; x.stroke();
  };

  /* Pies y piernas, largos y rectos como en la referencia. */
  const bareFoot: Cmd[] = [["M", 1.5, -6], ["Q", 4, -7.2, 7.2, -6], ["L", 8.2, -2.3], ["Q", 8.8, 0, 5.8, 0], ["L", 1.2, 0], ["Q", 0, -1, 0.8, -3.2]];
  [-1, 1].forEach((side) => {
    path(mirrored(bareFoot, side), Z.k === "bare" ? SK : Z.c);
    if (Z.k === "bare") {
      [2.4, 4.3, 6.2].forEach((toe) => line([[side * toe, -2.8], [side * (toe + 0.15), -0.8]], K, 0.42));
    } else if (Z.k === "tenis") {
      line([[side * 1.5, -1.8], [side * 7.4, -1.8]], "#D8D4CC", 1.25);
      line([[side * 3.1, -4.2], [side * 6.2, -3.5]], "#1747B5", 0.55);
    } else if (Z.k === "boot") {
      path(mirrored([["M", 1.5, -8], ["L", 7.1, -8], ["L", 7.5, -2], ["Q", 7.5, 0, 5.5, 0], ["L", 1, 0]], side), Z.c);
    } else if (Z.k === "heel") {
      line([[side * 1.5, -2], [side * 7.5, -2], [side * 9, -0.6]], Z.c, 1.3);
      line([[side * 2.2, -2], [side * 1.5, 0]], Z.c, 0.7);
    } else if (Z.k === "sock") {
      line([[side * 1.7, -5.5], [side * 7.2, -4.8]], "#1747B5", 1.4);
    } else {
      line([[side * 3, -2.6], [side * 6.5, -1.6]], K, 0.6);
    }
  });

  const leg: Cmd[] = [["M", 0.45, -36], ["L", 9.7, -36], ["C", 9.7, -25, 9.3, -14, 8.8, -5.5], ["Q", 5, -4.8, 0.8, -5.5], ["C", 0.6, -16, 0.4, -26, 0.45, -36]];
  if (B.k === "skirt" || B.k === "midi") {
    const skirt: Cmd[] = [["M", -12, -38], ["Q", 0, -40, 12, -38], ["Q", 15, -27, 16, B.k === "midi" ? -17 : -23], ["Q", 0, B.k === "midi" ? -14 : -21, -16, B.k === "midi" ? -17 : -23], ["Q", -15, -29, -12, -38]];
    path(skirt, B.c);
    if (B.k === "midi") [-10, -5, 0, 5, 10].forEach((px, i) => ellipse(px, -26 + (i % 2) * 4, 0.8, 0.8, "#FFE7B0"));
  } else {
    [-1, 1].forEach((side) => {
      if (B.k === "plaid") {
        x.save(); x.scale(side, 1); trace(leg); x.clip();
        x.fillStyle = B.c; x.fillRect(0, -37 * u, 10 * u, 34 * u);
        for (let y = -36, row = 0; y < -3; y += 6.5, row++) {
          x.fillStyle = "#111111"; x.fillRect(0, y * u, 10 * u, 3.2 * u);
          for (let col = row % 2 ? 0 : 1; col < 4; col += 2) x.fillRect(col * 2.6 * u, y * u, 2.6 * u, 6.5 * u);
        }
        x.restore();
        x.save(); x.scale(side, 1); trace(leg); x.strokeStyle = K; x.lineWidth = lw; x.stroke(); x.restore();
      } else if (B.k === "flare") {
        const flare: Cmd[] = [["M", 0.45, -36], ["L", 9.7, -36], ["C", 9, -24, 8.8, -17, 11, -5], ["Q", 5, -4, 0.5, -5], ["C", 0.7, -17, 0.4, -26, 0.45, -36]];
        path(mirrored(flare, side), B.c);
      } else if (B.k === "jogger") {
        path(mirrored(leg, side), B.c);
        line([[side * 2.1, -7], [side * 7.5, -7]], "#D3D3D3", 0.7);
      } else path(mirrored(leg, side), B.c);
    });
    if (B.k === "plaid") {
      line([[-9.5, -36], [9.5, -36]], K, 0.8);
      line([[-3.8, -34.8], [-1, -33.4], [0, -34.3], [1, -33.4], [3.8, -34.8]], K, 0.75);
      line([[-1.3, -33.5], [-1.8, -29.8]], K, 0.7); line([[1.3, -33.5], [1.8, -29.8]], K, 0.7);
    }
  }

  /* Brazos estrechos, manos abiertas y dedos dibujados con el mismo trazo negro. */
  const arm: Cmd[] = up
    ? [["M", 14, -58], ["Q", 17, -58, 18, -54], ["L", 20, -70], ["Q", 21, -75, 24, -77], ["Q", 27, -79, 28, -76], ["Q", 29, -74, 26, -72], ["L", 24, -62], ["Q", 23, -54, 20, -48], ["L", 18, -43], ["L", 13, -47]]
    : [["M", 14, -58], ["Q", 17, -59, 18, -55], ["L", 19.5, -40], ["Q", 20, -34, 22, -28], ["L", 26, -13], ["Q", 27, -10, 30, -9], ["Q", 34, -8, 33, -5], ["Q", 32, -2, 29, -4], ["Q", 31, 0, 28, 0], ["Q", 25, 0, 25, -3], ["Q", 24, 1, 21, -1], ["Q", 19, -3, 20, -7], ["L", 16, -19], ["Q", 13, -31, 12.5, -39], ["L", 12.5, -54]];
  [-1, 1].forEach((side) => {
    path(mirrored(arm, side), SK);
    if (T.long) {
      const sleeve: Cmd[] = [["M", 13.5, -59], ["Q", 18, -60, 19, -56], ["L", 20.2, -47], ["Q", 17, -44, 12.7, -46], ["L", 12.5, -54]];
      path(mirrored(sleeve, side), T.c);
    }
    const elbowY = up ? -48 : -40;
    line([[side * 17, elbowY], [side * 19, elbowY + 0.7]], K, 0.55);
  });

  /* Cuello y camiseta. */
  path([["M", -4.5, -72], ["L", 4.5, -72], ["L", 4.2, -64], ["Q", 0, -61, -4.2, -64]], SK);
  const shirt: Cmd[] = [["M", -5, -67], ["Q", 0, -64, 5, -67], ["L", 11, -65], ["Q", 16, -64, 17, -60], ["L", 20, -49], ["Q", 17, -46, 13, -47], ["L", 13, -36], ["Q", 0, -34, -13, -36], ["L", -13, -47], ["Q", -17, -46, -20, -49], ["L", -17, -60], ["Q", -16, -64, -11, -65]];
  path(shirt, T.c);
  x.save(); trace(shirt); x.clip();
  if (T.k === "tri") { x.fillStyle = "#1747B5"; x.fillRect(-22 * u, -48 * u, 44 * u, 3.8 * u); x.fillStyle = "#D81E27"; x.fillRect(-22 * u, -44.2 * u, 44 * u, 3.8 * u); }
  if (T.k === "zig") { x.strokeStyle = "#FFF"; x.lineWidth = 1.4 * u; x.beginPath(); for (let i = 0; i <= 10; i++) x.lineTo((-20 + i * 4) * u, (i % 2 ? -56 : -52) * u); x.stroke(); }
  if (T.k === "dots") [-8, -2, 5, 10].forEach((px, i) => ellipse(px, -56 + (i % 2) * 6, 0.9, 0.9, "#FFF2B0"));
  if (T.k === "btn") [-57, -52, -47].forEach((py) => ellipse(0, py, 0.55, 0.55, "#FFC918"));
  x.restore();
  if (T.k === "ruana") {
    line([[-11, -62], [-15, -48], [-13, -36]], "#F3E2BF", 1.1);
    line([[11, -62], [15, -48], [13, -36]], "#F3E2BF", 1.1);
  }

  /* Cabello partido al centro, mechones a los lados y rostro liso. */
  const head: Cmd[] = [["M", 0, -101], ["C", -6, -108, -18, -106, -21, -97], ["C", -24, -89, -21, -79, -18, -76], ["L", -16, -67], ["Q", -15, -63, -12, -64], ["Q", -9, -65, -10, -71], ["L", -10, -82], ["Q", 0, -90, 10, -82], ["L", 10, -71], ["Q", 9, -65, 12, -64], ["Q", 15, -63, 16, -67], ["L", 18, -76], ["C", 22, -82, 24, -92, 20, -100], ["C", 15, -108, 6, -107, 0, -101]];
  if (HD.k === "none") {
    ellipse(-15.5, -81, 4.2, 5.2, SK); ellipse(15.5, -81, 4.2, 5.2, SK);
    path(head, HA);
    ellipse(-13, -69, 6, 5.4, HA); ellipse(13, -69, 6, 5.4, HA);
  }
  if (HD.k === "arbol") {
    path([["M", 0, -108], ["Q", 20, -100, 22, -78], ["Q", 14, -67, 0, -68], ["Q", -14, -67, -22, -78], ["Q", -20, -100, 0, -108]], "#1FA04B");
    [[-17, -91], [17, -91], [-21, -78], [21, -78]].forEach(([px, py]) => ellipse(px, py, 1.7, 1.7, "#D81E27"));
    x.fillStyle = "#FFD23A"; starPath(x, 0, -108 * u, 4.2 * u, 5, 0.45); x.fill(); x.stroke();
  } else if (HD.k === "noel") {
    path([["M", -18, -88], ["Q", -10, -105, 5, -104], ["Q", 18, -102, 19, -88], ["Q", 0, -83, -18, -88]], "#C3161E");
    line([[-19, -87], [19, -87]], "#FFF", 3.4); ellipse(5, -104, 2.4, 2.4, "#FFF");
  } else if (HD.k === "reno") {
    [-1, 1].forEach((side) => { line([[side * 8, -96], [side * 11, -105], [side * 16, -108]], "#8A5A32", 1.7); line([[side * 12, -102], [side * 7, -106]], "#8A5A32", 1.5); });
    ellipse(0, -91, 19, 4, "#8A5A32");
  }

  const face: Cmd[] = [["M", 0, -96], ["Q", 9, -96, 13, -89], ["L", 13, -79], ["Q", 12, -70, 7, -66], ["Q", 0, -62, -7, -66], ["Q", -12, -70, -13, -79], ["L", -13, -89], ["Q", -9, -96, 0, -96]];
  const image = a.face ? getImg(a.face, redraw) : null;
  x.save(); trace(face); x.clip(); x.fillStyle = SK; x.fill();
  if (image?.complete && image.naturalWidth) {
    const w = 26 * u, h = 31 * u, scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
    const sw = w / scale, sh = h / scale;
    x.drawImage(image, (image.naturalWidth - sw) / 2, (image.naturalHeight - sh) / 2, sw, sh, -13 * u, -96 * u, w, h);
  }
  x.restore();
  trace(face); x.strokeStyle = K; x.lineWidth = lw; x.stroke();

  /* El corte queda visible alrededor de la cara, como en el dibujo de referencia. */
  if (HD.k === "none") {
    path([["M", -13, -88], ["C", -12, -98, -6, -103, -1, -104], ["Q", -4, -96, -10, -90], ["L", -10, -78], ["Q", -11, -73, -14, -74]], HA, false);
    path([["M", 13, -88], ["C", 12, -98, 6, -103, 1, -104], ["Q", 4, -96, 10, -90], ["L", 10, -78], ["Q", 11, -73, 14, -74]], HA, false);
  }

  x.restore();
}
