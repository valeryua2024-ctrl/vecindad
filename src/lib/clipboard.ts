/** Copia un texto y avisa; si el navegador no deja, pide copiarlo a mano */
export function copyText(text: string, toast: (m: string) => void) {
  try {
    navigator.clipboard.writeText(text).then(() => toast("Copiado"), () => toast("Seleccione el texto y cópielo"));
  } catch {
    toast("Seleccione el texto y cópielo");
  }
}
