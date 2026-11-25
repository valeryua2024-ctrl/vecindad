import { PAL } from "@/data/days";
import { prefersCalm, starPath } from "./shapes";

/* Confeti de estrellitas y papelitos sobre toda la pantalla. */
let raf = 0;

export function boom(c: HTMLCanvasElement | null) {
  if (!c || prefersCalm()) return;
  const x = c.getContext("2d");
  if (!x) return;
  c.width = innerWidth;
  c.height = innerHeight;
  const P = Array.from({ length: 80 }, (_, i) => ({
    x: c.width / 2, y: c.height * 0.5, vx: (Math.random() - 0.5) * 18, vy: -Math.random() * 15 - 4,
    r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, s: 9 + Math.random() * 10, c: PAL[i % 6], k: i % 2,
  }));
  let n = 0;
  cancelAnimationFrame(raf);
  const frame = () => {
    x.clearRect(0, 0, c.width, c.height);
    for (const p of P) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.45; p.r += p.vr;
      x.save();
      x.translate(p.x, p.y);
      x.rotate(p.r);
      x.fillStyle = p.c;
      x.strokeStyle = "#161616";
      x.lineWidth = 2;
      if (p.k) { x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.strokeRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
      else { starPath(x, 0, 0, p.s * 0.8, 5, 0.45); x.fill(); x.stroke(); }
      x.restore();
    }
    if (++n < 120) raf = requestAnimationFrame(frame);
    else x.clearRect(0, 0, c.width, c.height);
  };
  frame();
}
