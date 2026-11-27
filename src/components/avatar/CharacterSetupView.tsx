"use client";

import FaceSettings from "./FaceSettings";
import Image from "next/image";

/** Segundo paso del alta: poner la foto en el personaje asignado a la dueña. */
export default function CharacterSetupView() {
  return (
    <main className="setup-screen">
      <Image className="guide-lights setup-lights" src="/images/guide-lights.webp" alt="" aria-hidden="true" width={1080} height={180} priority />
      <header className="setup-heading">
        <p className="eyebrow">Adviento entre amigas · 2026</p>
        <h1>La Vecindad</h1>
        <p className="setup-title">Ahora muéstranos un poquito de ti</p>
      </header>
      <section className="setup-card">
        <p className="setup-assigned">Personaje asignado al azar</p>
        <p className="setup-instruction">Sube una foto de tu cara para ponerla en tu personaje.</p>
        <FaceSettings />
      </section>
      <Image className="landing-garden" src="/images/guide-garden.webp" alt="" aria-hidden="true" width={1080} height={185} />
    </main>
  );
}
