"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--destructive)]/10">
        <AlertTriangle className="h-8 w-8 text-[var(--destructive)]" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          {error.message || "An unexpected error occurred"}
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-[var(--foreground-subtle)] font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
