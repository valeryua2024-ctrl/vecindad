import { DEFAULT_LOOK, type AvatarLook } from "@/data/avatar-options";

/* Todo lo que la app recuerda de la sala y de quien la está usando.
   Hoy vive en el navegador (localStorage). Para tener salas reales compartidas,
   basta con escribir otro RoomRepository (por ejemplo contra Supabase) con la misma forma. */

export type Role = "creadora" | "amiga" | "invitada";
export type Answer = string | string[] | number[] | boolean;
export interface FaceCrop { cx: number; cy: number; w: number }
export interface RoomMember { room_id: string; user_id: string; display_name: string; role: "owner" | "member" }
export interface RoomAnswer { room_id: string; member_id: string; day_n: number; value: Answer; updated_at: string }

export interface AppState {
  /** Día simulado ("hoy es") del prototipo */
  sim: number;
  /** Ventanita abierta en pantalla */
  sel: number;
  role: Role;
  name: string;
  room: string;
  /** Lo que la dueña eligió para el videíto en cada día */
  feat: Record<number, string>;
  sound: boolean;
  /** Ya se soltó el lazo de la caja */
  unboxed: boolean;
  av: AvatarLook;
  face: string | null;
  faceSrc?: string | null;
  fc?: FaceCrop | null;
  fd?: { w: number; h: number } | null;
  /** Lugares propuestos (día 15) y planes propuestos (día 12) */
  extra: string[];
  ext12: string[];
  closed: Record<number, boolean>;
  /** Respuestas propias, por número de día */
  r: Record<number, Answer>;
  /** A quién le tocó en el amigo secreto, y el reparto completo */
  draw: string | null;
  drawP?: Record<string, string> | null;
  /** Frase editable del día 17 */
  q17?: string;
  /** Conexión de sala compartida; vacía en modo prototipo local. */
  cloudRoomId?: string | null;
  cloudRoomCode?: string | null;
  cloudMemberId?: string | null;
  cloudRole?: "owner" | "member" | null;
  cloudReady?: boolean;
  cloudMembers?: RoomMember[];
  cloudAnswers?: RoomAnswer[];
  inviteCode?: string | null;
}

export const DEFAULT_STATE: AppState = {
  sim: 12,
  sel: 12,
  role: "creadora",
  name: "Juli",
  room: "La Vecindad",
  feat: {},
  sound: true,
  unboxed: false,
  av: { ...DEFAULT_LOOK },
  face: null,
  extra: [],
  ext12: [],
  closed: {},
  r: {
    1: "🌱 💼 💛",
    3: ["28 de diciembre", "29 de diciembre"],
    4: ["Dani"],
    5: "Volver a reunirnos después de tanto tiempo.",
    6: ["Medias"],
    9: [10000, 30000],
  },
  draw: null,
  cloudRoomId: null,
  cloudRoomCode: null,
  cloudMemberId: null,
  cloudRole: null,
  cloudReady: false,
  cloudMembers: [],
  cloudAnswers: [],
  inviteCode: null,
};

export interface RoomRepository {
  load(): AppState;
  save(state: AppState): void;
}

const STORAGE_KEY = "adviento-vecindad-v1";
export const freshState = (): AppState => structuredClone(DEFAULT_STATE);

export const localRepository: RoomRepository = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const s = raw ? (JSON.parse(raw) as AppState) : null;
      if (s && s.r && s.role) {
        const joined = { ...freshState(), ...s, av: s.av || { ...DEFAULT_LOOK }, feat: s.feat || {} };
        const inviteCode = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("sala");
        if (inviteCode) return { ...freshState(), role: "invitada", inviteCode: inviteCode.trim().toUpperCase() };
        return joined;
      }
    } catch {
      /* sin almacenamiento disponible: se arranca con el estado de ejemplo */
    }
    const inviteCode = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("sala");
    return inviteCode ? { ...freshState(), role: "invitada", inviteCode: inviteCode.trim().toUpperCase() } : freshState();
  },
  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* navegador en modo privado o sin espacio: se sigue sin guardar */
    }
  },
};
