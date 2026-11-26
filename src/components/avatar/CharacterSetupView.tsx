"use client";

import FaceSettings from "./FaceSettings";

/** Segundo paso del alta: poner la foto en el personaje asignado a la dueña. */
export default function CharacterSetupView() {
  return (
    <main className="wrap">
      <section className="card">
        <div className="talk">
          <div className="say">
            <small>Su sala ya está creada</small>
            <h2>Ahora arme su personaje</h2>
            <p>Suba su foto y ajuste el encuadre. Cuando lo guarde, entrará al calendario de su vecindad.</p>
          </div>
        </div>
        <FaceSettings />
      </section>
    </main>
  );
}
