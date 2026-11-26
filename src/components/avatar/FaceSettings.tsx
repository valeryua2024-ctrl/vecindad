"use client";

import { useEffect, useState } from "react";
import { useApp } from "../AppContext";
import FacePhotoPicker from "./FacePhotoPicker";
import { CHARACTER_TEMPLATES } from "@/data/character-templates";
import { saveCloudFace } from "@/lib/cloud";
import AvatarCanvas from "../ui/AvatarCanvas";
import type { FaceCrop } from "@/lib/state";

export default function FaceSettings() {
  const { s, update, toast } = useApp();
  const [face, setFace] = useState(s.face);
  const [saving, setSaving] = useState(false);
  useEffect(() => setFace(s.face), [s.face]);
  const assigned = CHARACTER_TEMPLATES.find((item) => item.id === (s.characterId || s.av.templateId));
  const setFaceCrop = (value: string, source: string, crop: FaceCrop, dimensions: { w: number; h: number }) => {
    setFace(value);
    update((x) => { x.face = value; x.faceSrc = source; x.fc = crop; x.fd = dimensions; });
  };
  const save = async () => {
    if (!face) return toast("Suba una foto de su cara para el video");
    setSaving(true);
    try {
      if (s.cloudReady && s.cloudRoomId) await saveCloudFace(s.cloudRoomId, face);
      update((x) => { x.face = face; x.setupStep = null; });
      toast("Su personaje quedó guardado en la vecindad");
    } catch (error) {
      toast(error instanceof Error ? error.message : "No se pudo guardar la foto");
    } finally { setSaving(false); }
  };
  return <div>
    {assigned && <p className="note">Personaje asignado al azar: <strong>{assigned.name}</strong></p>}
    <div className="character-preview"><AvatarCanvas look={{ ...s.av, templateId: s.characterId || s.av.templateId, face }} px={220} /></div>
    <FacePhotoPicker face={face} faceSrc={s.faceSrc || null} crop={s.fc || null} dimensions={s.fd || null} onFace={setFaceCrop} onError={toast} />
    <button className="btn" type="button" disabled={saving || !face} onClick={() => void save()}>{saving ? "Guardando…" : "Guardar mi foto"}</button>
  </div>;
}

