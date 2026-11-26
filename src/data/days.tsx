import type { ReactNode } from "react";
import type { AppState } from "@/lib/state";
import { NAMES } from "./vecinas";

/* Las 24 ventanitas. Para agregar o cambiar una dinámica, se edita solo este archivo:
   el tipo (type) decide qué actividad se muestra (ver src/components/day/activities). */

export type DayType = "text" | "photo" | "poll" | "price" | "wa" | "draw" | "secret" | "video" | "final";
export type IconName =
  | "star" | "cassette" | "calendar" | "dice" | "camera" | "heart" | "coin" | "pin" | "mug" | "gift"
  | "note" | "tree" | "lock" | "candle" | "lollipop" | "bus" | "bunuelo" | "tamal" | "bill";

/** Datos que las preguntas pueden usar para armarse (por ejemplo la fecha ganadora) */
export interface DayCtx { s: AppState; winner: number }
type Dyn<T> = T | ((ctx: DayCtx) => T);

export type TextSample = [string, string][];
export type PollSample = Record<string, string[]>;
export type PriceSample = Record<string, [number, number]>;

export interface Day {
  n: number;
  ic: IconName;
  type: DayType;
  cat: string;
  /** Fecha especial colombiana que cae ese día */
  real?: string;
  /** Frase chistosa que llena la pantalla al enviar */
  joke: string;
  title: string;
  prompt: Dyn<ReactNode>;
  options?: Dyn<string[]>;
  /** Respuestas de ejemplo de las demás vecinas */
  sample: TextSample | string[] | PollSample | PriceSample;
  multi?: boolean;
  anon?: boolean;
  /** Sirve para armar el encuentro */
  enc?: boolean;
  /** Permite proponer opciones nuevas (y dónde se guardan) */
  add?: { ph: string; key: "extra" | "ext12" };
  /** Mensaje para el grupo de WhatsApp */
  wa?: string;
}

export const Q17 = "Yo solo voy un ratico, y se quedó hasta las 4 de la mañana cantando";

export const DAYS: Day[] = [
  { n: 1, ic: "star", type: "text", cat: "Juego", real: "Arrancó diciembre", joke: "Se reciben emojis, no audios de 7 minutos", title: "Arrancó diciembre", prompt: "Ya huele a natilla. Resuma su 2026 en tres emojis.", sample: [["Caro", "✈️ 😴 🎓"], ["Vero", "🏡 🐶 💃"], ["Dani", "📚 🍷 🫠"]] },
  { n: 2, ic: "cassette", type: "photo", cat: "Nostalgia", joke: "Se reciben fotos con flash y ojos rojos", title: "Navidad de niña", prompt: "Suba una foto suya de una Navidad de la infancia. Bono si sale con el vestido que le hizo la tía.", sample: ["Caro", "Lore"] },
  {
    n: 3, ic: "calendar", type: "poll", multi: true, enc: true, cat: "Encuentro", joke: "El que no vota no se queja", title: "¿Cuándo puede?",
    prompt: () => <>Marque <mark>TODOS</mark> los días en que podría, entre el 24 y el 31 de diciembre. Gana el que reúna a más, y mañana la dueña del aviso anuncia la fecha en el grupo de WhatsApp.</>,
    options: ["24", "25", "26", "27", "28", "29", "30", "31"].map((d) => d + " de diciembre"),
    sample: { Caro: ["27 de diciembre", "28 de diciembre"], Pauli: ["28 de diciembre", "30 de diciembre"], Vero: ["27 de diciembre", "28 de diciembre", "29 de diciembre"], Dani: ["28 de diciembre", "29 de diciembre"], Lore: ["28 de diciembre", "30 de diciembre"] },
  },
  { n: 4, ic: "dice", type: "poll", cat: "Juego", joke: "Vote a conciencia, no como en las elecciones", title: "¿Quién es más probable que…?", prompt: "¿Quién llega tarde al encuentro diciendo \"ya voy llegando\" cuando apenas se está bañando?", options: [...NAMES, "Yo misma"], sample: { Caro: ["Dani"], Pauli: ["Dani"], Vero: ["Lore"], Dani: ["Lore"], Lore: ["Dani"] } },
  { n: 5, ic: "heart", type: "text", cat: "Conexión", joke: "Aquí sí se vale ponerse sentimental", title: "Lo mejor de su año", prompt: "Cuente en pocas líneas lo mejor que le pasó este año.", sample: [["Pauli", "Volver a bailar después de diez años sin hacerlo."], ["Lore", "Que mi mamá salió bien de la operación."], ["Caro", "Me animé a renunciar y no me arrepiento."]] },
  { n: 6, ic: "gift", type: "text", cat: "Juego", joke: "¡Qué original! Justo lo que necesitaba para acumular polvo.", title: "El peor regalo de amigo secreto", prompt: "Antes de sacar papelito, sea sincera: ¿cuál es el peor regalo que le pueden dar?", sample: [["Caro", "Medias"], ["Pauli", "Una crema que no huele a nada"], ["Vero", "Medias"], ["Dani", "Un portarretrato sin foto"], ["Lore", "Medias"]] },
  { n: 7, ic: "candle", type: "photo", cat: "Reto foto", real: "Noche de velitas", joke: "Cuidado se quema el andén", title: "Noche de velitas", prompt: "Hoy se prenden las velitas. Suba una foto de las suyas, de los faroles o del andén de la cuadra.", sample: ["Vero", "Pauli", "Caro", "Lore"] },
  { n: 8, ic: "tamal", type: "poll", cat: "Juego", real: "Festivo", joke: "Hoy no se trabaja, hoy se desayuna", title: "Desayuno de festivo", prompt: "Es festivo y nadie madrugó. ¿Cuál es el desayuno oficial de hoy?", options: ["Tamal con chocolate", "Calentao de anoche", "Arepa con todo lo que haya", "Yo sigo durmiendo, no molesten"], sample: { Caro: ["Tamal con chocolate"], Pauli: ["Calentao de anoche"], Vero: ["Tamal con chocolate"], Dani: ["Yo sigo durmiendo, no molesten"], Lore: ["Tamal con chocolate"] } },
  { n: 9, ic: "coin", type: "price", enc: true, cat: "Encuentro", joke: "Aquí no se fía, pero se cuadra", title: "¿Cuánto le queda cómodo?", prompt: "Marque cuánto se siente cómoda de gastar por persona, entre el encuentro y el regalo. Es anónimo: el plan se ajusta al máximo más bajo que alguien marque.", sample: { Caro: [15000, 40000], Pauli: [5000, 20000], Vero: [30000, 80000], Dani: [10000, 35000], Lore: [10000, 30000] } },
  { n: 10, ic: "gift", type: "draw", enc: true, cat: "Encuentro", joke: "No se aceptan cambios de papelito", title: "Amigo secreto", prompt: "Ya votamos el presupuesto, así que saque su papelito de una vez: le quedan más de dos semanas para conseguir o hacer el regalo.", sample: ["Caro", "Vero", "Dani"] },
  {
    n: 11, ic: "heart", type: "secret", cat: "Conexión", joke: "Escriba bonito, que eso no cuesta", title: "Palabras para su amiga secreta",
    prompt: ({ s }) => (s.draw ? `Escríbale a ${s.draw}, la que le salió en el papelito, algo que admira de ella. Le llega el 24 de diciembre, sin firma.` : "Escríbale a su amiga secreta algo que admira de ella. Le llega el 24 de diciembre, sin firma."),
    sample: [["Vero", "Admiro cómo haces sentir en casa a cualquiera."], ["Caro", "Tu forma de reírte de todo, incluso de ti."]],
  },
  {
    n: 12, ic: "bus", type: "poll", enc: true, add: { ph: "Proponer otro plan", key: "ext12" }, cat: "Encuentro", joke: "Súbase que sí cabe", title: "Ya hay fecha, ¿qué plan hacemos?",
    prompt: ({ winner }) => `La fecha con más votos es el ${winner} de diciembre. Vote el plan o proponga otro; el lugar se vota el 15.`,
    options: ({ s }) => ["Cena", "Chocolate con queso y pan", "Tarde de tinto y postres", "Asado", ...(s.ext12 || [])],
    sample: { Caro: ["Cena"], Pauli: ["Chocolate con queso y pan"], Vero: ["Cena"], Dani: ["Cena"], Lore: ["Chocolate con queso y pan"] },
  },
  { n: 13, ic: "note", type: "text", cat: "Juego", joke: "Volumen: el que aguante el vecino", title: "Su canción de diciembre", prompt: "¿Qué canción siente que representa diciembre? O su favorita de la temporada. Con las de todas armamos la playlist del encuentro.", sample: [["Dani", "La que ponía mi abuelo a todo volumen el 24"], ["Vero", "La que hace llorar a mi mamá cada 31"], ["Lore", "Cualquiera que sirva para bailar a las 12"]] },
  { n: 14, ic: "bunuelo", type: "text", cat: "Nostalgia", joke: "Sí hay buñuelos (si no explotan)", title: "Receta heredada", prompt: "Deje el secreto de la receta de su familia que no puede faltar en diciembre: buñuelos, natilla, hojuelas, lo que sea.", sample: [["Pauli", "Los buñuelos de mi abuela: el queso bien seco y freír a fuego bajo."]] },
  {
    n: 15, ic: "pin", type: "poll", add: { ph: "Proponer otro lugar", key: "extra" }, enc: true, cat: "Encuentro", joke: "Con parqueadero para la moto", title: "¿Dónde nos vemos?",
    prompt: "Vote el lugar. Si se le ocurre uno mejor, agréguelo: hoy se puede cambiar el voto hasta las 12 de la noche.",
    options: ({ s }) => ["Casa de Vero", "La cafetería del parque", "El mirador", "La finca de Caro", ...(s.extra || [])],
    sample: { Caro: ["Casa de Vero"], Pauli: ["La cafetería del parque"], Vero: ["Casa de Vero"], Dani: ["Casa de Vero"], Lore: ["El mirador"] },
  },
  { n: 16, ic: "note", type: "video", cat: "Reto video", joke: "Desafinada, pero con fe", title: "Cante un gozo", prompt: "Arrancó la novena. Grábese cantando un gozo, a todo pulmón y sin pena, y súbalo aquí. Sale en el videíto del encuentro.", sample: ["Pauli", "Vero"] },
  { n: 17, ic: "dice", type: "poll", cat: "Juego", joke: "Se guarda el secreto (mentira)", title: "¿Quién lo dijo?", prompt: ({ s }) => `"${s.q17 || Q17}"`, options: NAMES, sample: { Caro: ["Vero"], Pauli: ["Vero"], Vero: ["Caro"], Dani: ["Vero"], Lore: ["Vero"] } },
  { n: 18, ic: "mug", type: "wa", enc: true, cat: "Encuentro", joke: "No se vale llevar solo el hielo", title: "¿Qué lleva usted?", prompt: "Fecha y lugar confirmados. Vaya al grupo de WhatsApp y comente qué le gustaría llevar y qué no puede comer.", wa: "Vecinas, para el encuentro yo quisiera llevar... Y ojo, que yo no puedo comer...", sample: ["Caro", "Pauli", "Dani"] },
  { n: 19, ic: "camera", type: "photo", cat: "Nostalgia", joke: "No se aceptan fotos recortadas", title: "Su peor pinta", prompt: "Foto de su peor pinta de los 90 o los 2000. Cejas delgaditas, capul y descaderados incluidos.", sample: ["Dani", "Caro"] },
  { n: 20, ic: "bill", type: "poll", cat: "Juego", real: "Llegó la prima", joke: "La prima llegó y ya se fue", title: "¿En qué se le va la prima?", prompt: "Por estos días llega la prima. Sea honesta: ¿a dónde va a parar?", options: ["A pagar lo que debo", "Regalos pa' todo el mundo", "Ya me la gasté en noviembre", "¿Cuál prima? Yo soy independiente"], sample: { Caro: ["A pagar lo que debo"], Pauli: ["Regalos pa' todo el mundo"], Vero: ["Ya me la gasté en noviembre"], Dani: ["¿Cuál prima? Yo soy independiente"], Lore: ["Ya me la gasté en noviembre"] } },
  { n: 21, ic: "gift", type: "text", cat: "Nostalgia", joke: "El Niño Dios no hace devoluciones", title: "La carta al Niño Dios", prompt: "¿Qué fue lo que más recuerda haber pedido de niña? ¿Llegó o nunca llegó?", sample: [["Vero", "Los patines que pedí cuatro años seguidos. Llegaron cuando ya no me quedaban."]] },
  { n: 22, ic: "mug", type: "photo", cat: "Reto foto", joke: "¡Que no falte ni la salud ni la liga!", title: "Brindis a distancia", prompt: "Hoy a las 8 pm brindamos cada una desde su casa. Foto de su tinto, su chocolate o lo que tenga a la mano.", sample: ["Lore", "Vero", "Caro", "Pauli", "Dani"] },
  { n: 23, ic: "star", type: "poll", multi: true, cat: "Juego", joke: "Por si acaso, que nunca sobra", title: "Agüeros de fin de año", prompt: "¿Cuáles agüeros va a hacer este 31? Marque todos, sin pena.", options: ["Las 12 uvas", "Darle la vuelta a la manzana con la maleta", "Calzones amarillos", "Lentejas en los bolsillos", "Billete en el zapato", "Yo no creo en eso (pero por si acaso)"], sample: { Caro: ["Las 12 uvas", "Calzones amarillos"], Pauli: ["Las 12 uvas", "Lentejas en los bolsillos"], Vero: ["Darle la vuelta a la manzana con la maleta", "Las 12 uvas"], Dani: ["Yo no creo en eso (pero por si acaso)"], Lore: ["Darle la vuelta a la manzana con la maleta", "Calzones amarillos", "Las 12 uvas"] } },
  { n: 24, ic: "tree", type: "final", cat: "Cierre", real: "Nochebuena", joke: "Gracias por su visita, vuelva pronto", title: "Nochebuena y última ventanita", prompt: "Abra lo que le escribió su amiga secreta. Después, escriba qué quema con el año viejo y qué le pide al nuevo; se guarda para el otro diciembre.", sample: [["Dani", "Quemo el decir que sí a todo. Pido más domingos sin plan."]] },
];

export const dayOf = (n: number): Day => DAYS[n - 1];

/** Fecha especial del día, o el número de la novena entre el 16 y el 23 */
export const realOf = (d: Day): string => d.real || (d.n >= 16 && d.n <= 23 ? "Novena · día " + (d.n - 15) : "");

/** Palabra que resalta en amarillo en la frase chistosa de cada día */
export const HIGHLIGHT: Record<number, string[]> = {
  1: ["7", "minutos"], 2: ["ojos", "rojos"], 3: ["queja"], 4: ["elecciones"], 5: ["sentimental"], 6: ["que", "original"], 7: ["andén"], 8: ["desayuna"],
  9: ["cuadra"], 10: ["papelito"], 11: ["bonito"], 12: ["cabe"], 13: ["volumen"], 14: ["no"], 15: ["moto"], 16: ["fe"], 17: ["mentira"],
  18: ["hielo"], 19: ["recortadas"], 20: ["ya", "se", "fue"], 21: ["devoluciones"], 22: ["que", "no", "falte"], 23: ["acaso"], 24: ["última", "vez"],
};

/** Pista del reto de mañana, según la categoría */
export const HINTS: Record<string, string> = {
  Juego: "Es un juego", Nostalgia: "Trae nostalgia", Encuentro: "Sirve para cuadrar el encuentro", "Conexión": "Es para el corazón",
  "Reto foto": "Hay que sacar el celular", "Reto video": "Toca grabarse", Cierre: "Es la última de todas",
};

/** Días en los que la dueña elige qué sale en el videíto */
export const FEATURED: Record<number, string> = { 1: "el emoji", 2: "la foto", 5: "la respuesta", 16: "el video", 19: "la foto" };

/** Colores de los dibujitos y del fondo de la frase chistosa */
export const PAL = ["#FFC918", "#D81E27", "#1747B5", "#17A35A", "#FF7A1A", "#EC3F8C"];
export const colorOf = (d: Day) => PAL[d.n % 6];
export const color2 = (d: Day) => PAL[(d.n + 1) % 6];
export const JOKE_COLORS = ["#D8452F", "#1747B5", "#17A35A", "#EC3F8C", "#FF7A1A", "#7B4BB7"];

/** Las 24 cajitas de la caja: [día, columna, fila, ancho, alto] en una cuadrícula de 6×6 */
export const LAYOUT: [number, number, number, number, number][] = [
  [1, 1, 1, 1, 1], [14, 2, 1, 2, 1], [3, 4, 1, 1, 1], [21, 5, 1, 2, 1], [10, 1, 2, 2, 1], [18, 3, 2, 1, 2], [20, 4, 2, 2, 1], [8, 6, 2, 1, 2],
  [23, 1, 3, 1, 1], [4, 2, 3, 1, 1], [15, 4, 3, 1, 1], [22, 5, 3, 1, 1], [17, 1, 4, 1, 2], [9, 2, 4, 2, 1], [13, 4, 4, 1, 1], [7, 5, 4, 2, 1],
  [16, 2, 5, 1, 1], [11, 3, 5, 2, 1], [24, 5, 5, 1, 2], [2, 6, 5, 1, 1], [5, 1, 6, 2, 1], [19, 3, 6, 1, 1], [12, 4, 6, 1, 1], [6, 6, 6, 1, 1],
];
export const BOX_COLORS = ["#BFDDF0", "#F7E6B5", "#D8452F", "#FFFDF6", "#F6C94C", "#F4B6C2"];
export const BOX_SEQ = [0, 2, 4, 1, 3, 5, 2, 1, 4, 0, 3, 2, 5, 0, 2, 4, 1, 3, 2, 4, 0, 5, 1, 2];
