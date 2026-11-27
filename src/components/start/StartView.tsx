"use client";

import { useState, type FormEvent } from "react";
import { useApp } from "../AppContext";
import Image from "next/image";

/** Inicio de sala: invita a crearla o explica cómo entrar desde el enlace. */
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
    <main className="landing-wrap">
      <Image className="landing-garland" src="/images/guide-lights.webp" alt="" aria-hidden="true" width={1080} height={180} priority />
      <section className="landing-content">
        <header className="landing-welcome">
          <p className="landing-script">La</p>
          <h1>Vecindad</h1>
          <p className="landing-tagline">Un diciembre para reír, recordar y compartir</p>
        </header>

        {!showForm && <Image className="landing-scene" src="/images/guide-neighbors.webp" alt="Dos vecinas conversan por encima de la cerca en diciembre" width={1080} height={620} priority />}

        <div className="landing-action">
          {!showForm ? (
            <>
              <button className="landing-create" type="button" onClick={() => setShowForm(true)}>Crear una sala</button>
              <p className="landing-hint">La dueña crea la sala y comparte la invitación.</p>
            </>
          ) : (
            <form className="landing-form" onSubmit={(event) => void submit(event)}>
              <h2>Empecemos la vecindad</h2>
              <label htmlFor="owner-name">¿Cómo le dicen a la dueña?</label>
              <input id="owner-name" autoComplete="name" maxLength={40} placeholder="Ej. La vecina, la profe, la reina…" value={ownerName} onChange={(event) => setOwnerName(event.target.value)} required />
              <label htmlFor="new-room-name">Nombre de la vecindad</label>
              <input id="new-room-name" maxLength={60} placeholder="Ej. Las amigas de siempre" value={roomName} onChange={(event) => setRoomName(event.target.value)} required />
              <p>Después podrá compartir el enlace para que las demás entren directo.</p>
              <div className="landing-form-actions">
                <button className="landing-create" type="submit" disabled={creating}>{creating ? "Creando sala…" : "Crear mi vecindad"}</button>
                <button className="landing-back" type="button" disabled={creating} onClick={() => setShowForm(false)}>Volver</button>
              </div>
            </form>
          )}
        </div>

        <aside className="landing-invite">
          <span className="landing-whatsapp" aria-hidden="true">
            <svg viewBox="0 0 48 48"><path d="M24 4a19 19 0 0 0-16 29L5 43l10-3a19 19 0 1 0 9-36Zm0 34a15 15 0 0 1-8-2l-1-.5-5 1.5 1.6-4.8-.7-1.1A15 15 0 1 1 24 38Zm8-11c-.5-.3-3-1.5-3.5-1.6s-.8-.3-1.1.3-1.3 1.6-1.6 1.9-.6.4-1.1.1a14 14 0 0 1-4-2.5 15 15 0 0 1-2.7-3.4c-.3-.5 0-.8.2-1.1l.8-.9.5-.8c.2-.3.1-.7 0-1s-1.1-2.7-1.5-3.7c-.4-.9-.8-.8-1.1-.8h-1c-.4 0-.9.2-1.4.7-.5.6-1.8 1.8-1.8 4.3s1.9 4.9 2.1 5.2c.3.3 3.7 5.7 9 8 1.2.5 2.2.8 3 .9 1.3.4 2.4.3 3.3.2 1-.2 3-1.2 3.4-2.4.4-1.2.4-2.2.3-2.4-.2-.2-.5-.4-1-.7Z" /></svg>
          </span>
          <p><strong>¿La invitaron?</strong> Abra el enlace de WhatsApp y llegará directamente a su sala. Solo tendrá que poner su nombre y su foto.</p>
        </aside>
      </section>
      <Image className="landing-garden" src="/images/guide-garden.webp" alt="" aria-hidden="true" width={1080} height={185} />
    </main>
  );
}
