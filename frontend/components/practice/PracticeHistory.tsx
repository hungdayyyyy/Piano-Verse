"use client";

import { useState } from "react";
import Link from "next/link";
import { Music2, Clock, Target, Trophy, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  useGetSessionsQuery,
  useGetStatsQuery,
  useGetTopPerformancesQuery,
} from "@/features/practice/practiceApi";
import {
  formatDuration,
  formatPercentage,
  formatRelativeDate,
  capitalize,
} from "@/lib/utils";
import type { PracticeSession } from "@/lib/api/types";

const difficultyColors: Record<string, "default" | "warning" | "destructive" | "accent"> = {
  beginner: "default",
  intermediate: "warning",
  advanced: "destructive",
  expert: "accent",
};

function SessionCard({ session }: { session: PracticeSession }) {
  return (
    <Link href={`/practice/${session._id}`}>
      <Card className="group transition-all hover:border-[var(--border-muted)] hover:shadow-md cursor-pointer">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
            <Music2 className="h-5 w-5 text-[var(--primary)]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{session.songName}</p>
              <Badge variant={difficultyColors[session.difficulty] ?? "secondary"} className="flex-shrink-0">
                {capitalize(session.difficulty)}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-[var(--foreground-muted)]">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(session.durationSeconds)}
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {session.notesHit}✓ {session.notesMissed}✗
              </span>
              <span>{formatRelativeDate(session.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p
                className={`text-lg font-bold tabular-nums ${
                  session.accuracyPercentage >= 80
                    ? "text-[var(--success)]"
                    : session.accuracyPercentage >= 60
                    ? "text-[var(--warning)]"
                    : "text-[var(--destructive)]"
                }`}
              >
                {formatPercentage(session.accuracyPercentage, 0)}
              </p>
              <p className="text-xs text-[var(--foreground-muted)]">accuracy</p>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--foreground-subtle)] transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function PracticeHistory() {
  const [limit] = useState(20);
  const { data: sessionsData, isLoading } = useGetSessionsQuery({ limit });
  const { data: statsData } = useGetStatsQuery();
  const { data: topData } = useGetTopPerformancesQuery({ limit: 5 });

  const sessions = sessionsData?.data ?? [];
  const stats = statsData?.data;
  const top = topData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats?.totalSessions ?? 0}</p>
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">Total Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{Math.round(stats?.totalMinutes ?? 0)}m</p>
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">Total Practice</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {formatPercentage(stats?.avgAccuracy ?? 0, 0)}
            </p>
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">Avg Accuracy</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Session History</TabsTrigger>
          <TabsTrigger value="top">Top Performances</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              icon={Music2}
              title="No sessions yet"
              description="Record your first practice session to start tracking your progress."
              action={
                <Link href="/practice/new">
                  <button className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
                    Start a session
                  </button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <SessionCard key={session._id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="top">
          {top.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No top performances yet"
              description="Complete more practice sessions to see your best results."
            />
          ) : (
            <div className="space-y-3">
              {top.map((session, i) => (
                <Link key={session._id} href={`/practice/${session._id}`}>
                  <Card className="hover:border-[var(--border-muted)] transition-all cursor-pointer">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                          i === 1 ? "bg-slate-400/20 text-slate-400" :
                          i === 2 ? "bg-amber-600/20 text-amber-600" :
                          "bg-[var(--background-muted)] text-[var(--foreground-muted)]"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{session.songName}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          Score: {session.score} · {formatDuration(session.durationSeconds)}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-[var(--success)]">
                        {formatPercentage(session.accuracyPercentage, 0)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
