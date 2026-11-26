"use client";

import { useApp } from "../AppContext";
import AvatarCanvas from "../ui/AvatarCanvas";
import { dateKnown, myLook, winner } from "@/lib/rules";

/* Encabezado: el personaje asignado, el nombre de la sala, la placa con el código y el letrero LED. */
export default function Header() {
  const { s } = useApp();
  const left = winner(s) - s.sim;
  const led = [
    dateKnown(s) && left > 0 ? `FALTAN ${left} DÍAS PA' VERNOS` : dateKnown(s) ? "HOY NOS VEMOS" : "PRONTO HAY FECHA DE ENCUENTRO",
    "SÍ HAY BUÑUELOS, NATILLA Y CHISME FRESCO",
    "PARA CONVERSAR, EL GRUPO DE WHATSAPP",
  ].join("  ★  ");
  return (
    <>
      <header className="top">
        <div className="who">
          <span className="masc"><AvatarCanvas look={myLook(s)} px={220} up /></span>
          <div>
            <h1>{s.room}</h1>
            <p className="sub">Adviento entre amigas · diciembre 2026</p>
          </div>
        </div>
        <div className="plate"><div><b>VECI·27</b><small>Código de sala</small></div></div>
      </header>
      <div className="led" aria-hidden="true"><div>{led}</div></div>
    </>
  );
}

