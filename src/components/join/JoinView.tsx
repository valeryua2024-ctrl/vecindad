"use client";

import { useState } from "react";
import { useApp } from "../AppContext";
import FacePhotoPicker from "../avatar/FacePhotoPicker";
import { dayOf } from "@/data/days";
import { isDone } from "@/lib/rules";
import type { FaceCrop } from "@/lib/state";

/* Pantalla de invitación: el enlace ya identifica la sala; solo pide nombre y foto. */
export default function JoinView() {
  const { s, get, update, toast, boom, openDay, joinSharedRoom } = useApp();
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [face, setFace] = useState<string | null>(null);
  const setFaceCrop = (value: string, source: string, crop: FaceCrop, dimensions: { w: number; h: number }) => {
    setFace(value);
    update((x) => { x.face = value; x.faceSrc = source; x.fc = crop; x.fd = dimensions; });
  };
  const enter = async () => {
    const n = name.trim();
    if (!n) return toast("Escriba su nombre pa' poder entrar");
    if (!face) return toast("Suba una foto de su cara para el personaje");
    if (s.inviteCode) {
      setJoining(true);
      try {
        await joinSharedRoom(s.inviteCode, n, face);
      } catch (error) {
        toast(error instanceof Error ? error.message : "No se pudo entrar a la sala");
        setJoining(false);
        return;
      }
    } else {
      update((x) => { x.name = n; x.role = "amiga"; x.sel = x.sim; x.face = face; });
    }
    boom();
    toast(n + " entró a " + s.room);
    setTimeout(() => {
      const cur = get();
      if (cur.unboxed && !isDone(cur, dayOf(cur.sim))) openDay(cur.sim);
    }, 900);
  };
  return (
    <section>
      <div className="card">
        <div className="talk">
          <div className="say">
            <small>Vecina nueva</small>
            <h2>Siga, siga, bien pueda</h2>
            <p>El enlace ya la trajo a la sala correcta. Solo necesitamos su nombre y su foto: sin código, sin contraseña y sin fiador.</p>
          </div>
        </div>
        <div><label htmlFor="j-name" className="note">¿Cómo le dicen sus amigas?</label><input type="text" id="j-name" placeholder="Su nombre o apodo" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <h3>Su foto para el personaje</h3>
        <FacePhotoPicker face={face} faceSrc={s.faceSrc || null} crop={s.fc || null} dimensions={s.fd || null} onFace={setFaceCrop} onError={toast} />
        <div className="row"><button className="btn" type="button" disabled={joining} onClick={enter}>{joining ? "Entrando…" : "Entrar a la vecindad"}</button></div>
        <ul>
          <li>Cada día de diciembre se abre una ventanita. Usted responde y ya, sin chat.</li>
          <li>Entre todas votan fecha, plan y lugar del encuentro.</li>
          <li>El día del encuentro sale un videíto con su personaje contando todo lo que pasó.</li>
        </ul>
        <div className="aviso">No se aceptan excusas ni &quot;yo miro y les aviso&quot;</div>
      </div>
    </section>
  );
}

