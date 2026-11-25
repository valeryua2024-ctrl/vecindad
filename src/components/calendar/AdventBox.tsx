"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../AppContext";
import Sticker from "../ui/Sticker";
import { BOX_COLORS, BOX_SEQ, LAYOUT, color2, colorOf, dayOf } from "@/data/days";
import { STATUS_LABEL, dayStatus, unlocked } from "@/lib/rules";
import { SFX } from "@/lib/sound";
import { facadeSVG, ribbonSVG } from "@/lib/facade";
import { prefersCalm } from "@/canvas/shapes";

/* El calendario de adviento: una caja con la fachada de una casa colonial amarrada con un lazo.
   Al soltar el lazo se abren las puertas y aparecen las 24 cajitas.
   Al tocar una cajita: zoom, se abre la puertica, la cámara se mete, destello y empieza el reto. */

type Phase = "" | "untie" | "open" | "gone";

export default function AdventBox() {
  const { s, get, update, toast, boom, registerOpener, showDay, calMode, setCalMode } = useApp();
  const houseRef = useRef<HTMLDivElement>(null);
  const drawers = useRef<Record<number, HTMLButtonElement | null>>({});
  const busy = useRef(false);
  const [phase, setPhase] = useState<Phase>("");
  const facade = useMemo(() => ({ __html: facadeSVG(s.room) }), [s.room]);
  const ribbon = useMemo(() => ({ __html: ribbonSVG() }), []);

  /** Soltar el lazo: se deshace el moño, se abren las puertas con un ¡zas! y cae confeti */
  const unbox = (after?: () => void) => {
    if (get().unboxed || busy.current) return;
    const finish = () => {
      update((x) => { x.unboxed = true; });
      setPhase("");
      document.documentElement.style.overflow = "";
      busy.current = false;
      if (after) setTimeout(after, 250);
    };
    if (prefersCalm()) { SFX.zas(); return finish(); }
    busy.current = true;
    document.documentElement.style.overflow = "hidden";
    SFX.untie();
    setPhase("untie");
    setTimeout(() => { SFX.zas(); setPhase("open"); }, 420);
    setTimeout(boom, 650);
    setTimeout(() => setPhase("gone"), 1150);
    setTimeout(finish, 1550);
  };

  /** Abrir una cajita con la animación completa */
  const open = (n: number) => {
    if (busy.current) return;
    const run = () => {
      const cur = get(), d = dayOf(n), el = drawers.current[n], house = houseRef.current;
      if (!cur.unboxed) return unbox(() => open(n));
      if (!unlocked(cur, d)) {
        SFX.nope();
        if (el) { el.classList.remove("nope"); void el.offsetWidth; el.classList.add("nope"); }
        return toast(`Esta ventanita se abre el ${n} de diciembre`);
      }
      if (prefersCalm() || !el || !house) { SFX.pop(); return showDay(n); }
      busy.current = true;
      el.scrollIntoView({ block: "center" });
      SFX.pop();
      requestAnimationFrame(() => {
        const hr = house.getBoundingClientRect(), er = el.getBoundingClientRect(), root = document.documentElement, bg = document.getElementById("zoom-bg");
        const ox = er.left + er.width / 2 - hr.left, oy = er.top + er.height / 2 - hr.top;
        const tx = innerWidth / 2 - (er.left + er.width / 2), ty = innerHeight / 2 - (er.top + er.height / 2);
        const sc = Math.min((innerWidth * 0.55) / er.width, (innerHeight * 0.42) / er.height, 6);
        root.style.overflow = "hidden";
        house.classList.add("zoom");
        bg?.classList.add("on");
        house.style.transformOrigin = `${ox}px ${oy}px`;
        house.style.transition = "transform .7s cubic-bezier(.22,1,.36,1)";
        house.style.transform = `translate(${tx}px,${ty}px) scale(${sc})`;
        setTimeout(() => { SFX.drawer(); el.classList.add("open"); }, 650);
        setTimeout(() => {
          SFX.dive();
          house.style.transition = "transform .5s cubic-bezier(.55,0,.9,.4)";
          house.style.transform = `translate(${tx}px,${ty}px) scale(${sc * 4.5})`;
        }, 1150);
        setTimeout(() => {
          SFX.sparkle();
          document.getElementById("flash")?.animate([{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }], { duration: 650, easing: "ease-out" });
        }, 1430);
        setTimeout(() => {
          house.style.transition = "none";
          house.style.transform = "";
          house.classList.remove("zoom");
          bg?.classList.remove("on");
          el.classList.remove("open");
          root.style.overflow = "";
          busy.current = false;
          showDay(n);
        }, 1660);
      });
    };
    if (calMode !== "home") { setCalMode("home"); requestAnimationFrame(() => requestAnimationFrame(run)); }
    else run();
  };

  useEffect(() => {
    registerOpener(open);
    return () => registerOpener(null);
  });

  const coverClass = "cover" + (phase === "open" || phase === "gone" ? " open" : "") + (phase === "gone" ? " gone" : "");

  return (
    <div className="stage">
      <div className="house" ref={houseRef}>
        <div className="box">
          <div className="drawers" aria-label="Calendario de adviento, 24 cajitas">
            {LAYOUT.map(([n, c, r, cs, rs], k) => {
              const d = dayOf(n), st = dayStatus(s, d), bg = BOX_COLORS[BOX_SEQ[k]];
              const big = cs * rs > 1 ? (cs > rs ? "wide" : "tall") : undefined;
              const art = big ? <Sticker name={d.ic} a={colorOf(d)} b={color2(d)} className="art" /> : null;
              return (
                <button
                  key={n}
                  ref={(el) => { drawers.current[n] = el; }}
                  className="dw"
                  type="button"
                  data-s={st}
                  data-n={n}
                  data-big={big}
                  style={{ gridColumn: `${c} / span ${cs}`, gridRow: `${r} / span ${rs}`, "--c": bg, "--nc": bg === "#D8452F" ? "#FFF3E6" : "#C8352A" } as React.CSSProperties}
                  aria-label={`Día ${n}, ${d.cat}, ${STATUS_LABEL[st]}`}
                  onClick={() => open(n)}
                >
                  <span className="inside"><i>{st !== "locked" && <Sticker name={d.ic} a={colorOf(d)} b={color2(d)} />}</i></span>
                  <span className="door">
                    {big === "tall" && art}
                    <b>{n}</b>
                    {big === "wide" && art}
                    {d.enc && <Sticker name="star" a="#FFC918" b="#FFC918" className="enc" />}
                    {st === "today" && <span className="tag">hoy</span>}
                    {st === "done" && <span className="ok">✓</span>}
                  </span>
                </button>
              );
            })}
          </div>
          {!s.unboxed && (
            <div className={coverClass}>
              <div className="leaf l"><div className="face front" dangerouslySetInnerHTML={facade} /><div className="face back"><span>Feliz Navidad</span></div></div>
              <div className="leaf r"><div className="face front" dangerouslySetInnerHTML={facade} /><div className="face back"><span>Feliz Navidad</span></div></div>
              <button className={"ribbon" + (phase ? " untie" : "")} type="button" aria-label="Soltar el lazo y abrir la caja" onClick={() => unbox()} dangerouslySetInnerHTML={ribbon} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
