"use client";

import { useApp } from "../AppContext";
import AvatarCanvas from "../ui/AvatarCanvas";
import Activity from "./activities";
import BossBox from "./BossBox";
import { dayOf, realOf } from "@/data/days";
import { canEdit, editNote, isBoss, isDone, myLook, resolve, responded, unlocked } from "@/lib/rules";

/* La ventanita abierta: la muñequita hace la pregunta, abajo va la actividad del día,
   una línea con el avance y, para la dueña del aviso, su recuadro de control. */
export default function DayPanel() {
  const { s } = useApp();
  const d = dayOf(s.sel), open = unlocked(s, d), r = realOf(d), done = isDone(s, d);
  return (
    <div className="card pop" key={d.n} style={{ alignSelf: "stretch" }}>
      <div className="talk">
        <span className="masc"><AvatarCanvas look={myLook(s)} px={240} up={open && (d.type === "draw" || d.type === "final")} /></span>
        <div className="say">
          <small>{d.n} de diciembre · {[r, d.cat].filter(Boolean).join(" · ")}</small>
          <h2>{open ? d.title : "Hoy no se abre, mañana sí"}</h2>
          <p>{open ? resolve(d.prompt, s) : `Esta ventanita se abre el ${d.n} de diciembre. No insista, mija.`}</p>
        </div>
      </div>
      {!open ? (
        <>
          <p className="note">Así la ve una vecina antes de tiempo. Cambie a &quot;La dueña del aviso&quot; o mueva el día de hoy para ver su contenido.</p>
          <div className="aviso">Prohibido espiar por la rendija</div>
        </>
      ) : (
        <>
          <fieldset className="ui" disabled={!canEdit(s, d)}>
            <Activity d={d} />
          </fieldset>
          <p className="meta">
            <i className={done ? "ok" : ""} />
            <span>{(done ? "Ya respondió" : "Aún no responde") + " · van " + (responded(d).length + (done ? 1 : 0)) + " de 6 vecinas · " + editNote(s, d)}</span>
          </p>
          {isBoss(s) && <BossBox d={d} />}
        </>
      )}
    </div>
  );
}
