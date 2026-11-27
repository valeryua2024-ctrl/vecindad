"use client";

import { useApp, type View } from "../AppContext";
import { videoLocked } from "@/lib/rules";

/* Las participantes navegan entre el calendario y el encuentro; la dueña también accede al videíto. */
export default function Nav() {
  const { s, view, toast } = useApp();
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
  return (
    <nav className="app-nav" data-role={s.role} aria-label="Secciones">
      {link("calendario", "Calendario")}
      {link("encuentro", "Nuestro encuentro")}
      {s.role !== "amiga" && link("recuerdo", locked ? "El videíto · se abre el 24" : "El videíto")}
    </nav>
  );
}
