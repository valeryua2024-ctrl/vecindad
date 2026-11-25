"use client";

import { useRef } from "react";
import { useApp } from "../../AppContext";
import type { Day } from "@/data/days";
import { meName } from "@/lib/rules";
import { shrinkPhoto } from "@/lib/media";

/** Subir una foto del reto (Navidad de niña, velitas, peor pinta, brindis) */
export default function PhotoActivity({ d }: { d: Day }) {
  const { s, answer, toast } = useApp();
  const ref = useRef<HTMLInputElement>(null);
  const photo = typeof s.r[d.n] === "string" ? (s.r[d.n] as string) : null;
  return (
    <>
      {photo && (
        <figure className="pola">
          <div className="ph" style={{ backgroundImage: `url(${photo})` }} />
          <figcaption>{meName(s)}</figcaption>
        </figure>
      )}
      <input
        ref={ref} type="file" accept="image/*" hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) shrinkPhoto(f).then((url) => answer(d, url), () => toast("No se pudo leer esa foto, intente con otra"));
          e.target.value = "";
        }}
      />
      <div className="row">
        <button className="btn" type="button" onClick={() => ref.current?.click()}>{photo ? "Cambiar mi foto" : "Subir mi foto"}</button>
        {photo && <button className="btn alt" type="button" onClick={() => answer(d, undefined)}>Quitar</button>}
      </div>
      <p className="note">En este prototipo su foto se guarda solo en este navegador.</p>
    </>
  );
}
