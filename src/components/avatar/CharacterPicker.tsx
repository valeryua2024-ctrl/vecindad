"use client";

import { useRef } from "react";
import AvatarCanvas from "../ui/AvatarCanvas";
import { CHARACTER_TEMPLATES } from "@/data/character-templates";
import { cropFace, findFace, initialCrop, loadPhoto } from "@/lib/face";
import { DEFAULT_LOOK } from "@/data/avatar-options";

export default function CharacterPicker({ selected, onSelect, face, onFace, available, onError }: {
  selected: string; onSelect: (id: string) => void; face: string | null; onFace: (face: string) => void; available: string[]; onError: (msg: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const selectedTemplate = CHARACTER_TEMPLATES.find((item) => item.id === selected);
  const upload = async (file: File) => {
    try {
      const canvas = await loadPhoto(file);
      const crop = initialCrop(canvas, await findFace(canvas));
      onFace(await cropFace(canvas.toDataURL("image/jpeg", 0.88), crop, "#F0C6A7"));
    } catch {
      onError("No pude abrir esa foto. Pruebe con otra.");
    }
  };
  return <div className="character-picker">
    <div className="character-preview">{selectedTemplate && <AvatarCanvas look={{ ...DEFAULT_LOOK, templateId: selected, face }} px={220} />}</div>
    <p className="note">Sube una foto de tu cara y escoge un personaje navideño. La foto será visible para las integrantes de esta vecindad y aparecerá en el video grupal.</p>
    <input ref={fileRef} type="file" accept="image/*" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} />
    <button className="btn" type="button" onClick={() => fileRef.current?.click()}>{face ? "Cambiar foto de la cara" : "Subir foto de la cara"}</button>
    <div className="character-grid" aria-label="Personajes disponibles">
      {CHARACTER_TEMPLATES.map((item) => {
        const isAvailable = available.includes(item.id);
        return <button key={item.id} type="button" className="character-choice" aria-pressed={selected === item.id} disabled={!isAvailable} onClick={() => onSelect(item.id)} title={isAvailable ? item.name : "Ya lo escogió otra vecina"}>
          <img src={item.src} alt="" />
          <span>{item.name}</span>
          {!isAvailable && <small>Ocupado</small>}
        </button>;
      })}
    </div>
    {selectedTemplate && <p className="note">Personaje: {selectedTemplate.name}{!available.includes(selected) ? " (ya escogido)" : ""}</p>}
  </div>;
}

