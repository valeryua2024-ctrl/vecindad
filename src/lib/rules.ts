import { DAYS, dayOf, realOf, FEATURED, type Day, type DayCtx, type PollSample, type PriceSample, type TextSample } from "@/data/days";
import { NAMES, VECINAS } from "@/data/vecinas";
import type { AvatarLook } from "@/data/avatar-options";
import type { AppState } from "./state";

/* Reglas del calendario: quién ve qué, cómo se cuentan los votos y qué se decide para el encuentro.
   Son funciones puras: reciben el estado y devuelven un resultado, así se pueden probar y reutilizar. */

export const meName = (s: AppState) => s.name || "Juli";
export const isBoss = (s: AppState) => s.role === "creadora";

/** Contexto para las preguntas que dependen del estado (la fecha ganadora se calcula solo si se pide) */
export const dayCtx = (s: AppState): DayCtx => ({ s, get winner() { return winner(s); } });
export function resolve<T>(v: T | ((c: DayCtx) => T), s: AppState): T {
  return typeof v === "function" ? (v as (c: DayCtx) => T)(dayCtx(s)) : v;
}
export const optionsOf = (s: AppState, d: Day): string[] => (d.options ? resolve(d.options, s) : []);

/* ---------- votaciones ---------- */
export function tally(s: AppState, n: number): Record<string, string[]> {
  const d = dayOf(n);
  const t: Record<string, string[]> = {};
  optionsOf(s, d).forEach((o) => (t[o] = []));
  const sample = d.sample as PollSample;
  for (const name in sample) sample[name].forEach((o) => t[o] && t[o].push(name));
  const mine = s.r[n];
  if (Array.isArray(mine)) (mine as string[]).forEach((o) => t[o] && t[o].push("Tú"));
  return t;
}
export function topOf(s: AppState, n: number): string {
  const t = tally(s, n);
  let best = "";
  for (const o in t) if (!best || t[o].length > t[best].length) best = o;
  return best;
}
export const votes = (s: AppState, n: number) => tally(s, n)[topOf(s, n)]?.length ?? 0;

/** Día del encuentro: el más votado el día 3 */
export const winner = (s: AppState) => parseInt(topOf(s, 3), 10);
export const weekday = (n: number) => ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date(2026, 11, n).getDay()];
/** La fecha se conoce desde el día 4, cuando la dueña la anuncia en el grupo */
export const dateKnown = (s: AppState) => isBoss(s) || s.sim >= 4;
export const placeKnown = (s: AppState) => isBoss(s) || s.sim >= 15;

/* ---------- presupuesto (día 9) ---------- */
export const PMIN = 5000;
export const PMAX = 100000;
export const PRESETS: [number, number, string][] = [[5000, 20000, "Hasta $20.000"], [20000, 50000, "$20.000 a $50.000"], [50000, 100000, "Más de $50.000"]];
export const thousands = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const money = (n: number) => "$" + thousands(n);
export function ranges(s: AppState): [number, number][] {
  const r = Object.values(dayOf(9).sample as PriceSample);
  const mine = s.r[9];
  if (Array.isArray(mine) && typeof mine[0] === "number") r.push(mine as unknown as [number, number]);
  return r;
}
/** Tope del grupo: el máximo más bajo que alguien marcó, para que nadie quede por fuera */
export const budgetMax = (s: AppState) => Math.min(...ranges(s).map((r) => r[1]));

/* ---------- estado de cada ventanita ---------- */
export function isDone(s: AppState, d: Day): boolean {
  const r = s.r[d.n];
  if (d.type === "draw") return !!s.draw;
  return Array.isArray(r) ? r.length > 0 : !!r;
}
export const unlocked = (s: AppState, d: Day) => isBoss(s) || d.n <= s.sim;
export type DayStatus = "locked" | "open" | "today" | "done";
export function dayStatus(s: AppState, d: Day): DayStatus {
  if (!unlocked(s, d)) return "locked";
  return isDone(s, d) ? "done" : d.n === s.sim ? "today" : "open";
}
export const STATUS_LABEL: Record<DayStatus, string> = { locked: "Cerrada", open: "Por responder", today: "La de hoy", done: "Respondida" };

/** Quiénes de las vecinas de ejemplo ya respondieron */
export function responded(d: Day): string[] {
  const v = d.sample;
  if (Array.isArray(v)) return (v as (string | [string, string])[]).map((e) => (Array.isArray(e) ? e[0] : e));
  return Object.keys(v);
}
export const textSample = (d: Day) => d.sample as TextSample;

/** Cada ventanita se puede cambiar hasta las 12 de la noche de su día; si no se respondió, se puede poner al día */
export const canEdit = (s: AppState, d: Day) => isBoss(s) || d.n === s.sim || !isDone(s, d);
export function editNote(s: AppState, d: Day) {
  if (!canEdit(s, d)) return "cerró a las 12 de la noche";
  if (d.n === s.sim) return "puede cambiarla hasta las 12 de la noche";
  return isBoss(s) ? "cada ventanita se cambia hasta las 12 de la noche de su día" : "ya pasó, pero aún puede responder";
}

/* ---------- muñequitas ---------- */
export const myLook = (s: AppState): AvatarLook => ({ hair: "#2B1A12", ...s.av, face: s.face || null });
export const lookOf = (s: AppState, name: string): AvatarLook => {
  const member = s.cloudMembers.find((v) => v.display_name === name);
  if (member) return { ...s.av, templateId: member.character_id, face: member.face_data };
  return VECINAS.find((v) => v.n === name) || myLook(s);
};
export const everyone = (s: AppState) => s.cloudReady && s.cloudMembers.length ? s.cloudMembers.map((m) => m.display_name) : [meName(s), ...NAMES];

/* ---------- lo que sale en el videíto ---------- */
export interface PhotoItem { src?: string; by: string; day?: number; vid?: boolean; play?: boolean }
export const featOptions = (s: AppState, n: number) => [...(isDone(s, dayOf(n)) ? [meName(s)] : []), ...responded(dayOf(n))];
export function featOf(s: AppState, n: number) {
  const o = featOptions(s, n);
  return o.includes(s.feat[n]) ? s.feat[n] : o[0];
}
export function featText(s: AppState, n: number): [string, string] {
  const w = featOf(s, n);
  const sample = textSample(dayOf(n));
  return [w, w === meName(s) ? String(s.r[n]) : (sample.find((e) => e[0] === w) || sample[0])[1]];
}
export function featPhoto(s: AppState, n: number): PhotoItem {
  const w = featOf(s, n);
  return w === meName(s) && s.r[n] ? { src: String(s.r[n]), by: w, day: n } : { by: w, day: n };
}
export const allPhotos = (s: AppState, n: number): PhotoItem[] => [
  ...(s.r[n] ? [{ src: String(s.r[n]), by: meName(s), day: n }] : []),
  ...(dayOf(n).sample as string[]).map((by) => ({ by, day: n })),
];
/** Fotos de los retos para el árbol del cartel */
export function retoPhotos(s: AppState): PhotoItem[] {
  const out: PhotoItem[] = [];
  [2, 7, 19, 22].filter((n) => isBoss(s) || n <= s.sim).forEach((n) => out.push(...allPhotos(s, n)));
  return out;
}
export { FEATURED };

/* ---------- plan y lugar ---------- */
/** "Casa de Vero" → ["en casa de", "Vero"], para el cartel: "Cena en casa de" / "VERO" */
export function placeParts(p: string): [string, string] {
  p = String(p || "").trim();
  let m = p.match(/^casa de (.+)$/i);
  if (m) return ["en casa de", m[1]];
  m = p.match(/^(la finca|el apartamento|el apto|la casa|el patio|la terraza) de (.+)$/i);
  if (m) return ["en " + m[1].toLowerCase() + " de", m[2]];
  if (/^(donde|en) /i.test(p)) return ["", p];
  return ["en", p.replace(/^(La|El|Los|Las) /, (a) => a.toLowerCase())];
}
export function planLine(s: AppState) {
  const [pre, place] = placeParts(topOf(s, 15));
  return [topOf(s, 12), pre, place].filter(Boolean).join(" ");
}

/* ---------- amigo secreto ---------- */
/** Reparte todos los nombres de una vez: nadie se saca a sí misma y ningún nombre se repite */
export function derange(): Record<string, string> {
  const all = ["YO", ...NAMES];
  for (;;) {
    const sh = all.slice().sort(() => Math.random() - 0.5);
    if (sh.every((n, i) => n !== all[i])) return Object.fromEntries(all.map((n, i) => [n, sh[i]]));
  }
}
/** Quién me sacó a mí (me escribe el mensaje que llega el 24) */
export const secretGiver = (s: AppState) => (s.drawP ? Object.keys(s.drawP).find((k) => s.drawP![k] === "YO") : undefined);

/* ---------- después de responder ---------- */
export type NextInfo = { kind: "open"; d: Day } | { kind: "wait"; d: Day } | { kind: "end" };
export function nextInfo(s: AppState, n: number): NextInfo {
  const open = DAYS.find((x) => x.n > n && unlocked(s, x) && !isDone(s, x));
  if (open) return { kind: "open", d: open };
  if (s.sim < 24) return { kind: "wait", d: dayOf(s.sim + 1) };
  return { kind: "end" };
}
export function untilMidnight() {
  const now = new Date();
  const m = new Date(now);
  m.setHours(24, 0, 0, 0);
  const t = Math.max(0, Math.floor((m.getTime() - now.getTime()) / 1000));
  const p = (v: number) => String(v).padStart(2, "0");
  return p(Math.floor(t / 3600)) + ":" + p(Math.floor((t % 3600) / 60)) + ":" + p(t % 60);
}
export const normWord = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** Las vecinas solo ven el videíto desde el 24 */
export const videoLocked = (s: AppState) => s.role === "amiga" && s.sim < 24;

export { realOf };

