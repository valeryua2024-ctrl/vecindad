"use client";

import { useEffect, useState } from "react";
import { useApp } from "../AppContext";
import AvatarCanvas from "../ui/AvatarCanvas";
import CharacterPicker from "../avatar/CharacterPicker";
import { CHARACTER_TEMPLATES } from "@/data/character-templates";
import { cloudConfigured, getAvailableCharacters } from "@/lib/cloud";
import { dayOf } from "@/data/days";
import { isDone, myLook } from "@/lib/rules";

/* Pantalla de la vecina nueva: código de la sala, su nombre y su muñequita. Sin cuenta ni contraseña. */
export default function JoinView() {
  const { s, get, update, toast, boom, openDay, joinSharedRoom } = useApp();
  const [name, setName] = useState("");
  const [code, setCode] = useState(s.inviteCode || "");
  const [joining, setJoining] = useState(false);
  const [characterId, setCharacterId] = useState<string>(CHARACTER_TEMPLATES[0].id);
  const [face, setFace] = useState<string | null>(null);
  const [available, setAvailable] = useState<string[]>(CHARACTER_TEMPLATES.map((item) => item.id));
  useEffect(() => {
    const roomCode = (s.inviteCode || code).trim();
    if (!roomCode || !cloudConfigured) { setAvailable(CHARACTER_TEMPLATES.map((item) => item.id)); return; }
    let active = true;
    void getAvailableCharacters(roomCode).then((ids) => {
      if (!active) return;
      setAvailable(ids);
      setCharacterId((current) => ids.includes(current) ? current : ids[0] || "");
    }).catch((error: unknown) => {
      if (active) toast(error instanceof Error ? error.message : "No se pudieron consultar los personajes libres.");
    });
    return () => { active = false; };
  }, [code, s.inviteCode, toast]);
  const enter = async () => {
    const n = name.trim();
    if (!n) return toast("Escriba su nombre pa' poder entrar");
    if (!characterId || !available.includes(characterId)) return toast("Escoja un personaje que todavía esté libre");
    if (!face) return toast("Suba una foto de su cara para el personaje");
    if (s.inviteCode || code.trim()) {
      if (!code.trim()) return toast("Escriba el código de la sala");
      setJoining(true);
      try {
        await joinSharedRoom(code, n, characterId, face);
      } catch (error) {
        toast(error instanceof Error ? error.message : "No se pudo entrar a la sala");
        setJoining(false);
        return;
      }
    } else {
    update((x) => { x.name = n; x.role = "amiga"; x.sel = x.sim; x.characterId = characterId; x.av.templateId = characterId; x.face = face; });
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
          <span className="masc"><AvatarCanvas look={{ ...myLook(s), templateId: characterId, face }} px={220} /></span>
          <div className="say">
            <small>Vecina nueva</small>
            <h2>Siga, siga, bien pueda</h2>
            <p>Le llegó una invitación por WhatsApp. Solo necesita el código y su nombre: sin cuenta, sin contraseña y sin fiador.</p>
          </div>
        </div>
        <div><label htmlFor="j-code" className="note">Código de la sala</label><input type="text" id="j-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} /></div>
        <div><label htmlFor="j-name" className="note">¿Cómo le dicen sus amigas?</label><input type="text" id="j-name" placeholder="Su nombre o apodo" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <h3>Escoja su personaje navideño</h3>
        <CharacterPicker selected={characterId} onSelect={setCharacterId} face={face} onFace={setFace} available={available} onError={toast} />
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

