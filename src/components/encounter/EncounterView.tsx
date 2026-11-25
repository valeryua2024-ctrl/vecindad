"use client";

import type { ReactNode } from "react";
import { useApp } from "../AppContext";
import AvatarCanvas from "../ui/AvatarCanvas";
import { dayOf, type TextSample } from "@/data/days";
import { budgetMax, dateKnown, isBoss, money, myLook, topOf, votes, weekday, winner } from "@/lib/rules";

/* Nuestro encuentro: la cuenta regresiva y lo que se va decidiendo entre todas. */
export default function EncounterView() {
  const { s } = useApp();
  const w = winner(s), left = w - s.sim, known = dateKnown(s);
  const row = (label: string, day: number, value: () => ReactNode) => (
    <div className="erow">
      <dt>{label}</dt>
      <dd>{isBoss(s) || s.sim >= day ? value() : <span className="pending">Se define el {day} de diciembre</span>}</dd>
    </div>
  );
  return (
    <section>
      <div className="card">
        <div className="count">
          <span className="masc"><AvatarCanvas look={myLook(s)} px={200} /></span>
          <div className="plate">
            <div>
              <b>{known ? (left > 0 ? "FALTAN·" + String(left).padStart(2, "0") : "ES·HOY") : "FALTAN·??"}</b>
              <small>{known ? (left > 0 ? "días pa' vernos" : "nos vemos") : "se sabe el 4"}</small>
            </div>
          </div>
          <p style={{ flex: 1, minWidth: 200 }}>El plan se arma con lo que responden entre todas. Gana la fecha en que más pueden, y el presupuesto se ajusta a la que menos puede gastar. Aquí nadie queda por fuera.</p>
        </div>
        <dl>
          {row("Fecha", 3, () => known
            ? <span>{weekday(w)} {w} de diciembre<small>La dueña del aviso la anunció en el grupo de WhatsApp el día 4.</small></span>
            : <span>En votación. Va ganando el {w} con {votes(s, 3)} de 6.</span>)}
          {row("Presupuesto", 9, () => <span>Hasta {money(budgetMax(s))} por persona<small>Es el máximo más bajo que alguien marcó, para que nadie quede por fuera. Nadie ve cuánto marcó cada una.</small></span>)}
          {row("Plan", 12, () => <span>{topOf(s, 12)}</span>)}
          {row("Lugar", 15, () => <span>{topOf(s, 15)}</span>)}
          {row("Qué llevamos", 18, () => <span>Se cuadra en el grupo de WhatsApp<small>{s.r[18] ? "Usted ya lo habló en el grupo." : "Le falta hablarlo en el grupo."}</small></span>)}
          {row("Amigo secreto", 10, () => <span>{s.draw ? "Ya sacó su papelito" : "Falta que saque su papelito"}</span>)}
          {row("Playlist", 13, () => <span>{(dayOf(13).sample as TextSample).length + (s.r[13] ? 1 : 0)} canciones de diciembre anotadas</span>)}
        </dl>
        <div className="aviso">Prohibido cancelar a última hora</div>
      </div>
    </section>
  );
}
