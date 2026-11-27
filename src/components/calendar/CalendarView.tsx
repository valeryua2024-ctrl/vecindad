"use client";

import { useEffect, useState } from "react";
import { useApp } from "../AppContext";
import AdventBox from "./AdventBox";
import DayList from "./DayList";
import RoomSettings from "./RoomSettings";
import FaceSettings from "../avatar/FaceSettings";
import DayPanel from "../day/DayPanel";
import { dayOf } from "@/data/days";
import { isBoss, isDone } from "@/lib/rules";
import { SFX, stopMusic } from "@/lib/sound";

/* Calendario: la caja con las cajitas (home) o la ventanita abierta (day). */
export default function CalendarView() {
  const { s, get, calMode, openDay, goHome, update } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const soundOn = s.sound !== false;
  const boss = isBoss(s), today = dayOf(s.sim);

  // Al entrar, si la caja ya está abierta y la ventanita de hoy no se ha respondido, se abre sola
  useEffect(() => {
    const t = setTimeout(() => {
      const cur = get();
      if (cur.role !== "invitada" && cur.unboxed && !isDone(cur, dayOf(cur.sim))) openDay(cur.sim);
    }, 1300);
    return () => clearTimeout(t);
    // solo al montar la vista
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section>
      <div hidden={calMode !== "home"} style={{ display: calMode === "home" ? "flex" : undefined, flexDirection: "column", gap: 20 }}>
        <AdventBox />
        <div className="cal-actions">
          <button className="btn" type="button" onClick={() => openDay(s.sim)}>
            {!s.unboxed ? "Soltar el lazo" : isDone(s, today) ? "Ver la ventanita de hoy" : "Abrir la ventanita de hoy"}
          </button>
        </div>
        <button className="settings-open" type="button" onClick={() => setShowSettings(true)}>
          <span>Configuración</span><span className="settings-gear" aria-hidden="true">⚙</span>
        </button>
        {!s.cloudReady && s.role !== "amiga" && <DayList />}
      </div>
      {calMode === "day" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
          <button className="btn alt sm" type="button" onClick={goHome}>← Volver al calendario</button>
          <DayPanel />
        </div>
      )}
      {showSettings && <div className="settings-backdrop" onClick={() => setShowSettings(false)}>
        <section className="settings-sheet" role="dialog" aria-modal="true" aria-labelledby="settings-heading" onClick={(event) => event.stopPropagation()}>
          <div className="settings-sheet-handle" aria-hidden="true" />
          <header className="settings-sheet-header">
            <h2 id="settings-heading">Ajustes</h2>
            <button type="button" className="settings-close" aria-label="Cerrar ajustes" onClick={() => setShowSettings(false)}>×</button>
          </header>
          <button className="settings-row" type="button" aria-pressed={soundOn} onClick={() => {
            update((x) => { x.sound = !soundOn; });
            if (soundOn) stopMusic(); else setTimeout(() => SFX.pop(), 0);
          }}>
            <span className="settings-row-icon" aria-hidden="true">◖</span>
            <span className="settings-row-copy"><strong>Sonido</strong><small>Activa o desactiva el sonido</small></span>
            <span className={"settings-switch" + (soundOn ? " on" : "")} aria-hidden="true"><i /></span>
          </button>
          <details className="settings-option">
            <summary className="settings-row">
              <span className="settings-row-icon" aria-hidden="true">◎</span>
              <span className="settings-row-copy"><strong>Cambiar mi foto</strong><small>Ajusta tu foto para tu personaje</small></span>
              <span className="settings-chevron" aria-hidden="true">›</span>
            </summary>
            <div className="settings-row-content"><FaceSettings /></div>
          </details>
          {boss && s.cloudReady && <details className="settings-option">
            <summary className="settings-row">
              <span className="settings-row-icon" aria-hidden="true">♧</span>
              <span className="settings-row-copy"><strong>Administrar mi vecindad</strong><small>Configura la sala y sus integrantes</small></span>
              <span className="settings-chevron" aria-hidden="true">›</span>
            </summary>
            <div className="settings-row-content"><RoomSettings /></div>
          </details>}
        </section>
      </div>}
    </section>
  );
}

