"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/auth/authSlice";
import {
  useGetTopPerformancesQuery,
  useGetStatsQuery,
} from "@/features/practice/practiceApi";
import { formatPercentage } from "@/lib/utils";

// Placeholder entries to show UI shape while backend is stub
const PLACEHOLDER_LEADERBOARD = [
  {
    rank: 1,
    name: "Minh Anh",
    xp: 12500,
    streak: 45,
    accuracy: 94.2,
    avatar: null,
  },
  {
    rank: 2,
    name: "Thanh Hà",
    xp: 11200,
    streak: 38,
    accuracy: 91.8,
    avatar: null,
  },
  {
    rank: 3,
    name: "Quốc Bảo",
    xp: 9800,
    streak: 29,
    accuracy: 89.5,
    avatar: null,
  },
  {
    rank: 4,
    name: "Lan Phương",
    xp: 8600,
    streak: 22,
    accuracy: 87.3,
    avatar: null,
  },
  {
    rank: 5,
    name: "Đức Anh",
    xp: 7400,
    streak: 18,
    accuracy: 85.1,
    avatar: null,
  },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return (
    <span className="w-5 text-center text-sm font-bold text-[var(--foreground-muted)]">
      {rank}
    </span>
  );
}

function LeaderboardRow({
  rank,
  name,
  value,
  subValue,
  isCurrentUser,
  avatar,
}: {
  rank: number;
  name: string;
  value: string;
  subValue?: string;
  isCurrentUser?: boolean;
  avatar?: string | null;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-lg px-3 py-2.5 transition-colors ${
        isCurrentUser
          ? "bg-[var(--primary)]/10 border border-[var(--primary)]/20"
          : "hover:bg-[var(--background-muted)]"
      }`}
    >
      <div className="flex w-6 items-center justify-center flex-shrink-0">
        <RankBadge rank={rank} />
      </div>
      <Avatar
        firstName={name.split(" ")[0]}
        lastName={name.split(" ")[1]}
        src={avatar ?? undefined}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {name}
          {isCurrentUser && (
            <span className="ml-1.5 text-xs text-[var(--primary)]">(you)</span>
          )}
        </p>
        {subValue && (
          <p className="text-xs text-[var(--foreground-muted)]">{subValue}</p>
        )}
      </div>
      <p className="text-sm font-bold tabular-nums text-[var(--primary)]">
        {value}
      </p>
    </div>
  );
}

export function Leaderboard() {
  const user = useAppSelector(selectCurrentUser);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { data: statsData } = useGetStatsQuery();
  const { data: topData } = useGetTopPerformancesQuery({ limit: 5 });

  const stats = statsData?.data;
  const userXP = mounted ? (user?.totalXP ?? 0) : 0;
  const userName =
    mounted && user ? `${user.firstName} ${user.lastName}` : "You";

  // Merge user into placeholder to show their position
  const xpBoard = [...PLACEHOLDER_LEADERBOARD];
  const userRank = xpBoard.findIndex((e) => e.xp < userXP);
  const insertAt = userRank === -1 ? xpBoard.length : userRank;

  const fullBoard = [
    ...xpBoard.slice(0, insertAt),
    {
      rank: insertAt + 1,
      name: userName,
      xp: userXP,
      streak: user?.currentStreak ?? 0,
      accuracy: stats?.avgAccuracy ?? 0,
      avatar: user?.avatar ?? null,
      isMe: true,
    },
    ...xpBoard
      .slice(insertAt)
      .map((e, i) => ({ ...e, rank: insertAt + 2 + i })),
  ].slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-[var(--primary)]" />
            Leaderboard
          </CardTitle>
          <Badge variant="mocked">Preview</Badge>
        </div>
        <p className="text-xs text-[var(--foreground-muted)]">
          Live rankings connect to /api/gamification/leaderboard when backend is
          ready. Your real stats are shown.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="xp">
          <TabsList className="mb-4">
            <TabsTrigger value="xp">
              <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
              XP
            </TabsTrigger>
            <TabsTrigger value="streak">
              <span className="mr-1">🔥</span>Streak
            </TabsTrigger>
            <TabsTrigger value="accuracy">
              <span className="mr-1">🎯</span>Accuracy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="xp" className="space-y-1.5">
            {fullBoard.map((entry, i) => (
              <LeaderboardRow
                key={i}
                rank={entry.rank}
                name={entry.name}
                value={`${entry.xp.toLocaleString()} XP`}
                subValue={`${entry.streak}d streak`}
                isCurrentUser={"isMe" in entry}
                avatar={entry.avatar}
              />
            ))}
          </TabsContent>

          <TabsContent value="streak" className="space-y-1.5">
            {[...fullBoard]
              .sort((a, b) => b.streak - a.streak)
              .map((entry, i) => (
                <LeaderboardRow
                  key={i}
                  rank={i + 1}
                  name={entry.name}
                  value={`${entry.streak} days`}
                  isCurrentUser={"isMe" in entry}
                  avatar={entry.avatar}
                />
              ))}
          </TabsContent>

          <TabsContent value="accuracy" className="space-y-1.5">
            {[...fullBoard]
              .sort((a, b) => b.accuracy - a.accuracy)
              .map((entry, i) => (
                <LeaderboardRow
                  key={i}
                  rank={i + 1}
                  name={entry.name}
                  value={formatPercentage(entry.accuracy)}
                  isCurrentUser={"isMe" in entry}
                  avatar={entry.avatar}
                />
              ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
