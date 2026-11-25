import type { Day } from "@/data/days";
import TextActivity from "./TextActivity";
import PhotoActivity from "./PhotoActivity";
import PollActivity from "./PollActivity";
import PriceActivity from "./PriceActivity";
import WhatsAppActivity from "./WhatsAppActivity";
import VideoActivity from "./VideoActivity";
import DrawActivity from "./DrawActivity";
import SecretActivity from "./SecretActivity";
import FinalActivity from "./FinalActivity";

/* Cada tipo de ventanita tiene su propio componente. Para una dinámica nueva:
   1) agregar el tipo en src/data/days.tsx, 2) crear su componente aquí, 3) sumarlo a este mapa. */
const BY_TYPE: Record<Day["type"], (p: { d: Day }) => React.ReactNode> = {
  text: TextActivity,
  photo: PhotoActivity,
  poll: PollActivity,
  price: PriceActivity,
  wa: WhatsAppActivity,
  video: VideoActivity,
  draw: DrawActivity,
  secret: SecretActivity,
  final: FinalActivity,
};

export default function Activity({ d }: { d: Day }) {
  const Comp = BY_TYPE[d.type];
  return <Comp d={d} />;
}
