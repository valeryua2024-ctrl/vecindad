import type { FaceCrop } from "./state";

/* Busca la cara en la foto que sube cada vecina y la recorta para meterla en la capucha.
   Usa el detector del navegador si existe; si no, tracking.js (se carga desde cdnjs en AdventApp). */

interface Box { x: number; y: number; width: number; height: number }
declare global {
  interface Window {
    FaceDetector?: new (o: { fastMode: boolean }) => { detect(c: HTMLCanvasElement): Promise<{ boundingBox: Box }[]> };
    tracking?: {
      ObjectTracker: new (kind: string) => {
        setInitialScale(v: number): void;
        setStepSize(v: number): void;
        setEdgesDensity(v: number): void;
        on(ev: "track", cb: (e: { data: Box[] }) => void): void;
      };
      track(el: HTMLCanvasElement, tracker: unknown): void;
    };
  }
}

/** Abre la foto y la reduce a un tamaño manejable */
export function loadPhoto(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(fr.error);
    fr.onload = () => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, 720 / Math.max(im.width, im.height));
        const c = document.createElement("canvas");
        c.width = Math.round(im.width * k);
        c.height = Math.round(im.height * k);
        c.getContext("2d")!.drawImage(im, 0, 0, c.width, c.height);
        resolve(c);
      };
      im.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  });
}

export async function findFace(c: HTMLCanvasElement): Promise<FaceCrop | null> {
  try {
    if (window.FaceDetector) {
      const found = await new window.FaceDetector({ fastMode: true }).detect(c);
      if (found.length) {
        const b = found.sort((p, q) => q.boundingBox.width - p.boundingBox.width)[0].boundingBox;
        return { cx: b.x + b.width / 2, cy: b.y + b.height / 2, w: b.width };
      }
    }
  } catch { /* el navegador no lo soporta */ }
  try {
    const tracking = window.tracking;
    if (tracking?.ObjectTracker) {
      const k = Math.min(1, 320 / Math.max(c.width, c.height));
      const m = document.createElement("canvas");
      m.width = Math.round(c.width * k);
      m.height = Math.round(c.height * k);
      m.getContext("2d")!.drawImage(c, 0, 0, m.width, m.height);
      let best: Box | null = null;
      const tr = new tracking.ObjectTracker("face");
      tr.setInitialScale(1.5);
      tr.setStepSize(1.4);
      tr.setEdgesDensity(0.1);
      tr.on("track", (e) => e.data.forEach((r) => { if (!best || r.width > best.width) best = r; }));
      tracking.track(m, tr);
      await new Promise((r) => setTimeout(r, 60));
      const b = best as Box | null;
      if (b) return { cx: (b.x + b.width / 2) / k, cy: (b.y + b.height / 2) / k, w: b.width / k };
    }
  } catch { /* sin detector */ }
  return null;
}

/** Punto de partida del recorte: la cara encontrada, o el centro de la foto si no se encontró */
export function initialCrop(c: HTMLCanvasElement, f: FaceCrop | null): FaceCrop {
  return f ? { cx: f.cx, cy: f.cy + f.w * 0.03, w: f.w * 1.12 } : { cx: c.width / 2, cy: c.height * 0.42, w: Math.min(c.width, c.height) * 0.55 };
}

/** Recorta la cara al tamaño de la capucha, con el tono de piel de fondo */
export function cropFace(src: string, fc: FaceCrop, skin: string): Promise<string> {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas");
      c.width = 330;
      c.height = 406;
      const x = c.getContext("2d")!;
      const cw = fc.w, ch = (cw * 406) / 330;
      x.fillStyle = skin;
      x.fillRect(0, 0, 330, 406);
      x.drawImage(im, fc.cx - cw / 2, fc.cy - ch / 2, cw, ch, 0, 0, 330, 406);
      resolve(c.toDataURL("image/jpeg", 0.88));
    };
    im.src = src;
  });
}
