"use client";

import { useState } from "react";
import { useApp } from "../../AppContext";
import type { Day } from "@/data/days";
import { isDone } from "@/lib/rules";

/** Responder con texto (emojis, recuerdos, recetas, cartas…) */
export default function TextActivity({ d }: { d: Day }) {
  const { s, get, answer, toast } = useApp();
  const saved = s.r[d.n];
  const [text, setText] = useState(typeof saved === "string" ? saved : "");
  const save = () => {
    const was = isDone(get(), d), v = text.trim();
    answer(d, v || undefined);
    if (was || !v) toast(v ? "Quedó actualizado" : "Escriba algo primero, no sea así");
  };
  return (
    <>
      <textarea id={"resp-" + d.n} placeholder="Escriba aquí, sin pena…" aria-label="Su respuesta" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="row"><button className="btn" type="button" onClick={save}>{saved ? "Actualizar" : "Guardar respuesta"}</button></div>
    </>
  );
}
