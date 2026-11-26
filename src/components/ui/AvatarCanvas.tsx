"use client";

import { useEffect, useRef, useState } from "react";
import type { AvatarLook } from "@/data/avatar-options";
import { drawAvatar } from "@/canvas/avatar";

/** El personaje de la plantilla dibujado en un lienzo. */
export default function AvatarCanvas({ look, px, up = false }: { look: AvatarLook; px: number; up?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [imgTick, setImgTick] = useState(0);
  const key = JSON.stringify(look);
  useEffect(() => {
    const c = ref.current;
    const x = c?.getContext("2d");
    if (!c || !x) return;
    x.clearRect(0, 0, c.width, c.height);
    drawAvatar(x, JSON.parse(key) as AvatarLook, c.width / 2, c.height - 3, px, up, 1, () => setImgTick((t) => t + 1));
  }, [key, px, up, imgTick]);
  return <canvas ref={ref} width={Math.round(px * 0.76)} height={Math.round(px * 1.14)} aria-hidden="true" />;
}

