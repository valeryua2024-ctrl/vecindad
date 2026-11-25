import { Caveat, Lobster, Luckiest_Guy, Rubik } from "next/font/google";

/* Las cuatro letras del proyecto. Next.js las descarga y las sirve desde el mismo sitio.
   - Luckiest Guy: aviso pintado (títulos, números de las cajitas, frase chistosa)
   - Rubik: todo el texto de la interfaz
   - Lobster: letra de letrero cursiva (videíto, cartel, caja)
   - Caveat: letra a mano (papelito, polaroids) */
export const luckiest = Luckiest_Guy({ weight: "400", subsets: ["latin"], variable: "--font-luckiest", display: "swap" });
export const rubik = Rubik({ subsets: ["latin"], variable: "--font-rubik", display: "swap" });
export const lobster = Lobster({ weight: "400", subsets: ["latin"], variable: "--font-lobster", display: "swap" });
export const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-caveat", display: "swap" });

export const fontVariables = [luckiest.variable, rubik.variable, lobster.variable, caveat.variable].join(" ");

/* Para el lienzo del videíto y los SVG: el nombre real de cada familia más su respaldo. */
export const FONT = {
  display: `${luckiest.style.fontFamily},"Arial Black",sans-serif`,
  body: `${rubik.style.fontFamily},system-ui,sans-serif`,
  script: `${lobster.style.fontFamily},"Brush Script MT",cursive`,
  hand: `${caveat.style.fontFamily},"Segoe Print",cursive`,
};
