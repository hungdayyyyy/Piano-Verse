import type { Metadata } from "next";
import { Suspense } from "react";
import { MusicBrowser } from "@/components/streaming/MusicBrowser";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Music" };

export default function MusicPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Music</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">
          Browse and stream piano tracks
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
        <MusicBrowser />
      </Suspense>
    </div>
  );
}
