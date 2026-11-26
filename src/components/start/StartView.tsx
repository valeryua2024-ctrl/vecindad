"use client";

import { useState, type FormEvent } from "react";
import { useApp } from "../AppContext";

/** Inicio de una sala real: la dueña crea; las vecinas llegan por el enlace. */
export default function StartView() {
  const { createSharedRoom, toast } = useApp();
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [roomName, setRoomName] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ownerName.trim()) return toast("Escriba su nombre o apodo");
    if (!roomName.trim()) return toast("Póngale un nombre a su vecindad");
    setCreating(true);
    try {
      await createSharedRoom(roomName, ownerName);
    } catch (error) {
      toast(error instanceof Error ? error.message : "No se pudo crear la sala");
      setCreating(false);
    }
  };

  return (
    <main className="wrap">
      <section className="card">
        <div className="talk">
          <div className="say">
            <small>Adviento entre amigas</small>
            <h2>Bienvenida a la vecindad</h2>
            <p>La dueña crea la sala y comparte la invitación. Las vecinas entran directo desde el enlace, sin escribir códigos.</p>
          </div>
        </div>
        {!showForm ? (
          <div className="ui">
            <button className="btn" type="button" onClick={() => setShowForm(true)}>Crear una sala</button>
            <p className="note">¿La invitaron? Abra el enlace que le enviaron por WhatsApp y llegará directamente a su sala.</p>
          </div>
        ) : (
          <form className="ui" onSubmit={(event) => void submit(event)}>
            <div>
              <label htmlFor="owner-name" className="note">¿Cómo le dicen a la dueña?</label>
              <input id="owner-name" autoComplete="name" maxLength={40} value={ownerName} onChange={(event) => setOwnerName(event.target.value)} required />
            </div>
            <div>
              <label htmlFor="new-room-name" className="note">Nombre de la vecindad</label>
              <input id="new-room-name" maxLength={60} placeholder="Ej. Las amigas de siempre" value={roomName} onChange={(event) => setRoomName(event.target.value)} required />
            </div>
            <p className="note">Al crearla se asignará un código único. Luego podrá copiar el enlace directo para sus invitadas.</p>
            <div className="row">
              <button className="btn" type="submit" disabled={creating}>{creating ? "Creando sala…" : "Crear mi vecindad"}</button>
              <button className="btn alt" type="button" disabled={creating} onClick={() => setShowForm(false)}>Volver</button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
