"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../AppContext";
import { buildSlides, drawFrame, slidePhotos, totalDur, H, W, type Slide } from "@/canvas/video";
import { dayOf } from "@/data/days";
import { gozo, getImg, iconImg } from "@/lib/media";
import { retoPhotos, winner } from "@/lib/rules";
import { SFX, setMusicLevel, startMusic, stopMusic } from "@/lib/sound";
import { copyText } from "@/lib/clipboard";

/* El videíto: se reproduce en un lienzo vertical con música. Al terminar queda el cartel como imagen
   para guardarla; para TikTok o historias se graba la pantalla mientras corre. */
export default function VideoView() {
  const { s, get, toast } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const eng = useRef({ vt: 0, playing: false, raf: 0, last: 0, lastSlide: -1, slides: [] as Slide[], total: 1, still: false });
  const [label, setLabel] = useState("Reproducir");
  const [still, setStill] = useState<string | null>(null);

  // Cuando termina de cargar una foto o un dibujito, se vuelve a pintar el cuadro (si no está sonando)
  // y, si el cartel ya quedó como imagen, se actualiza esa imagen.
  const renderRef = useRef<() => void>(() => undefined);
  const redraw = useCallback(() => {
    const e = eng.current;
    if (e.playing) return;
    renderRef.current();
    if (e.still && canvasRef.current) try { setStill(canvasRef.current.toDataURL("image/jpeg", 0.92)); } catch { /* lienzo no exportable */ }
  }, []);

  const render = useCallback(() => {
    const c = canvasRef.current, x = c?.getContext("2d"), e = eng.current;
    if (!c || !x || !e.slides.length) return;
    const { i, acc, slide } = drawFrame(x, get(), e.slides, e.vt, e.playing, redraw);
    if (e.playing && i !== e.lastSlide) {
      e.lastSlide = i;
      if (slide.cartel) SFX.done(); else if (slide.hola) SFX.zas(); else SFX.pop();
    }
    const gozoNow = e.playing && !!slide.photo?.vid && !!gozo.el;
    setMusicLevel(gozoNow ? 0.08 : 0.5);
    const el = gozo.el;
    if (el) {
      if (gozoNow && el.paused) {
        try { el.currentTime = Math.max(0, e.vt - acc - 0.3); } catch { /* aún cargando */ }
        el.muted = false;
        el.play().catch(() => { el.muted = true; el.play().catch(() => undefined); });
      } else if (!gozoNow && !el.paused) el.pause();
    }
  }, [get, redraw]);
  useEffect(() => { renderRef.current = render; }, [render]);

  const syncLabel = () => setLabel(eng.current.playing ? "Pausar" : eng.current.vt >= eng.current.total - 0.05 ? "Ver otra vez" : "Reproducir");

  const endStill = () => {
    eng.current.still = true;
    try { setStill(canvasRef.current!.toDataURL("image/jpeg", 0.92)); } catch { setStill(null); }
  };
  const tick = (now: number) => {
    const e = eng.current;
    if (!e.playing) return;
    e.vt += (now - e.last) / 1000;
    e.last = now;
    if (e.vt >= e.total) {
      e.vt = e.total; e.playing = false; stopMusic(); render(); endStill(); syncLabel();
      return;
    }
    render();
    e.raf = requestAnimationFrame(tick);
  };
  const play = () => {
    const e = eng.current;
    if (e.vt >= e.total - 0.05) e.vt = 0;
    e.playing = true; e.lastSlide = -1; e.last = performance.now(); e.still = false;
    setStill(null);
    startMusic();
    syncLabel();
    cancelAnimationFrame(e.raf);
    e.raf = requestAnimationFrame(tick);
  };
  const pause = () => {
    const e = eng.current;
    e.playing = false; stopMusic(); cancelAnimationFrame(e.raf); render(); syncLabel();
  };
  const toggle = () => (eng.current.playing ? pause() : play());

  // Preparar las escenas al entrar (y cuando cambian las respuestas, si no está sonando)
  useEffect(() => {
    const e = eng.current;
    if (e.playing) return;
    e.slides = buildSlides(s);
    e.total = totalDur(e.slides);
    e.vt = 0;
    slidePhotos(s, e.slides).forEach((p) => getImg(p.src!, redraw));
    // dibujitos de los espacios sin foto, listos antes de pintar
    [...e.slides.flatMap((sl) => [sl.photo, ...(sl.photos || [])]), ...retoPhotos(s)].forEach((p) => {
      if (p && !p.src && p.day) iconImg(dayOf(p.day).ic, "#FFFDF6", "#FFC918", redraw);
    });
    e.still = false;
    setStill(null);
    syncLabel();
    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(() => { if (!eng.current.playing) render(); });
  }, [s, render, redraw]);

  useEffect(() => () => {
    const e = eng.current;
    e.playing = false;
    cancelAnimationFrame(e.raf);
    stopMusic();
    gozo.el?.pause();
  }, []);

  const caption = `Este diciembre abrimos una ventanita por día en ${s.room}: fotos viejas, velitas, aguinaldos y votaciones para cuadrar nuestro encuentro del ${winner(s)} de diciembre. No se fía, pero sí hay buñuelos.`;

  return (
    <section>
      <div className="memo">
        <div className="frame">
          <canvas ref={canvasRef} width={W} height={H} role="img" aria-label="Video resumen de la sala" hidden={!!still} onClick={toggle} />
          {still && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={still} alt="Cartel pintado estilo tienda de barrio con las fotos de la sala y los datos del encuentro" onClick={() => { eng.current.vt = 0; play(); }} />
          )}
        </div>
        <div className="card">
          <h2>El videíto del encuentro</h2>
          <p>El día del encuentro, su muñequita saluda y cuenta todo lo que pasó en la vecindad: quién entró, qué respondió cada una, quién ganó cada votación, las fotos, y al final el cartel con la fecha y el lugar. Lo que usted responda en las ventanitas entra al video.</p>
          <div className="row">
            <button className="btn" type="button" onClick={toggle}>{label}</button>
            <button className="btn alt" type="button" onClick={() => { eng.current.vt = 0; play(); }}>Desde el inicio</button>
            <button className="btn alt" type="button" onClick={() => { const e = eng.current; e.playing = false; cancelAnimationFrame(e.raf); stopMusic(); e.vt = e.total; render(); endStill(); syncLabel(); }}>Ir al cartel final</button>
          </div>
          <h3>Para compartir</h3>
          <ul>
            <li><b>TikTok, historias de Instagram y Facebook:</b> grabe la pantalla mientras corre el video (está en formato vertical).</li>
            <li><b>El cartel final:</b> vaya al cartel, mantenga presionada la imagen (o clic derecho) y guárdela.</li>
            <li><b>WhatsApp:</b> envíe el video grabado o el cartel al grupo, con el texto de abajo.</li>
          </ul>
          <div className="capbox">{caption}</div>
          <div className="row">
            <button className="btn alt sm" type="button" onClick={() => copyText(caption, toast)}>Copiar texto</button>
            <a className="btn alt sm" href={"https://wa.me/?text=" + encodeURIComponent(caption)} target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
}
