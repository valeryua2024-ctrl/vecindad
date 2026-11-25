"use client";

import { useApp } from "../../AppContext";
import TextActivity from "./TextActivity";
import type { Day } from "@/data/days";
import { SECRET_MESSAGES } from "@/data/vecinas";
import { planLine, secretGiver, weekday, winner } from "@/lib/rules";

/** Día 24: llega el mensaje de la amiga secreta, se escribe lo del año viejo y sale el resumen del encuentro */
export default function FinalActivity({ d }: { d: Day }) {
  const { s } = useApp();
  const giver = secretGiver(s), w = winner(s);
  return (
    <>
      {giver ? (
        <div className="ui">
          <h3>Su amiga secreta le escribió</h3>
          <div className="paper">{SECRET_MESSAGES[giver] || ""}</div>
          <p className="note">Quién se lo escribió se descubre en el encuentro.</p>
        </div>
      ) : (
        <p className="meta"><i /><span>Cuando saque su papelito en el día 10, aquí le llega lo que le escribió su amiga secreta.</span></p>
      )}
      <TextActivity d={d} />
      <div className="paper" style={{ transform: "rotate(1deg)" }}>
        <div style={{ fontFamily: "var(--display)", fontSize: "1.6rem", color: "var(--red)", lineHeight: 1.1 }}>NOS VEMOS EL {weekday(w).toUpperCase()} {w} DE DICIEMBRE</div>
        <div>{planLine(s)}</div>
        <div style={{ marginTop: 12 }}><a className="btn sm" href="#recuerdo">Ver el videíto</a></div>
      </div>
    </>
  );
}
