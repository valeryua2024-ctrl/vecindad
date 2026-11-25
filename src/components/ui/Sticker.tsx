import type { CSSProperties } from "react";
import type { IconName } from "@/data/days";

/** Dibujito con borde blanco de sticker. Usa los símbolos de <IconSprite />. */
export default function Sticker({ name, a = "#FFC918", b = "#D81E27", className = "" }: { name: IconName; a?: string; b?: string; className?: string }) {
  return (
    <span className={"stk " + className}>
      <svg viewBox="0 0 48 48" aria-hidden="true" style={{ "--a": a, "--b": b } as CSSProperties}>
        <use href={"#i-" + name} />
      </svg>
    </span>
  );
}
