"use client";

import { useState } from "react";
import { useApp } from "../../AppContext";
import type { Day } from "@/data/days";
import { NAMES, who } from "@/data/vecinas";
import { budgetMax, derange, money } from "@/lib/rules";
import { prefersCalm } from "@/canvas/shapes";

/** Papelito del amigo secreto: se revuelven los nombres y al final se revela quién le tocó */
export default function DrawActivity({ d }: { d: Day }) {
  const { s, update, afterAnswer } = useApp();
  const [spinning, setSpinning] = useState(false);
  const [shown, setShown] = useState("¿Quién le tocó?");

  const finish = () => {
    update((x) => { x.drawP = x.drawP || derange(); x.draw = x.drawP.YO; });
    afterAnswer(d, false);
  };
  const draw = () => {
    setSpinning(true);
    if (prefersCalm()) return finish();
    let i = Math.floor(Math.random() * 5), delay = 60;
    const spin = () => {
      setShown(NAMES[i++ % 5] + "…");
      delay *= 1.13;
      if (delay < 430) setTimeout(spin, delay);
      else finish();
    };
    spin();
  };

  return (
    <>
      {s.draw ? (
        <div className="paper">Le tocó <b style={{ color: who(s.draw).c }}>{s.draw}</b><div>Que no se entere</div></div>
      ) : (
        <div className="draw">
          <div className={"bag" + (spinning ? " mix" : "")} aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ "--i": i } as React.CSSProperties}>?</span>)}
          </div>
          <div className="paper" style={{ minWidth: 220 }}>{shown}</div>
          <button className="btn yellow" type="button" disabled={spinning} onClick={draw}>Sacar mi papelito</button>
        </div>
      )}
      <p className="note">Tope acordado: {money(budgetMax(s))} por persona. El sorteo reparte todos los nombres de una vez: ninguna se saca a sí misma y ningún nombre se repite.</p>
    </>
  );
}
