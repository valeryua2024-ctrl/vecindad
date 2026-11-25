"use client";

import { useState, type CSSProperties } from "react";
import { useApp } from "../../AppContext";
import type { Day } from "@/data/days";
import { PMAX, PMIN, PRESETS, budgetMax, isDone, money, thousands } from "@/lib/rules";

/** Presupuesto con rango de precios, como el filtro de una tienda en línea (anónimo) */
export default function PriceActivity({ d }: { d: Day }) {
  const { s, get, answer, toast } = useApp();
  const saved = Array.isArray(s.r[d.n]) ? (s.r[d.n] as unknown as [number, number]) : null;
  const [lo, setLo] = useState(saved ? saved[0] : 10000);
  const [hi, setHi] = useState(saved ? saved[1] : 40000);
  const [loTxt, setLoTxt] = useState(thousands(lo));
  const [hiTxt, setHiTxt] = useState(thousands(hi));
  const pct = (v: number) => ((v - PMIN) / (PMAX - PMIN)) * 100;
  const num = (v: string) => parseInt(v.replace(/\D/g, ""), 10) || 0;

  const commit = (l: number, m: number) => {
    l = Math.max(PMIN, Math.min(PMAX, l || PMIN));
    m = Math.max(PMIN, Math.min(PMAX, m || PMAX));
    if (l > m) [l, m] = [m, l];
    setLo(l); setHi(m); setLoTxt(thousands(l)); setHiTxt(thousands(m));
    const was = isDone(get(), d);
    answer(d, [l, m]);
    if (was) toast(`Quedó entre ${money(l)} y ${money(m)}`);
  };

  return (
    <>
      <div className="chips">
        {PRESETS.map(([l, m, label]) => (
          <button key={label} className="chip" type="button" aria-pressed={!!saved && lo === l && hi === m} onClick={() => commit(l, m)}>{label}</button>
        ))}
      </div>
      <div>
        <div className="dual">
          <i className="track" />
          <i className="fill" style={{ left: pct(lo) + "%", width: pct(hi) - pct(lo) + "%" } as CSSProperties} />
          <input type="range" min={PMIN} max={PMAX} step={1000} aria-label="Mínimo" value={lo}
            onChange={(e) => { const v = Math.min(+e.target.value, hi); setLo(v); setLoTxt(thousands(v)); }}
            onPointerUp={() => commit(lo, hi)} onKeyUp={() => commit(lo, hi)} />
          <input type="range" min={PMIN} max={PMAX} step={1000} aria-label="Máximo" value={hi}
            onChange={(e) => { const v = Math.max(+e.target.value, lo); setHi(v); setHiTxt(thousands(v)); }}
            onPointerUp={() => commit(lo, hi)} onKeyUp={() => commit(lo, hi)} />
        </div>
        <div className="ends"><span>{money(PMIN)}</span><span>{money(PMAX)}</span></div>
      </div>
      <div className="pr-in">
        <label className="money"><span>$</span><input type="text" inputMode="numeric" id="pmin" aria-label="Mínimo en pesos" placeholder="Mínimo" value={loTxt} onChange={(e) => setLoTxt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commit(num(loTxt), num(hiTxt)); }} /></label>
        <span className="muted">a</span>
        <label className="money"><span>$</span><input type="text" inputMode="numeric" id="pmax" aria-label="Máximo en pesos" placeholder="Máximo" value={hiTxt} onChange={(e) => setHiTxt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commit(num(loTxt), num(hiTxt)); }} /></label>
        <button className="btn" type="button" onClick={() => commit(num(loTxt), num(hiTxt))}>{saved ? "Actualizar" : "Guardar"}</button>
      </div>
      <p className="note">{saved ? `Así va el grupo: hasta ${money(budgetMax(s))} por persona. Nadie ve cuánto marcó cada una.` : "Nadie ve cuánto marca cada una."}</p>
    </>
  );
}
