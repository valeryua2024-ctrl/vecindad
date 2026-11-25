"use client";

import { useRef } from "react";
import { useApp } from "../AppContext";
import AvatarCanvas from "../ui/AvatarCanvas";
import { BOTTOMS, HOODS, SHOES, SKINS, TOPS, type AvatarLook } from "@/data/avatar-options";
import { cropFace, findFace, initialCrop, loadPhoto } from "@/lib/face";
import { myLook } from "@/lib/rules";
import type { FaceCrop } from "@/lib/state";

/* Armar la muñequita: foto de la cara (se busca y se acerca sola), capucha, tono de piel y ropa. */
export default function AvatarBuilder() {
  const { s, get, update, toast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const a = s.av;

  const applyCrop = async (fc: FaceCrop) => {
    const cur = get();
    if (!cur.faceSrc) return;
    const face = await cropFace(cur.faceSrc, fc, SKINS[cur.av.skin ?? 1].c);
    update((x) => { x.fc = fc; x.face = face; });
  };

  const onFile = async (file: File) => {
    const c = await loadPhoto(file);
    const found = await findFace(c);
    const fc = initialCrop(c, found);
    update((x) => { x.faceSrc = c.toDataURL("image/jpeg", 0.85); x.fd = { w: c.width, h: c.height }; });
    toast(found ? "Encontré la cara y la acerqué" : "No encontré la cara sola: ajústela abajo");
    await applyCrop(fc);
  };

  const pick = (key: keyof AvatarLook, i: number) => update((x) => { (x.av as unknown as Record<string, number>)[key] = i; });
  const randomIndex = (length: number) => Math.floor(Math.random() * length);
  const row = (label: string, key: "hood" | "top" | "bottom" | "shoes", list: { n: string }[]) => (
    <div>
      <div className="note">{label}</div>
      <div className="chips">
        {list.map((o, i) => (
          <button key={o.n} type="button" className="chip" aria-pressed={(a[key] || 0) === i} onClick={() => pick(key, i)}>{o.n}</button>
        ))}
      </div>
    </div>
  );

  const slider = (label: string, min: number, max: number, value: number, toCrop: (v: number) => FaceCrop) => (
    <label className="adj">
      <span>{label}</span>
      <input type="range" min={min} max={max} step="0.01" aria-label={label} defaultValue={value} onChange={(e) => void applyCrop(toCrop(+e.target.value))} />
    </label>
  );

  const fc = s.fc, fd = s.fd;
  const side = fd ? Math.min(fd.w, fd.h) : 1;

  return (
    <div className="builder">
      <div className="prev"><AvatarCanvas look={myLook(s)} px={300} /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); e.target.value = ""; }} />
        <div className="row">
          <button className="btn" type="button" onClick={() => fileRef.current?.click()}>{s.face ? "Cambiar la foto de mi cara" : "Subir foto de mi cara"}</button>
          {s.face && <button className="btn alt sm" type="button" onClick={() => update((x) => { x.face = null; x.faceSrc = null; x.fc = null; })}>Quitar</button>}
          <button className="btn yellow sm" type="button" onClick={() => update((x) => { x.av = { top: randomIndex(TOPS.length), bottom: randomIndex(BOTTOMS.length), shoes: randomIndex(SHOES.length), hood: randomIndex(HOODS.length), skin: x.av.skin }; })}>Pinta al azar</button>
        </div>
        <p className="note">Suba cualquier foto donde se le vea la cara: la página la busca, la acerca y la mete en la capucha. Se guarda solo en este navegador.</p>
        {s.faceSrc && fc && fd && (
          <div className="adjbox" key={s.faceSrc.length}>
            <div className="note">¿No quedó centrada? Ajústela:</div>
            {slider("Acercar", -1.3, -0.12, -(fc.w / side), (v) => ({ ...fc, w: -v * side }))}
            {slider("Mover a los lados", 0, 1, fc.cx / fd.w, (v) => ({ ...fc, cx: v * fd.w }))}
            {slider("Subir o bajar", 0, 1, fc.cy / fd.h, (v) => ({ ...fc, cy: v * fd.h }))}
          </div>
        )}
        {row("¿Cuál capucha?", "hood", HOODS)}
        <div>
          <div className="note">Tono de piel</div>
          <div className="chips">
            {SKINS.map((o, i) => (
              <button key={o.n} type="button" className="swb" style={{ background: o.c }} aria-label={"Piel " + o.n} title={o.n} aria-pressed={(a.skin ?? 1) === i} onClick={() => pick("skin", i)} />
            ))}
          </div>
        </div>
        {row("¿Qué blusa le gusta más?", "top", TOPS)}
        {row("¿Pantalón o falda?", "bottom", BOTTOMS)}
        {row("¿Y los zapatos?", "shoes", SHOES)}
      </div>
    </div>
  );
}
