"use client";

import { useApp, type View } from "../AppContext";
import { videoLocked } from "@/lib/rules";
import { SFX, stopMusic } from "@/lib/sound";

/* Pestañas de la sala y el botón de sonido. Las vecinas ven el videíto bloqueado hasta el 24. */
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
    <nav aria-label="Secciones">
      {link("calendario", "Calendario")}
      {link("encuentro", "Nuestro encuentro")}
      {link("recuerdo", locked ? "El videíto · se abre el 24" : "El videíto")}
      <button
        type="button"
        className="snd"
        aria-pressed={soundOn}
        onClick={() => {
          update((x) => { x.sound = !soundOn; });
          if (soundOn) stopMusic(); else setTimeout(() => SFX.pop(), 0);
        }}
      >
        {soundOn ? "Con sonido" : "Sin sonido"}
      </button>
    </nav>
  );
}
