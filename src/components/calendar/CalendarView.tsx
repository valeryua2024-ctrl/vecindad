"use client";

import { useEffect } from "react";
import { useApp } from "../AppContext";
import AdventBox from "./AdventBox";
import DayList from "./DayList";
import RoomSettings from "./RoomSettings";
import AvatarBuilder from "../avatar/AvatarBuilder";
import DayPanel from "../day/DayPanel";
import { dayOf } from "@/data/days";
import { isBoss, isDone } from "@/lib/rules";

/* Calendario: la caja con las cajitas (home) o la ventanita abierta (day). */
export default function CalendarView() {
  const { s, get, calMode, openDay, goHome } = useApp();
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
        {boss && <RoomSettings />}
        {s.role !== "amiga" && (
          <details className="card">
            <summary>Mi muñequita para el video</summary>
            <div style={{ marginTop: 14 }}><AvatarBuilder /></div>
          </details>
        )}
        {s.role !== "amiga" && <DayList />}
      </div>
      {calMode === "day" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
          <button className="btn alt sm" type="button" onClick={goHome}>← Volver al calendario</button>
          <DayPanel />
        </div>
      )}
    </section>
  );
}
