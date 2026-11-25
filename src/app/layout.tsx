import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: "Adviento entre amigas",
  description: "Calendario de adviento para una sala de amigas: una dinámica por día, el encuentro de fin de año y el videíto para compartir.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFC918",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
