"use client";

import { useApp } from "../AppContext";
import { dateKnown, winner } from "@/lib/rules";

/* Encabezado: el personaje asignado, el nombre de la sala, la placa con el código y el letrero LED. */
export default function Header() {
  const { s } = useApp();
  const left = winner(s) - s.sim;
  const status = dateKnown(s) && left > 0
    ? `Faltan ${left} días pa' vernos`
    : dateKnown(s) ? "Hoy nos vemos" : "Pronto hay fecha de encuentro";
  return (
    <>
      <header className="top">
        <div className="brand-copy">
          <p className="eyebrow">Adviento entre amigas · 2026</p>
          <h1>La Vecindad</h1>
        </div>
      </header>
      <div className="room-status" role="status">
        <span className="room-status-dot" aria-hidden="true" />
        <p>{status}</p>
        <span className="room-status-note">Sí hay buñuelos, natilla y chisme fresco.</span>
      </div>
    </>
  );
}

