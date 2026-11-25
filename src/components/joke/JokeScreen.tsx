"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useApp } from "../AppContext";
import { HIGHLIGHT, HINTS, JOKE_COLORS, dayOf, realOf } from "@/data/days";
import { nextInfo, normWord, planLine, untilMidnight, weekday, winner } from "@/lib/rules";

/* Pantalla completa después de responder: la frase chistosa en grande y debajo
   "Espere hasta mañana" con la cuenta regresiva a la medianoche. */
export default function JokeScreen() {
  const { s, jokeDay, closeJoke, openDay } = useApp();
  const backRef = useRef<HTMLButtonElement>(null);
  const [clock, setClock] = useState(untilMidnight);

  useEffect(() => {
    if (jokeDay == null) return;
    document.documentElement.style.overflow = "hidden";
    const t = setInterval(() => setClock(untilMidnight()), 1000);
    const f = setTimeout(() => backRef.current?.focus({ preventScroll: true }), 60);
    return () => { clearInterval(t); clearTimeout(f); document.documentElement.style.overflow = ""; };
  }, [jokeDay]);

  if (jokeDay == null) return null;
  const d = dayOf(jokeDay), words = d.joke.split(" "), len = d.joke.length;
  const parentheticalStart = d.n === 14 ? words.findIndex((word) => word.includes("(")) : -1;
  const fs = len <= 18 ? "clamp(3.4rem,17vw,8rem)" : len <= 30 ? "clamp(3rem,14vw,6.5rem)" : "clamp(2.6rem,12.5vw,5.5rem)";
  const next = nextInfo(s, d.n), w = winner(s);

  return (
    <div className="joke-screen" role="dialog" aria-modal="true" aria-label={d.joke} style={{ "--jc": JOKE_COLORS[d.n % 6], "--fs": fs } as CSSProperties} onKeyDown={(e) => { if (e.key === "Escape") closeJoke(false); }}>
      <div className="jk-body">
        <h2 className="jk">
          {words.map((wd, i) => {
            const word = normWord(wd);
            const highlighted = (HIGHLIGHT[d.n] || []).includes(word) && (d.n !== 6 || i < 2);
            const classes = [
              highlighted && "hl",
              parentheticalStart >= 0 && i >= parentheticalStart && "jk-aside",
              d.n === 14 && word === "no" && "jk-no",
            ].filter(Boolean).join(" ");
            return <span key={i} className={classes || undefined} style={{ "--i": i } as CSSProperties}>{wd}</span>;
          })}
        </h2>
        <div className="jk-wait" style={{ "--i": words.length + 1 } as CSSProperties}>
          {next.kind === "end" && (
            <>
              <p className="jk-w">Nos vemos el {weekday(w)} {w}</p>
              <p className="jk-s">Se acabaron las ventanitas · {planLine(s)}</p>
            </>
          )}
          {next.kind === "open" && (
            <>
              <p className="jk-w">La {next.d.n} ya está abierta</p>
              <button className="jk-go" type="button" onClick={() => { closeJoke(false); openDay(next.d.n); }}>Abrirla ahora</button>
            </>
          )}
          {next.kind === "wait" && (
            <>
              <p className="jk-w">Espere hasta mañana</p>
              <span className="jk-cd">{clock}</span>
              <p className="jk-s">¿Qué reto le pondrán? Pista: {(realOf(next.d) || HINTS[next.d.cat] || "es sorpresa").toLowerCase()}</p>
            </>
          )}
        </div>
        <div className="jk-links">
          <button ref={backRef} className="jk-link" type="button" onClick={() => closeJoke(true)}>Volver al calendario</button>
          <span aria-hidden="true">·</span>
          <button className="jk-link" type="button" onClick={() => closeJoke(false)}>Ver mi respuesta</button>
        </div>
      </div>
    </div>
  );
}
