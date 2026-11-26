"use client";

import { useEffect, useState } from "react";
import { useApp } from "../AppContext";
import FacePhotoPicker from "./FacePhotoPicker";
import { CHARACTER_TEMPLATES } from "@/data/character-templates";
import { saveCloudFace } from "@/lib/cloud";

export default function FaceSettings() {
  const { s, update, toast } = useApp();
  const [face, setFace] = useState(s.face);
  const [saving, setSaving] = useState(false);
  useEffect(() => setFace(s.face), [s.face]);
  const assigned = CHARACTER_TEMPLATES.find((item) => item.id === (s.characterId || s.av.templateId));
  const save = async () => {
    if (!face) return toast("Suba una foto de su cara para el video");
    setSaving(true);
    try {
      if (s.cloudReady && s.cloudRoomId) await saveCloudFace(s.cloudRoomId, face);
      update((x) => { x.face = face; });
      toast("Su foto quedó guardada en la vecindad");
    } catch (error) {
      toast(error instanceof Error ? error.message : "No se pudo guardar la foto");
    } finally { setSaving(false); }
  };
  return <div>
    {assigned && <p className="note">Personaje asignado al azar: <strong>{assigned.name}</strong></p>}
    <FacePhotoPicker face={face} onFace={setFace} onError={toast} />
    <button className="btn" type="button" disabled={saving || !face} onClick={() => void save()}>{saving ? "Guardando…" : "Guardar mi foto"}</button>
  </div>;
}

