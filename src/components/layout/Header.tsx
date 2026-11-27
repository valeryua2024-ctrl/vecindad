"use client";

import { useApp } from "../AppContext";
import { SFX, stopMusic } from "@/lib/sound";
import Image from "next/image";

/* Marca principal inspirada en la guía visual de La Vecindad. */
export default function Header() {
  const { s, update } = useApp();
  const soundOn = s.sound !== false;
  return (
    <header className="top">
      <Image className="guide-lights" src="/images/guide-lights.webp" alt="" aria-hidden="true" width={1080} height={180} priority />
      <button
        type="button"
        className="sound-toggle"
        aria-label={soundOn ? "Silenciar sonido" : "Activar sonido"}
        aria-pressed={soundOn}
        title={soundOn ? "Silenciar sonido" : "Activar sonido"}
        onClick={() => {
          update((x) => { x.sound = !soundOn; });
          if (soundOn) stopMusic(); else setTimeout(() => SFX.pop(), 0);
        }}
      >
        <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path d="M4 12v8h6l8 6V6l-8 6H4Z" />
          {soundOn ? <><path d="M22 11a7 7 0 0 1 0 10" /><path d="M25 7a13 13 0 0 1 0 18" /></> : <><path d="m22 12 7 8" /><path d="m29 12-7 8" /></>}
        </svg>
      </button>
      <div className="brand-copy">
        <p className="eyebrow">Adviento entre amigas · 2026</p>
        <h1>La Vecindad</h1>
      </div>
    </header>
  );
}

