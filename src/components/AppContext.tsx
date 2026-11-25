"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Day } from "@/data/days";
import { dayOf } from "@/data/days";
import { boom as fireConfetti } from "@/canvas/confetti";
import { isDone, videoLocked } from "@/lib/rules";
import { SFX, setSoundEnabled } from "@/lib/sound";
import { freshState, localRepository, type Answer, type AppState, type RoomRepository } from "@/lib/state";
import { cloudConfigured, createCloudRoom, ensureAnonymousUser, getCloudMembership, joinCloudRoom, loadCloudRoom, removeCloudChannel, saveCloudAnswer, watchCloudAnswers } from "@/lib/cloud";

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
  joinSharedRoom: (code: string, name: string) => Promise<void>;
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

  /* Una sala en la nube identifica a cada vecina con una sesión anónima persistente. */
  const cloudInit = useRef(false);
  useEffect(() => {
    if (!cloudConfigured || cloudInit.current) return;
    cloudInit.current = true;
    let cancelled = false;
    void (async () => {
      try {
        const userId = await ensureAnonymousUser();
        if (cancelled) return;
        const current = sRef.current;
        if (current.role === "invitada") return; // la vecina entra al enviar el código y su nombre

        let member = current.cloudRoomId ? await getCloudMembership(current.cloudRoomId, userId) : null;
        if (cancelled) return;
        if (!member && current.role === "creadora") {
          const room = await createCloudRoom(current.room, current.name);
          if (cancelled) return;
          const next = structuredClone(sRef.current);
          next.room = room.room_name;
          next.role = "creadora";
          next.cloudRoomId = room.room_id;
          next.cloudRoomCode = room.code;
          next.cloudMemberId = room.member_id;
          next.cloudRole = "owner";
          next.cloudReady = true;
          next.cloudAnswers = [];
          next.cloudMembers = [];
          next.r = {}; // las respuestas de muestra no se hacen pasar por respuestas reales
          commit(next);
          return;
        }
        if (!member) {
          const next = structuredClone(sRef.current);
          next.role = "invitada";
          next.inviteCode = current.cloudRoomCode || current.inviteCode || null;
          next.cloudRoomId = null;
          next.cloudMemberId = null;
          next.cloudRole = null;
          next.cloudReady = false;
          commit(next);
          return;
        }
        const next = structuredClone(sRef.current);
        next.name = member.display_name;
        next.role = member.role === "owner" ? "creadora" : "amiga";
        next.cloudRoomId = member.room_id;
        next.cloudMemberId = member.user_id;
        next.cloudRole = member.role;
        next.cloudReady = true;
        next.cloudAnswers = [];
        next.cloudMembers = [];
        commit(next);
      } catch (error) {
        if (!cancelled) toast(error instanceof Error ? `No se pudo conectar la sala: ${error.message}` : "No se pudo conectar la sala.");
      }
    })();
    return () => { cancelled = true; };
  }, [commit, toast]);

  useEffect(() => {
    if (!cloudConfigured || !s.cloudReady || !s.cloudRoomId) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const data = await loadCloudRoom(s.cloudRoomId!);
        if (cancelled) return;
        update((x) => {
          x.cloudMembers = data.members;
          x.cloudAnswers = data.answers;
          x.r = Object.fromEntries(data.answers.filter((answer) => answer.member_id === x.cloudMemberId).map((answer) => [answer.day_n, answer.value]));
        });
      } catch (error) {
        if (!cancelled) toast(error instanceof Error ? `No se pudieron cargar las respuestas: ${error.message}` : "No se pudieron cargar las respuestas.");
      }
    };
    void refresh();
    const channel = watchCloudAnswers(s.cloudRoomId, () => { void refresh(); });
    return () => { cancelled = true; void removeCloudChannel(channel); };
  }, [s.cloudReady, s.cloudRoomId, update, toast]);

  /* confeti y frase chistosa */
  const fxRef = useRef<HTMLCanvasElement | null>(null);
  const boom = useCallback(() => fireConfetti(fxRef.current), []);
  const [jokeDay, setJokeDay] = useState<number | null>(null);
  const celebrate = useCallback((d: Day) => { boom(); SFX.done(); setJokeDay(d.n); }, [boom]);

  const afterAnswer = useCallback((d: Day, wasDone: boolean) => {
    const answered = isDone(sRef.current, d);
    const repeatJoke = answered && [1, 4, 5, 6, 9].includes(d.n);
    if ((!answered || (wasDone && !repeatJoke)) || d.multi) return; // los de varias opciones se envían con "Listo, enviar"
    if (d.type === "draw") setTimeout(() => celebrate(d), 2200); // deja ver a quién le tocó
    else celebrate(d);
  }, [celebrate]);

  const answer = useCallback((d: Day, value: Answer | undefined) => {
    const was = isDone(sRef.current, d);
    update((x) => { if (value === undefined) delete x.r[d.n]; else x.r[d.n] = value; });
    afterAnswer(d, was);
    const current = sRef.current;
    if (cloudConfigured && current.cloudReady && current.cloudRoomId && current.cloudMemberId) {
      void saveCloudAnswer(current.cloudRoomId, current.cloudMemberId, d.n, value)
        .catch((error: unknown) => toast(error instanceof Error ? `No se pudo guardar la respuesta: ${error.message}` : "No se pudo guardar la respuesta."));
    }
  }, [update, afterAnswer, toast]);

  const joinSharedRoom = useCallback(async (code: string, name: string) => {
    if (!cloudConfigured) throw new Error("La sala compartida todavía no está configurada.");
    const room = await joinCloudRoom(code, name);
    update((x) => {
      x.name = name.trim();
      x.room = room.room_name;
      x.role = room.role === "owner" ? "creadora" : "amiga";
      x.cloudRoomId = room.room_id;
      x.cloudRoomCode = room.code;
      x.cloudMemberId = room.member_id;
      x.cloudRole = room.role;
      x.cloudReady = true;
      x.cloudAnswers = [];
      x.cloudMembers = [];
      x.inviteCode = null;
      x.r = {};
    });
  }, [update]);

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
    s, get, update, answer, joinSharedRoom, afterAnswer, reset, view, go, calMode, setCalMode, openDay, registerOpener, showDay, goHome,
    toast, boom, celebrate, jokeDay, closeJoke, fxRef,
  }), [s, get, update, answer, joinSharedRoom, afterAnswer, reset, view, go, calMode, openDay, registerOpener, showDay, goHome, toast, boom, celebrate, jokeDay, closeJoke]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {toastMsg && <div key={toastMsg.key} className="toast" role="status">{toastMsg.msg}</div>}
    </Ctx.Provider>
  );
}

export const dayByNumber = dayOf;
