import type { Metadata } from "next";
import { StudioContent } from "@/components/studio/StudioContent";

export const metadata: Metadata = { title: "Composer Studio" };

export default function StudioPage() {
  return <StudioContent />;
}
