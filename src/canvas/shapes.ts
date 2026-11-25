/* Utilidades de dibujo compartidas por la muñequita, el confeti y el videíto. */

/** Número "al azar" pero siempre igual para la misma semilla (así el dibujo no cambia en cada cuadro) */
export const rnd = (i: number) => {
  const v = Math.sin(i * 127.1 + 3.7) * 43758.5453;
  return v - Math.floor(v);
};

export function starPath(x: CanvasRenderingContext2D, cx: number, cy: number, r: number, n: number, inner: number) {
  x.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n - Math.PI / 2, q = i % 2 ? r * inner : r;
    x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q);
  }
  x.closePath();
}

/** Entrada con un pequeño rebote */
export const ease = (p: number) => {
  p = Math.max(0, Math.min(1, p));
  if (!p) return 0;
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
};

export const prefersCalm = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
