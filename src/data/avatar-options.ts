/* Opciones para armar la muñequita: capucha, tono de piel, blusa, pantalón o falda y zapatos. */
export interface AvatarLook {
  top: number;
  bottom: number;
  shoes: number;
  hood: number;
  skin: number;
  hair?: string;
  face?: string | null;
}

export const SKINS = [
  { n: "Clara", c: "#F6D9C0" },
  { n: "Trigueña", c: "#E0AE80" },
  { n: "Dorada", c: "#EBC98A" },
  { n: "Morena", c: "#B87B50" },
  { n: "Oscura", c: "#7B4A2F" },
];

export const HOODS = [
  { n: "Arbolito", k: "arbol" },
  { n: "Papá Noel", k: "noel" },
  { n: "Reno", k: "reno" },
];

export const TOPS: { n: string; c: string; k: string; long?: boolean }[] = [
  { n: "Blusa roja", c: "#D81E27", long: true, k: "btn" },
  { n: "Camiseta tricolor", c: "#FFC918", k: "tri" },
  { n: "Saco navideño", c: "#17A35A", long: true, k: "zig" },
  { n: "Blusa de flores", c: "#EC3F8C", k: "dots" },
  { n: "Ruana", c: "#8A5A32", k: "ruana" },
];

export const BOTTOMS: { n: string; c: string; k?: string }[] = [
  { n: "Jean bota campana", c: "#2F5DA8", k: "flare" },
  { n: "Falda negra", c: "#26262B", k: "skirt" },
  { n: "Pantalón blanco", c: "#FFFDF6" },
  { n: "Sudadera gris", c: "#9AA0A6", k: "jogger" },
  { n: "Falda de flores", c: "#FF7A1A", k: "midi" },
];

export const SHOES = [
  { n: "Tenis blancos", c: "#FFFFFF", k: "tenis" },
  { n: "Botas negras", c: "#26262B", k: "boot" },
  { n: "Tacones rojos", c: "#D81E27", k: "heel" },
  { n: "Chanclas con media", c: "#1747B5", k: "sock" },
  { n: "Suecos de caucho", c: "#C7F23A", k: "clog" },
];

export const DEFAULT_LOOK: AvatarLook = { top: 3, bottom: 0, shoes: 0, hood: 0, skin: 1 };
