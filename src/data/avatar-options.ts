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
  { n: "Marfil", c: "#FBE9D5" },
  { n: "Durazno", c: "#F0C6A7" },
  { n: "Miel", c: "#DDA37F" },
  { n: "Canela", c: "#895B44" },
  { n: "Almendra", c: "#F4B99A" },
  { n: "Caramelo", c: "#CC9679" },
  { n: "Café", c: "#704B39" },
  { n: "Ébano", c: "#3A2A23" },
];

export const HOODS = [
  { n: "Arbolito", k: "arbol" },
  { n: "Papá Noel", k: "noel" },
  { n: "Reno", k: "reno" },
  { n: "Sin capucha", k: "none" },
];

export const TOPS: { n: string; c: string; k: string; long?: boolean }[] = [
  { n: "Blusa roja", c: "#D81E27", long: true, k: "btn" },
  { n: "Camiseta tricolor", c: "#FFC918", k: "tri" },
  { n: "Saco navideño", c: "#17A35A", long: true, k: "zig" },
  { n: "Blusa de flores", c: "#EC3F8C", k: "dots" },
  { n: "Ruana", c: "#8A5A32", k: "ruana" },
  { n: "Camiseta negra", c: "#111111", k: "plain" },
  { n: "Camiseta ¡Qué linda la fiesta!", c: "#FBF7E9", k: "printed" },
];

export const BOTTOMS: { n: string; c: string; k?: string }[] = [
  { n: "Jean bota campana", c: "#2F5DA8", k: "flare" },
  { n: "Falda negra", c: "#26262B", k: "skirt" },
  { n: "Pantalón blanco", c: "#FFFDF6" },
  { n: "Sudadera gris", c: "#9AA0A6", k: "jogger" },
  { n: "Falda de flores", c: "#FF7A1A", k: "midi" },
  { n: "Pijama a cuadros", c: "#D71920", k: "plaid" },
];

export const SHOES = [
  { n: "Tenis blancos", c: "#FFFFFF", k: "tenis" },
  { n: "Botas negras", c: "#26262B", k: "boot" },
  { n: "Tacones rojos", c: "#D81E27", k: "heel" },
  { n: "Chanclas con media", c: "#1747B5", k: "sock" },
  { n: "Suecos de caucho", c: "#C7F23A", k: "clog" },
  { n: "Descalza", c: "#FBE9D5", k: "bare" },
];

export const DEFAULT_LOOK: AvatarLook = { top: 5, bottom: 5, shoes: 5, hood: 3, skin: 1 };
