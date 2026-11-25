/* Imágenes y videos en memoria: fotos subidas, dibujitos convertidos en imagen para el lienzo
   y el video del gozo (día 16), que por ahora solo vive mientras la página está abierta. */

const imgCache: Record<string, HTMLImageElement> = {};
const tintCache: Record<string, HTMLCanvasElement> = {};

export function getImg(src: string, onLoad?: () => void): HTMLImageElement {
  let im = imgCache[src];
  if (!im) {
    im = new Image();
    im.src = src;
    imgCache[src] = im;
  }
  if (!im.complete && onLoad) im.addEventListener("load", onLoad, { once: true });
  return im;
}

/** Colorea una máscara blanca y reutiliza el resultado para todos los avatares. */
export function getTintedImg(src: string, color: string, onLoad?: () => void): HTMLCanvasElement | null {
  const key = src + color;
  if (tintCache[key]) return tintCache[key];
  const mask = getImg(src, onLoad);
  if (!mask.complete || !mask.naturalWidth) return null;
  const canvas = document.createElement("canvas");
  canvas.width = mask.naturalWidth;
  canvas.height = mask.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(mask, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "source-over";
  tintCache[key] = canvas;
  return canvas;
}

const iconCache: Record<string, HTMLImageElement> = {};
/** Convierte un dibujito de la hoja de símbolos en imagen, con sus colores, para pintarlo en el lienzo */
export function iconImg(name: string, a: string, b: string, onLoad?: () => void): HTMLImageElement {
  const key = name + a + b;
  if (iconCache[key]) return iconCache[key];
  const sym = document.getElementById("i-" + name);
  const inner = (sym ? sym.innerHTML : "")
    .replace(/class="fa"/g, `fill="${a}"`).replace(/class="fb"/g, `fill="${b}"`).replace(/class="fw"/g, 'fill="#FFFDF6"')
    .replace(/class="fn"/g, 'fill="none"').replace(/class="fi"/g, 'fill="#161616"').replace(/class="fy"/g, 'fill="#FFD84A"');
  const im = new Image();
  if (onLoad) im.onload = onLoad;
  im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 52 52" width="208" height="208"><g stroke="#161616" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">${inner}</g></svg>`,
  );
  iconCache[key] = im;
  return im;
}

/** Reduce una foto para guardarla en el navegador */
export function shrinkPhoto(file: File, max = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(fr.error);
    fr.onload = () => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement("canvas");
        c.width = Math.round(im.width * k);
        c.height = Math.round(im.height * k);
        c.getContext("2d")!.drawImage(im, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.82));
      };
      im.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  });
}

/* ---------- video del gozo ---------- */
export const gozo: { url: string | null; el: HTMLVideoElement | null; dur: number } = { url: null, el: null, dur: 0 };

export function setGozo(file: File, onReady?: () => void) {
  clearGozo();
  try {
    gozo.url = URL.createObjectURL(file);
  } catch {
    gozo.url = null;
  }
  if (!gozo.url) return;
  const el = document.createElement("video");
  el.src = gozo.url;
  el.playsInline = true;
  el.preload = "auto";
  el.addEventListener("loadedmetadata", () => { gozo.dur = el.duration || 0; });
  if (onReady) el.addEventListener("loadeddata", onReady);
  gozo.el = el;
}

export function clearGozo() {
  if (gozo.el) gozo.el.pause();
  gozo.url = null;
  gozo.el = null;
  gozo.dur = 0;
}
