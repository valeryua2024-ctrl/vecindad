import type { AvatarLook } from "./avatar-options";

/* Vecinas de ejemplo. Mientras no haya base de datos, son ellas las que "responden" en cada ventanita.
   Cuando se conecte un backend, esta lista sale de la sala real. */
export interface Vecina extends AvatarLook {
  n: string;
  c: string;
}

export const VECINAS: Vecina[] = [
  { n: "Caro", c: "#D81E27", skin: 0, hair: "#5A3418", top: 2, bottom: 1, shoes: 1, hood: 1 },
  { n: "Pauli", c: "#17A35A", skin: 3, hair: "#1E120C", top: 3, bottom: 0, shoes: 0, hood: 0 },
  { n: "Vero", c: "#FF7A1A", skin: 1, hair: "#7A2E16", top: 4, bottom: 2, shoes: 3, hood: 2 },
  { n: "Dani", c: "#1747B5", skin: 4, hair: "#161616", top: 1, bottom: 3, shoes: 4, hood: 0 },
  { n: "Lore", c: "#EC3F8C", skin: 2, hair: "#B8742A", top: 0, bottom: 4, shoes: 2, hood: 1 },
];

export const NAMES = VECINAS.map((v) => v.n);

export const who = (name: string): { n: string; c: string } => VECINAS.find((v) => v.n === name) || { n: name, c: "#161616" };

/* Lo que cada vecina le escribe a su amiga secreta el día 11 (se entrega el 24, sin firma). */
export const SECRET_MESSAGES: Record<string, string> = {
  Caro: "Admiro cómo haces sentir en casa a cualquiera.",
  Pauli: "Tu risa arregla cualquier día malo.",
  Vero: "Nunca te he visto dejar sola a nadie.",
  Dani: "Admiro lo valiente que fuiste este año.",
  Lore: "Gracias por acordarte siempre de los cumpleaños de todas.",
};
