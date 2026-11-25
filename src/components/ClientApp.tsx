"use client";

import dynamic from "next/dynamic";

/* La app depende del navegador (guarda las respuestas ahí, dibuja en lienzos y usa audio),
   así que se carga solo en el cliente. Mientras carga se ve la pared amarilla. */
const AdventApp = dynamic(() => import("./AdventApp"), { ssr: false, loading: () => <div className="app-loading" /> });

export default function ClientApp() {
  return <AdventApp />;
}
