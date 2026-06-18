import type { Metadata } from "next";
import { Suspense } from "react";
import { StreakHeatmap } from "@/components/community/StreakHeatmap";
import { XPProgressBar } from "@/components/community/XPProgressBar";
import { AchievementGrid } from "@/components/community/AchievementGrid";
import { Leaderboard } from "@/components/community/Leaderboard";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Community</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">
          Your progress, achievements, and rankings
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-40 rounded-xl" />}>
        <XPProgressBar />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-40 rounded-xl" />}>
        <StreakHeatmap />
      </Suspense>
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
          <Leaderboard />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
          <AchievementGrid />
        </Suspense>
      </div>
    </div>
  );
}
