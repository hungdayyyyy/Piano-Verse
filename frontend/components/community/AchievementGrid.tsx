"use client";

import { Lock, Star, Zap, Music2, Target, Flame, Trophy, Clock, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { useGetStatsQuery, useGetSessionsQuery } from "@/features/practice/practiceApi";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  rarity: "common" | "rare" | "epic" | "legendary";
  check: (data: AchievementData) => boolean;
}

interface AchievementData {
  totalSessions: number;
  totalMinutes: number;
  avgAccuracy: number;
  currentStreak: number;
  totalXP: number;
  perfectSessions: number;
}

const RARITY_STYLES = {
  common: "border-slate-600/40 bg-slate-600/5 text-slate-400",
  rare: "border-blue-500/40 bg-blue-500/5 text-blue-400",
  epic: "border-purple-500/40 bg-purple-500/5 text-purple-400",
  legendary: "border-amber-500/40 bg-amber-500/5 text-amber-400",
};

const RARITY_BADGE = {
  common: "secondary",
  rare: "accent",
  epic: "default",
  legendary: "warning",
} as const;

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_session",
    title: "First Step",
    description: "Complete your first practice session",
    icon: Music2,
    rarity: "common",
    check: (d) => d.totalSessions >= 1,
  },
  {
    id: "sessions_10",
    title: "Dedicated",
    description: "Complete 10 practice sessions",
    icon: Star,
    rarity: "common",
    check: (d) => d.totalSessions >= 10,
  },
  {
    id: "sessions_50",
    title: "Consistent",
    description: "Complete 50 practice sessions",
    icon: Award,
    rarity: "rare",
    check: (d) => d.totalSessions >= 50,
  },
  {
    id: "sessions_100",
    title: "Century",
    description: "Complete 100 practice sessions",
    icon: Trophy,
    rarity: "epic",
    check: (d) => d.totalSessions >= 100,
  },
  {
    id: "accuracy_80",
    title: "Sharp Ear",
    description: "Achieve 80%+ average accuracy",
    icon: Target,
    rarity: "common",
    check: (d) => d.avgAccuracy >= 80,
  },
  {
    id: "accuracy_95",
    title: "Perfectionist",
    description: "Achieve 95%+ average accuracy",
    icon: Target,
    rarity: "epic",
    check: (d) => d.avgAccuracy >= 95,
  },
  {
    id: "perfect_session",
    title: "Flawless",
    description: "Complete a session with 100% accuracy",
    icon: Zap,
    rarity: "rare",
    check: (d) => d.perfectSessions >= 1,
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Maintain a 7-day practice streak",
    icon: Flame,
    rarity: "common",
    check: (d) => d.currentStreak >= 7,
  },
  {
    id: "streak_30",
    title: "Monthly Master",
    description: "Maintain a 30-day practice streak",
    icon: Flame,
    rarity: "epic",
    check: (d) => d.currentStreak >= 30,
  },
  {
    id: "minutes_60",
    title: "Hour Player",
    description: "Accumulate 60 minutes of practice",
    icon: Clock,
    rarity: "common",
    check: (d) => d.totalMinutes >= 60,
  },
  {
    id: "minutes_600",
    title: "Dedicated Musician",
    description: "Accumulate 10 hours of practice",
    icon: Clock,
    rarity: "rare",
    check: (d) => d.totalMinutes >= 600,
  },
  {
    id: "xp_1000",
    title: "XP Hunter",
    description: "Earn 1,000 XP",
    icon: Star,
    rarity: "common",
    check: (d) => d.totalXP >= 1000,
  },
  {
    id: "xp_10000",
    title: "XP Master",
    description: "Earn 10,000 XP",
    icon: Star,
    rarity: "legendary",
    check: (d) => d.totalXP >= 10000,
  },
];

function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  const Icon = achievement.icon;
  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 transition-all",
        unlocked
          ? RARITY_STYLES[achievement.rarity]
          : "border-[var(--border)] bg-[var(--background-muted)]/30 opacity-50 grayscale"
      )}
    >
      {/* Unlock glow for legendary */}
      {unlocked && achievement.rarity === "legendary" && (
        <div className="absolute inset-0 rounded-xl animate-pulse-glow pointer-events-none" />
      )}

      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
          unlocked ? "bg-current/10" : "bg-[var(--background-muted)]"
        )}>
          {unlocked
            ? <Icon className="h-5 w-5" />
            : <Lock className="h-4 w-4 text-[var(--foreground-subtle)]" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold truncate">{achievement.title}</p>
            <Badge variant={unlocked ? RARITY_BADGE[achievement.rarity] : "secondary"} className="text-[10px] px-1.5 py-0 capitalize">
              {achievement.rarity}
            </Badge>
          </div>
          <p className="text-xs text-[var(--foreground-muted)] mt-0.5">{achievement.description}</p>
        </div>
        {unlocked && (
          <div className="flex-shrink-0">
            <Star className="h-4 w-4 fill-current text-[var(--primary)]" />
          </div>
        )}
      </div>
    </div>
  );
}

export function AchievementGrid() {
  const user = useAppSelector(selectCurrentUser);
  const { data: statsData } = useGetStatsQuery();
  const { data: sessionsData } = useGetSessionsQuery({ limit: 500 });

  const stats = statsData?.data;
  const sessions = sessionsData?.data ?? [];

  const achievementData: AchievementData = {
    totalSessions: stats?.totalSessions ?? 0,
    totalMinutes: stats?.totalMinutes ?? 0,
    avgAccuracy: stats?.avgAccuracy ?? 0,
    currentStreak: user?.currentStreak ?? 0,
    totalXP: user?.totalXP ?? 0,
    perfectSessions: sessions.filter((s) => s.accuracyPercentage === 100).length,
  };

  const unlocked = ACHIEVEMENTS.filter((a) => a.check(achievementData));
  const locked = ACHIEVEMENTS.filter((a) => !a.check(achievementData));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[var(--primary)]" />
            Achievements
          </span>
          <Badge variant="secondary">
            {unlocked.length} / {ACHIEVEMENTS.length}
          </Badge>
        </CardTitle>
        <Badge variant="mocked" className="w-fit">
          Client-side — connects to /api/gamification/achievements when backend is ready
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {unlocked.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-3">
              ✅ Unlocked ({unlocked.length})
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {unlocked.map((a) => (
                <AchievementCard key={a.id} achievement={a} unlocked />
              ))}
            </div>
          </div>
        )}

        {locked.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-3">
              🔒 Locked ({locked.length})
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {locked.map((a) => (
                <AchievementCard key={a.id} achievement={a} unlocked={false} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
