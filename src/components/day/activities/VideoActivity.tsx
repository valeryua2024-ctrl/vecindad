"use client";

import { useRef } from "react";
import { useApp } from "../../AppContext";
import type { Day } from "@/data/days";
import { clearGozo, gozo, setGozo } from "@/lib/media";

/** Grabarse cantando un gozo (día 16). El video sale en el videíto si la dueña lo elige. */
export default function VideoActivity({ d }: { d: Day }) {
  const { s, answer } = useApp();
  const ref = useRef<HTMLInputElement>(null);
  const name = typeof s.r[d.n] === "string" ? (s.r[d.n] as string) : null;
  return (
    <>
      {name && gozo.url && <video src={gozo.url} controls playsInline style={{ width: "100%", maxWidth: 320, border: "3px solid var(--ink)", background: "#000" }} />}
      {name && !gozo.url && <p className="meta"><i className="ok" /><span>Video recibido: {name}</span></p>}
      <input
        ref={ref} type="file" accept="video/*" hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) { setGozo(f); answer(d, f.name || "video"); }
          e.target.value = "";
        }}
      />
      <div className="row">
        <button className="btn" type="button" onClick={() => ref.current?.click()}>{name ? "Cambiar mi video" : "Grabar o subir mi video"}</button>
        {name && <button className="btn alt" type="button" onClick={() => { clearGozo(); answer(d, undefined); }}>Quitar</button>}
      </div>
      <p className="note">Con 10 o 15 segundos basta. En este prototipo el video solo se ve mientras tenga la página abierta; con la base de datos quedará guardado en la sala.</p>
    </>
  );
}
