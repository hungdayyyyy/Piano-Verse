import type { Metadata } from "next";
import { PracticeSessionPage } from "@/components/practice/PracticeSessionPage";

export const metadata: Metadata = { title: "New Practice Session" };

export default function NewPracticePage() {
  return <PracticeSessionPage />;
}
