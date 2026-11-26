import { DEFAULT_LOOK, type AvatarLook } from "@/data/avatar-options";
import { CHARACTER_TEMPLATES } from "@/data/character-templates";

/* Todo lo que la app recuerda de la sala y de quien la está usando.
   Hoy vive en el navegador (localStorage). Para tener salas reales compartidas,
   basta con escribir otro RoomRepository (por ejemplo contra Supabase) con la misma forma. */

export type Role = "creadora" | "amiga" | "invitada";
export type Answer = string | string[] | number[] | boolean;
export interface FaceCrop { cx: number; cy: number; w: number }
export interface RoomMember { room_id: string; user_id: string; display_name: string; role: "owner" | "member"; character_id: string; face_data: string | null }
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
  /** Versión de las opciones locales del personaje. */
  avatarVersion?: number;
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
  characterId?: string | null;
  cloudRole?: "owner" | "member" | null;
  cloudReady?: boolean;
  cloudMembers: RoomMember[];
  cloudAnswers: RoomAnswer[];
  inviteCode?: string | null;
  /** Paso pendiente de configuración inicial para la dueña de una sala nueva. */
  setupStep?: "character" | null;
}

export const DEFAULT_STATE: AppState = {
  sim: 12,
  sel: 12,
  role: "creadora",
  name: "Juli",
  room: "La Vecindad",
  feat: {},
  avatarVersion: 4,
  sound: true,
  unboxed: false,
  av: { ...DEFAULT_LOOK },
  face: null,
  characterId: null,
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
  setupStep: null,
};

export interface RoomRepository {
  load(): AppState;
  save(state: AppState): void;
}

const STORAGE_KEY = "adviento-vecindad-v1";
const localRandomCharacter = () => CHARACTER_TEMPLATES[5 + Math.floor(Math.random() * (CHARACTER_TEMPLATES.length - 5))].id;
export const freshState = (): AppState => {
  const state = structuredClone(DEFAULT_STATE);
  const characterId = localRandomCharacter();
  state.characterId = characterId;
  state.av.templateId = characterId;
  return state;
};

export const localRepository: RoomRepository = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const s = raw ? (JSON.parse(raw) as AppState) : null;
      if (s && s.r && s.role) {
        const savedAvatarVersion = s.avatarVersion || 0;
        const av = { ...(s.av || DEFAULT_LOOK) };
        if (savedAvatarVersion < 2 && s.av) {
          const skinMap = [0, 2, 1, 5, 6];
          av.skin = skinMap[av.skin] ?? av.skin;
        }
        if (savedAvatarVersion < 3) Object.assign(av, DEFAULT_LOOK, { skin: av.skin ?? DEFAULT_LOOK.skin });
        const fallbackCharacter = localRandomCharacter();
        const characterId = savedAvatarVersion < 4 ? fallbackCharacter : (av.templateId || fallbackCharacter);
        av.templateId = characterId;
        const joined = { ...freshState(), ...s, avatarVersion: 4, av, characterId, feat: s.feat || {} };
        const inviteCode = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("sala");
        if (inviteCode) {
          const normalizedCode = inviteCode.trim().toUpperCase();
          if (joined.cloudReady && joined.cloudRoomId && joined.cloudRoomCode?.toUpperCase() === normalizedCode) return joined;
          return { ...freshState(), role: "invitada", inviteCode: normalizedCode };
        }
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

