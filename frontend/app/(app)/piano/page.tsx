import type { Metadata } from "next";
import { PianoPage } from "@/components/piano/PianoPage";

export const metadata: Metadata = { title: "Virtual Piano" };

export default function VirtualPianoPage() {
  return <PianoPage />;
}
