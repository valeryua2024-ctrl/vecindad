"use client";

import { useApp } from "../AppContext";
import Sticker from "../ui/Sticker";
import { DAYS, color2, colorOf, realOf } from "@/data/days";
import { STATUS_LABEL, dayStatus } from "@/lib/rules";

/** Las 24 ventanitas en lista (solo la ve la dueña del aviso) */
export default function DayList() {
  const { s, openDay } = useApp();
  return (
    <details className="card">
      <summary>Las 24 ventanitas de un vistazo</summary>
      <div className="list">
        {DAYS.map((d) => {
          const st = dayStatus(s, d), r = realOf(d);
          return (
            <button key={d.n} className="li" type="button" onClick={() => openDay(d.n)}>
              <span className="n">{d.n}</span>
              <Sticker name={d.ic} a={colorOf(d)} b={color2(d)} />
              <span>
                <b>{st === "locked" ? "Sorpresa" : d.title}</b>
                <small>{d.cat + (r ? " · " + r : "") + (d.enc ? " · arma el encuentro" : "")}</small>
              </span>
              <em data-s={st}>{STATUS_LABEL[st]}</em>
            </button>
          );
        })}
      </div>
    </details>
  );
}
