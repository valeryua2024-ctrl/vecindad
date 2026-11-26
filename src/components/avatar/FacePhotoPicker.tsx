"use client";

import { useEffect, useRef, useState } from "react";
import { cropFace, findFace, initialCrop, loadPhoto } from "@/lib/face";
import type { FaceCrop } from "@/lib/state";

type Dimensions = { w: number; h: number };
export default function FacePhotoPicker({ face, faceSrc, crop: savedCrop, dimensions: savedDimensions, onFace, onError }: {
  face: string | null;
  faceSrc: string | null;
  crop: FaceCrop | null;
  dimensions: Dimensions | null;
  onFace: (face: string, source: string, crop: FaceCrop, dimensions: Dimensions) => void;
  onError: (message: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const latest = useRef(0);
  const sourceRef = useRef<string | null>(null);
  const [source, setSource] = useState<string | null>(faceSrc);
  const [crop, setCrop] = useState<FaceCrop | null>(savedCrop);
  const [dimensions, setDimensions] = useState<Dimensions | null>(savedDimensions);
  const [baseWidth, setBaseWidth] = useState(savedCrop?.w || 0);
  useEffect(() => {
    if (faceSrc && sourceRef.current !== faceSrc) {
      sourceRef.current = faceSrc;
      setSource(faceSrc);
      setCrop(savedCrop);
      setDimensions(savedDimensions);
      setBaseWidth(savedCrop?.w || 0);
    }
  }, [faceSrc, savedCrop, savedDimensions]);

  const apply = async (src: string, next: FaceCrop, size: Dimensions) => {
    const ticket = ++latest.current;
    setCrop(next);
    try {
      const result = await cropFace(src, next, "#F0C6A7");
      if (ticket === latest.current) onFace(result, src, next, size);
    } catch (error) {
      onError(error instanceof Error ? error.message : "No pude ajustar esa foto. Pruebe con otra.");
    }
  };

  const upload = async (file: File) => {
    try {
      const canvas = await loadPhoto(file);
      const found = await findFace(canvas);
      const next = initialCrop(canvas, found);
      const src = canvas.toDataURL("image/jpeg", 0.88);
      const size = { w: canvas.width, h: canvas.height };
      sourceRef.current = src;
      setSource(src);
      setDimensions(size);
      setBaseWidth(next.w);
      await apply(src, next, size);
    } catch (error) {
      onError(error instanceof Error ? error.message : "No pude abrir esa foto. Pruebe con otra.");
    }
  };
  return <div className="face-photo-picker">
    <input ref={fileRef} type="file" accept="image/*" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} />
    <button className="btn" type="button" onClick={() => fileRef.current?.click()}>{face ? "Cambiar foto de la cara" : "Subir foto de la cara"}</button>
    {face && <img className="face-photo-preview" src={face} alt="Vista previa de la cara para la plantilla" />}
    {source && crop && dimensions && baseWidth > 0 && <div className="face-adjustments">
      <label className="adj"><span>Zoom</span><input aria-label="Zoom de la cara" type="range" min="0.55" max="2.4" step="0.01" value={baseWidth / crop.w} onChange={(event) => void apply(source, { ...crop, w: baseWidth / Number(event.target.value) }, dimensions)} /></label>
      <label className="adj"><span>Mover a los lados</span><input aria-label="Mover la cara a los lados" type="range" min="0" max={dimensions.w} step="1" value={crop.cx} onChange={(event) => void apply(source, { ...crop, cx: Number(event.target.value) }, dimensions)} /></label>
      <label className="adj"><span>Subir o bajar</span><input aria-label="Mover la cara arriba o abajo" type="range" min="0" max={dimensions.h} step="1" value={crop.cy} onChange={(event) => void apply(source, { ...crop, cy: Number(event.target.value) }, dimensions)} /></label>
    </div>}
    <p className="note">El personaje se asigna al azar entre los que queden libres. La foto será visible para las integrantes de esta vecindad y aparecerá en el video grupal.</p>
  </div>;
}

