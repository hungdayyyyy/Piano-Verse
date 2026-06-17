import type { Metadata } from "next";
import { ComingSoonCard } from "@/components/shared/coming-soon-card";

export const metadata: Metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Community</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">Leaderboards and achievements</p>
      </div>
      <ComingSoonCard
        title="Community & Gamification Coming Soon"
        description="XP leaderboards, achievements, and streak challenges are in development."
        reason="gamification.routes.js: GET /achievements and GET /leaderboard return plain TODO messages. GamificationService and Achievement/UserAchievement models exist but are disconnected. AchievementRepository uses CommonJS require() in ESM — would throw at runtime."
      />
    </div>
  );
}
