"use client";

import { useState } from "react";
import { useApp } from "../../AppContext";
import type { Day } from "@/data/days";
import { isDone, tally } from "@/lib/rules";

/** Votaciones: una opción, varias opciones (con "Listo, enviar") o anónimas; algunas dejan proponer opciones */
export default function PollActivity({ d }: { d: Day }) {
  const { s, get, update, answer, toast, celebrate } = useApp();
  const [proposal, setProposal] = useState("");
  const t = tally(s, d.n);
  const mine = Array.isArray(s.r[d.n]) ? (s.r[d.n] as string[]) : [];
  const total = Math.max(1, ...Object.values(t).map((a) => a.length));
  const showTotals = !!d.enc;

  const toggle = (o: string) => {
    const on = mine.includes(o);
    answer(d, on ? mine.filter((x) => x !== o) : d.multi ? [...mine, o] : [o]);
  };
  const propose = () => {
    const v = proposal.trim();
    if (!v || !d.add) return;
    const was = isDone(get(), d), key = d.add.key;
    update((x) => { x[key] = [...(x[key] || []), v]; });
    answer(d, d.multi ? [...mine, v] : [v]);
    if (was) toast("Quedó propuesto: " + v);
    setProposal("");
  };

  return (
    <>
      <div className="opts">
        {Object.keys(t).map((o) => (
          <button key={o} className="opt" type="button" aria-pressed={mine.includes(o)} onClick={() => toggle(o)}>
            {showTotals && <i className="bar" style={{ transform: `scaleX(${(t[o].length / total).toFixed(3)})` }} />}
            <span><b>{o}</b>{showTotals && <b>{t[o].length}</b>}</span>
          </button>
        ))}
      </div>
      {d.add && (
        <div className="row">
          <input type="text" id={"add-" + d.n} placeholder={d.add.ph} aria-label={d.add.ph} value={proposal} onChange={(e) => setProposal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") propose(); }} />
          <button className="btn alt" type="button" onClick={propose}>Agregar</button>
        </div>
      )}
      {d.multi && isDone(s, d) && (
        <div className="row"><button className="btn" type="button" onClick={() => celebrate(d)}>Listo, enviar</button></div>
      )}
      <p className="note">
        {d.anon ? "Voto anónimo: solo se ven los totales, nunca quién eligió qué."
          : d.multi ? "Puede marcar varias. Se ven solo los totales."
          : showTotals ? "Se ven solo los totales."
          : "Toque una opción para votar. Quién ganó se revela en el videíto."}
      </p>
    </>
  );
}
