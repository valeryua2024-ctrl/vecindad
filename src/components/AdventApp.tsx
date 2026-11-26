"use client";

import Script from "next/script";
import { AppProvider, useApp } from "./AppContext";
import IconSprite from "./ui/IconSprite";
import PrototypeBar from "./layout/PrototypeBar";
import Header from "./layout/Header";
import Nav from "./layout/Nav";
import JoinView from "./join/JoinView";
import CalendarView from "./calendar/CalendarView";
import EncounterView from "./encounter/EncounterView";
import VideoView from "./video/VideoView";
import JokeScreen from "./joke/JokeScreen";

/* La app completa del calendario de adviento.
   Estructura: barra de prototipo, encabezado, pestañas y la sección activa
   (calendario, encuentro o videíto). Encima van la frase chistosa, el confeti y el destello. */
function Screens() {
  const { s, view, fxRef } = useApp();
  const guest = s.role === "invitada";
  return (
    <>
      <PrototypeBar />
      <div className="wrap">
        <Header />
        {!guest && <Nav />}
        {guest ? <JoinView /> : view === "encuentro" ? <EncounterView /> : view === "recuerdo" ? <VideoView /> : <CalendarView />}
      </div>
      <JokeScreen />
      <canvas id="fx" ref={fxRef} />
      <div className="flash" id="flash" aria-hidden="true" />
      <div className="zoom-bg" id="zoom-bg" aria-hidden="true" />
    </>
  );
}

export default function AdventApp() {
  return (
    <AppProvider>
      <IconSprite />
      <Screens />
      {/* Detector de caras de respaldo, para navegadores sin FaceDetector */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/tracking.js/1.1.3/tracking-min.js" strategy="lazyOnload" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/tracking.js/1.1.3/data/face-min.js" strategy="lazyOnload" />
    </AppProvider>
  );
}
