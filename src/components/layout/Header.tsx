"use client";

import { useApp } from "../AppContext";
import AvatarCanvas from "../ui/AvatarCanvas";
import { dateKnown, myLook, winner } from "@/lib/rules";

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
        <div className="who">
          <span className="masc"><AvatarCanvas look={myLook(s)} px={220} up /></span>
          <div className="brand-copy">
            <p className="eyebrow">Adviento entre amigas · diciembre 2026</p>
            <h1>{s.room}</h1>
          </div>
        </div>
        <div className="plate"><div><b>{s.cloudRoomCode || "VECI·27"}</b><small>Código de invitación</small></div></div>
      </header>
      <div className="room-status" role="status">
        <span className="room-status-dot" aria-hidden="true" />
        <p>{status}</p>
        <span className="room-status-note">Sí hay buñuelos, natilla y chisme fresco.</span>
      </div>
    </>
  );
}

