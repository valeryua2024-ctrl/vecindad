"use client";

import { useEffect, useState } from "react";
import { useApp } from "../AppContext";
import CharacterPicker from "./CharacterPicker";
import { CHARACTER_TEMPLATES } from "@/data/character-templates";
import { getAvailableCharacters, saveCloudCharacter } from "@/lib/cloud";

export default function CharacterSettings() {
  const { s, update, toast } = useApp();
  const [selected, setSelected] = useState(s.characterId || CHARACTER_TEMPLATES[0].id);
  const [face, setFace] = useState(s.face);
  const [available, setAvailable] = useState(CHARACTER_TEMPLATES.map((item) => item.id));
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!s.cloudReady || !s.cloudRoomCode) return;
    let active = true;
    void getAvailableCharacters(s.cloudRoomCode).then((ids) => {
      if (active) setAvailable(ids.includes(selected) ? ids : [...ids, selected]);
    }).catch((error: unknown) => { if (active) toast(error instanceof Error ? error.message : "No se pudieron cargar los personajes disponibles."); });
    return () => { active = false; };
  }, [s.cloudReady, s.cloudRoomCode, selected, toast]);
  const save = async () => {
    if (!face) return toast("Suba una foto de su cara para el video");
    setSaving(true);
    try {
      if (s.cloudReady && s.cloudRoomId) await saveCloudCharacter(s.cloudRoomId, selected, face);
      update((x) => { x.characterId = selected; x.av.templateId = selected; x.face = face; });
      toast("Su personaje quedó guardado en la vecindad");
    } catch (error) {
      toast(error instanceof Error ? error.message : "No se pudo guardar el personaje");
    } finally { setSaving(false); }
  };
  return <div>
    <CharacterPicker selected={selected} onSelect={setSelected} face={face} onFace={setFace} available={available} onError={toast} />
    <button className="btn" type="button" disabled={saving || !available.includes(selected)} onClick={() => void save()}>{saving ? "Guardando…" : "Guardar mi personaje"}</button>
  </div>;
}

