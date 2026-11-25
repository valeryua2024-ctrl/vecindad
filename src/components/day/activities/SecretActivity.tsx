"use client";

import { useApp } from "../../AppContext";
import TextActivity from "./TextActivity";
import type { Day } from "@/data/days";

/** Día 11: escribirle a la amiga del papelito. Le llega el 24, sin firma. */
export default function SecretActivity({ d }: { d: Day }) {
  const { s, openDay } = useApp();
  if (!s.draw)
    return (
      <>
        <p className="meta"><i /><span>Primero saque su papelito en el día 10 para saber a quién le escribe.</span></p>
        <div className="row"><button className="btn" type="button" onClick={() => openDay(10)}>Ir al día 10</button></div>
      </>
    );
  return <TextActivity d={d} />;
}
