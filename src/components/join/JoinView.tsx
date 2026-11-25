"use client";

import { useState } from "react";
import { useApp } from "../AppContext";
import AvatarCanvas from "../ui/AvatarCanvas";
import AvatarBuilder from "../avatar/AvatarBuilder";
import { dayOf } from "@/data/days";
import { isDone, myLook } from "@/lib/rules";

/* Pantalla de la vecina nueva: código de la sala, su nombre y su muñequita. Sin cuenta ni contraseña. */
export default function JoinView() {
  const { s, get, update, toast, boom, openDay, joinSharedRoom } = useApp();
  const [name, setName] = useState("");
  const [code, setCode] = useState(s.inviteCode || "");
  const [joining, setJoining] = useState(false);
  const enter = async () => {
    const n = name.trim();
    if (!n) return toast("Escriba su nombre pa' poder entrar");
    if (s.inviteCode || code.trim()) {
      if (!code.trim()) return toast("Escriba el código de la sala");
      setJoining(true);
      try {
        await joinSharedRoom(code, n);
      } catch (error) {
        toast(error instanceof Error ? error.message : "No se pudo entrar a la sala");
        setJoining(false);
        return;
      }
    } else {
    update((x) => { x.name = n; x.role = "amiga"; x.sel = x.sim; });
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
          <span className="masc"><AvatarCanvas look={myLook(s)} px={220} /></span>
          <div className="say">
            <small>Vecina nueva</small>
            <h2>Siga, siga, bien pueda</h2>
            <p>Le llegó una invitación por WhatsApp. Solo necesita el código y su nombre: sin cuenta, sin contraseña y sin fiador.</p>
          </div>
        </div>
        <div><label htmlFor="j-code" className="note">Código de la sala</label><input type="text" id="j-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} /></div>
        <div><label htmlFor="j-name" className="note">¿Cómo le dicen sus amigas?</label><input type="text" id="j-name" placeholder="Su nombre o apodo" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <h3>Arme su muñequita para el video</h3>
        <AvatarBuilder />
        <div className="row"><button className="btn" type="button" disabled={joining} onClick={enter}>{joining ? "Entrando…" : "Entrar a la vecindad"}</button></div>
        <ul>
          <li>Cada día de diciembre se abre una ventanita. Usted responde y ya, sin chat.</li>
          <li>Entre todas votan fecha, plan y lugar del encuentro.</li>
          <li>El día del encuentro sale un videíto con su muñequita contando todo lo que pasó.</li>
        </ul>
        <div className="aviso">No se aceptan excusas ni &quot;yo miro y les aviso&quot;</div>
      </div>
    </section>
  );
}
