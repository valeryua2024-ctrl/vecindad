"use client";

import { useApp } from "../../AppContext";
import type { Day } from "@/data/days";

/** Se conversa en el grupo de WhatsApp; aquí solo se marca cuando ya se habló */
export default function WhatsAppActivity({ d }: { d: Day }) {
  const { s, answer } = useApp();
  const on = !!s.r[d.n];
  return (
    <>
      <div className="row">
        <a className="btn" href={"https://wa.me/?text=" + encodeURIComponent(d.wa || "")} target="_blank" rel="noopener noreferrer">Ir al grupo de WhatsApp</a>
        <button className={"btn " + (on ? "yellow" : "alt")} type="button" aria-pressed={on} onClick={() => answer(d, !on || undefined)}>
          {on ? "✓ Ya lo hablé por WhatsApp" : "Ya lo hablé por WhatsApp"}
        </button>
      </div>
      <p className="note">Esto se conversa en el grupo, que para eso está. Aquí solo marque cuando ya lo haya hablado.</p>
    </>
  );
}
