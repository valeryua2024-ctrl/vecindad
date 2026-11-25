"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Day } from "@/data/days";
import { dayOf } from "@/data/days";
import { boom as fireConfetti } from "@/canvas/confetti";
import { isDone, videoLocked } from "@/lib/rules";
import { SFX, setSoundEnabled } from "@/lib/sound";
import { freshState, localRepository, type Answer, type AppState, type RoomRepository } from "@/lib/state";

/* Estado compartido de toda la app: la sala, las respuestas, qué se ve en pantalla,
   los avisos (toasts), el confeti y la pantalla de la frase chistosa.
   Los componentes leen `s` y cambian cosas con `update` o `answer`. */

export type View = "calendario" | "encuentro" | "recuerdo";
export type CalMode = "home" | "day";

interface AppApi {
  s: AppState;
  /** Último estado guardado (para usar dentro de animaciones y temporizadores) */
  get: () => AppState;
  update: (fn: (draft: AppState) => void) => void;
  /** Guarda la respuesta del día y, si es la primera vez, muestra la frase chistosa */
  answer: (d: Day, value: Answer | undefined) => void;
  /** Para cambios hechos a mano (como el papelito): revisa si el día quedó respondido por primera vez */
  afterAnswer: (d: Day, wasDone: boolean) => void;
  reset: () => void;
  view: View;
  go: (v: View) => void;
  calMode: CalMode;
  setCalMode: (m: CalMode) => void;
  /** Abre una ventanita con la animación de la caja (o directo si no hay caja en pantalla) */
  openDay: (n: number) => void;
  registerOpener: (fn: ((n: number) => void) | null) => void;
  showDay: (n: number) => void;
  goHome: () => void;
  toast: (msg: string) => void;
  boom: () => void;
  celebrate: (d: Day) => void;
  jokeDay: number | null;
  closeJoke: (home: boolean) => void;
  fxRef: React.RefObject<HTMLCanvasElement | null>;
}

const Ctx = createContext<AppApi | null>(null);

export function useApp(): AppApi {
  const api = useContext(Ctx);
  if (!api) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return api;
}

const readHash = (): View => {
  const h = typeof window === "undefined" ? "" : window.location.hash.slice(1);
  return h === "encuentro" || h === "recuerdo" ? h : "calendario";
};

export function AppProvider({ children, repo = localRepository }: { children: ReactNode; repo?: RoomRepository }) {
  const [s, setS] = useState<AppState>(() => repo.load());
  const sRef = useRef(s);
  const commit = useCallback((next: AppState) => { sRef.current = next; setS(next); repo.save(next); }, [repo]);
  const get = useCallback(() => sRef.current, []);
  const update = useCallback((fn: (draft: AppState) => void) => { const next = structuredClone(sRef.current); fn(next); commit(next); }, [commit]);

  /* avisos */
  const [toastMsg, setToastMsg] = useState<{ msg: string; key: number } | null>(null);
  const toast = useCallback((msg: string) => setToastMsg({ msg, key: Date.now() }), []);
  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 2800);
    return () => clearTimeout(t);
  }, [toastMsg]);

  /* confeti y frase chistosa */
  const fxRef = useRef<HTMLCanvasElement | null>(null);
  const boom = useCallback(() => fireConfetti(fxRef.current), []);
  const [jokeDay, setJokeDay] = useState<number | null>(null);
  const celebrate = useCallback((d: Day) => { boom(); SFX.done(); setJokeDay(d.n); }, [boom]);

  const afterAnswer = useCallback((d: Day, wasDone: boolean) => {
    const fresh = !wasDone && isDone(sRef.current, d);
    if (!fresh || d.multi) return; // los de varias opciones se envían con "Listo, enviar"
    if (d.type === "draw") setTimeout(() => celebrate(d), 2200); // deja ver a quién le tocó
    else celebrate(d);
  }, [celebrate]);

  const answer = useCallback((d: Day, value: Answer | undefined) => {
    const was = isDone(sRef.current, d);
    update((x) => { if (value === undefined) delete x.r[d.n]; else x.r[d.n] = value; });
    afterAnswer(d, was);
  }, [update, afterAnswer]);

  /* navegación por secciones (#calendario, #encuentro, #recuerdo) */
  const [hashView, setHashView] = useState<View>(readHash);
  useEffect(() => {
    const on = () => setHashView(readHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const view: View = hashView === "recuerdo" && videoLocked(s) ? "calendario" : hashView;
  const go = useCallback((v: View) => { window.location.hash = v; }, []);

  /* calendario: la caja (home) o una ventanita abierta (day) */
  const [calMode, setCalMode] = useState<CalMode>("home");
  const opener = useRef<((n: number) => void) | null>(null);
  const registerOpener = useCallback((fn: ((n: number) => void) | null) => { opener.current = fn; }, []);
  const showDay = useCallback((n: number) => {
    update((x) => { x.sel = n; });
    setCalMode("day");
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, [update]);
  const openDay = useCallback((n: number) => {
    if (readHash() !== "calendario") go("calendario");
    if (opener.current) opener.current(n);
    else showDay(n);
  }, [go, showDay]);
  const goHome = useCallback(() => setCalMode("home"), []);
  const closeJoke = useCallback((home: boolean) => { setJokeDay(null); if (home) setCalMode("home"); }, []);

  const reset = useCallback(() => { commit(freshState()); setCalMode("home"); toast("Prototipo reiniciado"); }, [commit, toast]);

  useEffect(() => { setSoundEnabled(s.sound !== false); }, [s.sound]);

  const api = useMemo<AppApi>(() => ({
    s, get, update, answer, afterAnswer, reset, view, go, calMode, setCalMode, openDay, registerOpener, showDay, goHome,
    toast, boom, celebrate, jokeDay, closeJoke, fxRef,
  }), [s, get, update, answer, afterAnswer, reset, view, go, calMode, openDay, registerOpener, showDay, goHome, toast, boom, celebrate, jokeDay, closeJoke]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {toastMsg && <div key={toastMsg.key} className="toast" role="status">{toastMsg.msg}</div>}
    </Ctx.Provider>
  );
}

export const dayByNumber = dayOf;
