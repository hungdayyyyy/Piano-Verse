import type { Metadata } from "next";
import { AIStudioContent } from "@/components/ai/AIStudioContent";

export const metadata: Metadata = { title: "AI Studio" };

export default function AIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Studio</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">AI-powered music tools</p>
      </div>
      <AIStudioContent />
    </div>
  );
}
