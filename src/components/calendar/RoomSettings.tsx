"use client";

import { useState } from "react";
import { useApp } from "../AppContext";
import Sticker from "../ui/Sticker";
import { copyText } from "@/lib/clipboard";

/** Ajustes de la sala: nombre e invitación por WhatsApp (solo la dueña del aviso) */
export default function RoomSettings() {
  const { s, update, toast } = useApp();
  const [room, setRoom] = useState(s.room);
  const inviteUrl = typeof window !== "undefined" && s.cloudRoomCode ? `${window.location.origin}?sala=${s.cloudRoomCode}` : "";
  const msg = s.cloudReady && s.cloudRoomCode
    ? `Mija, la invito a nuestro calendario de adviento. Entre a la sala "${s.room}" aquí: ${inviteUrl}. No se aceptan excusas.`
    : `Mija, la invito a nuestro calendario de adviento. Entre a la sala "${s.room}" con el código VECI-27. No se aceptan excusas.`;
  return (
    <div className="card">
      <div className="ahead">
        <Sticker name="bus" a="#FFC918" b="#D81E27" />
        <div><small>Solo lo ve la dueña del aviso</small><h2>Atendido por su propietaria</h2></div>
      </div>
      <div>
        <label htmlFor="room-name" className="note">Nombre de la sala</label>
        <div className="row">
          <input type="text" id="room-name" value={room} onChange={(e) => setRoom(e.target.value)} />
          <button className="btn sm" type="button" onClick={() => { update((x) => { x.room = room.trim() || "La Vecindad"; }); toast("Nombre actualizado"); }}>Guardar</button>
        </div>
      </div>
      <p><b>Encuentro: </b>entre el 24 y el 31 de diciembre. La fecha se vota el día 3 y la dueña la anuncia el día 4.</p>
      <p><b>Dinámicas: </b>las 24 son fijas para todas las salas. Aquí no hay chat: para conversar está el grupo de WhatsApp.</p>
      <div className="capbox">{msg}</div>
      <div className="row">
        <button className="btn sm" type="button" onClick={() => copyText(msg, toast)}>Copiar invitación</button>
        <a className="btn alt sm" href={"https://wa.me/?text=" + encodeURIComponent(msg)} target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</a>
      </div>
    </div>
  );
}
