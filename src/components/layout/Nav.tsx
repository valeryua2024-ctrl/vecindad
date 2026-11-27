"use client";

import { useApp, type View } from "../AppContext";
import { videoLocked } from "@/lib/rules";
import { SFX, stopMusic } from "@/lib/sound";

/* Las participantes navegan entre el calendario y el encuentro; la dueña también accede al videíto. */
export default function Nav() {
  const { s, view, update, toast } = useApp();
  const locked = videoLocked(s);
  const link = (v: View, label: string) => (
    <a
      href={"#" + v}
      aria-current={view === v ? "page" : undefined}
      className={v === "recuerdo" && locked ? "locked" : undefined}
      aria-disabled={v === "recuerdo" && locked ? true : undefined}
      onClick={(e) => {
        if (v === "recuerdo" && locked) { e.preventDefault(); toast("El videíto se abre el 24 de diciembre, con la última ventanita"); }
      }}
    >
      {label}
    </a>
  );
  const soundOn = s.sound !== false;
  return (
    <nav className="app-nav" data-role={s.role} aria-label="Secciones">
      {link("calendario", "Calendario")}
      {link("encuentro", "Nuestro encuentro")}
      {s.role !== "amiga" && link("recuerdo", locked ? "El videíto · se abre el 24" : "El videíto")}
      <button
        type="button"
        className="snd"
        aria-pressed={soundOn}
        aria-label={soundOn ? "Silenciar sonido" : "Activar sonido"}
        title={soundOn ? "Silenciar sonido" : "Activar sonido"}
        onClick={() => {
          update((x) => { x.sound = !soundOn; });
          if (soundOn) stopMusic(); else setTimeout(() => SFX.pop(), 0);
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          {soundOn ? <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></> : <><path d="m16 9 5 6" /><path d="m21 9-5 6" /></>}
        </svg>
      </button>
    </nav>
  );
}
