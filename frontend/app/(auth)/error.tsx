"use client";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
interface Props { error: Error; reset: () => void; }
export default function SegmentError({ error, reset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <AlertTriangle className="h-10 w-10 text-[var(--destructive)]" />
      <div>
        <h2 className="font-semibold">Something went wrong</h2>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">{error.message}</p>
      </div>
      <Button onClick={reset} variant="outline">Try again</Button>
    </div>
  );
}
