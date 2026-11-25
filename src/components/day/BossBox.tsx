"use client";

import { useState } from "react";
import { useApp } from "../AppContext";
import { Q17, type Day } from "@/data/days";
import { NAMES, who } from "@/data/vecinas";
import { FEATURED, featOf, featOptions, responded, votes, weekday, winner } from "@/lib/rules";

/* Recuadro que solo ve la dueña del aviso: quién respondió, recordatorios, cerrar votaciones,
   anunciar la fecha (días 3 y 4), cambiar la frase del 17 y elegir qué sale en el videíto. */
export default function BossBox({ d }: { d: Day }) {
  const { s, update, toast } = useApp();
  const [q17, setQ17] = useState(s.q17 || Q17);
  const liveAnswersForDay = s.cloudReady ? s.cloudAnswers.filter((answer) => answer.day_n === d.n) : [];
  const yes = s.cloudReady
    ? liveAnswersForDay.map((answer) => s.cloudMembers.find((member) => member.user_id === answer.member_id)?.display_name || "Vecina")
    : responded(d);
  const groupNames = s.cloudReady ? s.cloudMembers.map((member) => member.display_name) : NAMES;
  const no = groupNames.filter((n) => !yes.includes(n));
  const w = winner(s);
  const announce = `Vecinas, ya hay fecha: nos vemos el ${weekday(w)} ${w} de diciembre (ganó con ${votes(s, 3)} votos). El plan y el lugar los votamos en las próximas ventanitas.`;
  const feat = FEATURED[d.n], opts = featOptions(s, d.n), cur = featOf(s, d.n), chosen = opts.includes(s.feat[d.n]);
  const closed = !!s.closed[d.n];
  const liveAnswers = s.cloudReady && s.cloudRole === "owner"
    ? liveAnswersForDay
        .map((answer) => ({ name: s.cloudMembers.find((member) => member.user_id === answer.member_id)?.display_name || "Vecina", value: answer.value }))
    : [];

  return (
    <div className="boss">
      <h3>Solo lo ve la dueña del aviso</h3>
      <div className="row">
        <div className="avs">{yes.map((n) => <span key={n} className="av" style={{ background: who(n).c }} title={n}>{n[0]}</span>)}</div>
        <span>{no.length ? `Respondieron ${yes.join(", ")}. Faltan ${no.join(" y ")}.` : "Respondieron todas."}</span>
      </div>

      {s.cloudReady && s.cloudRole === "owner" && (
        <div className="note" style={{ marginTop: 10 }}>
          <b>Respuestas de la sala</b>
          {liveAnswers.length ? liveAnswers.map(({ name, value }) => (
            <div key={name} className="row"><b>{name}:</b><span>{Array.isArray(value) ? value.join(", ") : String(value)}</span></div>
          )) : <p>Aún no han respondido este día.</p>}
        </div>
      )}

      {d.n === 17 && (
        <div>
          <div className="note">Usted puede cambiar la frase por una que de verdad haya dicho alguna de la sala:</div>
          <div className="row">
            <input type="text" id="q17" aria-label="Frase del día 17" value={q17} onChange={(e) => setQ17(e.target.value)} />
            <button className="btn sm" type="button" onClick={() => { update((x) => { x.q17 = q17.trim(); }); toast("Frase actualizada"); }}>Guardar frase</button>
          </div>
        </div>
      )}

      {(d.n === 3 || d.n === 4) && (
        <div>
          <div className="note">
            {d.n === 3 ? `Mañana, en el día 4, le toca anunciar en el grupo la fecha ganadora. Por ahora va ganando el ${weekday(w)} ${w}.` : `Hoy le toca anunciar en el grupo la fecha ganadora: ${weekday(w)} ${w} de diciembre.`}
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <a className="btn sm" href={"https://wa.me/?text=" + encodeURIComponent(announce)} target="_blank" rel="noopener noreferrer">Anunciar la fecha en WhatsApp</a>
          </div>
        </div>
      )}

      {feat && (
        <div>
          <div className="note">¿Cuál sale en el videíto? Elija {feat} que más le gustó{chosen ? "" : `. Por ahora sale la de ${cur}`}</div>
          <div className="chips" style={{ marginTop: 8 }}>
            {opts.map((n) => (
              <button key={n} className="chip" type="button" aria-pressed={chosen && cur === n} onClick={() => { update((x) => { x.feat[d.n] = n; }); toast(`En el videíto sale ${feat} de ${n}`); }}>{n}</button>
            ))}
          </div>
        </div>
      )}

      {(no.length > 0 || (d.enc && d.type === "poll")) && (
        <div className="row">
          {no.length > 0 && <button className="btn alt sm" type="button" onClick={() => toast(`Recordatorio pa' ${no.join(" y ")} (simulado)`)}>Enviar recordatorio</button>}
          {d.enc && d.type === "poll" && (
            <button className={"btn sm " + (closed ? "alt" : "yellow")} type="button" onClick={() => { update((x) => { x.closed[d.n] = !closed; }); toast(closed ? "Votación reabierta" : "Se cerró la votación, no más ruegos"); }}>
              {closed ? "Reabrir votación" : "Cerrar votación"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
