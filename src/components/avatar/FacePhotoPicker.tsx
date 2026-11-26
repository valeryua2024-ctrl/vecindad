"use client";

import { useRef } from "react";
import { cropFace, findFace, initialCrop, loadPhoto } from "@/lib/face";

export default function FacePhotoPicker({ face, onFace, onError }: { face: string | null; onFace: (face: string) => void; onError: (message: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = async (file: File) => {
    try {
      const canvas = await loadPhoto(file);
      const crop = initialCrop(canvas, await findFace(canvas));
      onFace(await cropFace(canvas.toDataURL("image/jpeg", 0.88), crop, "#F0C6A7"));
    } catch {
      onError("No pude abrir esa foto. Pruebe con otra.");
    }
  };
  return <div className="face-photo-picker">
    <input ref={fileRef} type="file" accept="image/*" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} />
    <button className="btn" type="button" onClick={() => fileRef.current?.click()}>{face ? "Cambiar foto de la cara" : "Subir foto de la cara"}</button>
    {face && <img className="face-photo-preview" src={face} alt="Vista previa de la cara para la plantilla" />}
    <p className="note">El personaje se asigna al azar entre los que queden libres. La foto será visible para las integrantes de esta vecindad y aparecerá en el video grupal.</p>
  </div>;
}

