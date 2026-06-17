import type { Metadata } from "next";
import { PianoPageFull } from "@/components/piano/PianoPageFull";

export const metadata: Metadata = { title: "Virtual Piano" };

export default function VirtualPianoPage() {
  return <PianoPageFull />;
}
