"use client";

import { useApp } from "../AppContext";
import { meName } from "@/lib/rules";
import type { Role } from "@/lib/state";

/* Franja oscura de prueba: cambiar de rol y simular qué día es. Se quita cuando haya salas reales. */
const ROLES: { id: Role; label: string; desc: string }[] = [
  { id: "creadora", label: "La dueña del aviso", desc: "Usted montó la sala. Ve las 24 ventanitas abiertas para revisarlas, quién ha respondido, y puede enviar recordatorios y cerrar votaciones." },
  { id: "amiga", label: "Vecina participante", desc: "Usted participa en la sala. Solo se abren las ventanitas hasta el día de hoy; las demás siguen cerradas. Mueva el día para ver cómo avanza. El videíto se le abre el 24." },
  { id: "invitada", label: "Vecina nueva", desc: "Todavía no ha entrado. Así se ve cuando alguien abre el enlace de invitación por primera vez." },
];

export default function PrototypeBar() {
  const { s, update, reset } = useApp();
  const role = ROLES.find((r) => r.id === s.role)!;
  return (
    <div className="proto">
      <div className="proto-in">
        <span className="tag">Prototipo</span>
        <span>Ver como</span>
        <div className="seg" role="group" aria-label="Cambiar de rol">
          {ROLES.map((r) => (
            <button key={r.id} type="button" aria-pressed={s.role === r.id} onClick={() => update((x) => { x.role = r.id; })}>{r.label}</button>
          ))}
        </div>
        <p>{role.desc}{s.role === "amiga" ? ` Entró como ${meName(s)}.` : ""}</p>
        {s.role !== "invitada" && (
          <div className="sim">
            <label htmlFor="sim">Hoy es <b>{s.sim} de diciembre</b></label>
            <input type="range" id="sim" min={1} max={24} step={1} value={s.sim} onChange={(e) => update((x) => { x.sim = +e.target.value; x.sel = x.sim; })} />
            <button type="button" onClick={reset}>Reiniciar prototipo</button>
          </div>
        )}
      </div>
    </div>
  );
}
