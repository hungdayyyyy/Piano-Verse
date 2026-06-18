"use client";

import Link from "next/link";
import {
  Activity,
  Clock,
  Target,
  Zap,
  Music2,
  Piano,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetStatsQuery,
  useGetSessionsQuery,
  useGetTrendQuery,
} from "@/features/practice/practiceApi";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/auth/authSlice";
import {
  formatMinutes,
  formatPercentage,
  formatRelativeDate,
} from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color?: "primary" | "accent" | "success" | "muted";
}) {
  const colorMap = {
    primary: "text-[var(--primary)] bg-[var(--primary)]/10",
    accent: "text-[var(--accent)] bg-[var(--accent)]/10",
    success: "text-[var(--success)] bg-[var(--success)]/10",
    muted: "text-[var(--foreground-muted)] bg-[var(--background-muted)]",
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
              {label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
            {sub && (
              <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">
                {sub}
              </p>
            )}
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[color]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardContent() {
  const user = useAppSelector(selectCurrentUser);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { data: statsData, isLoading: statsLoading } = useGetStatsQuery();
  const { data: sessionsData, isLoading: sessionsLoading } =
    useGetSessionsQuery({ limit: 5 });
  const { data: trendData } = useGetTrendQuery({ days: 7 });

  const stats = statsData?.data;
  const sessions = sessionsData?.data ?? [];
  const trend = trendData?.data ?? [];

  const [greeting, setGreeting] = useState("Good morning");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(
      h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening",
    );
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {greeting}, {mounted ? (user?.firstName ?? "Musician") : "Musician"}{" "}
            👋
          </h2>
          <p className="text-sm text-[var(--foreground-muted)]">
            {mounted && user?.currentStreak
              ? `${user.currentStreak} day streak — keep it up!`
              : "Start practicing to build your streak"}
          </p>
        </div>
        <Link href="/practice/new">
          <Button>
            <Activity className="mr-2 h-4 w-4" />
            Start Practice
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              icon={Clock}
              label="Total Practice"
              value={formatMinutes(stats?.totalMinutes ?? 0)}
              sub={`${stats?.totalSessions ?? 0} sessions`}
              color="primary"
            />
            <StatCard
              icon={Target}
              label="Avg Accuracy"
              value={formatPercentage(stats?.avgAccuracy ?? 0)}
              sub="across all sessions"
              color="accent"
            />
            <StatCard
              icon={Zap}
              label="XP Earned"
              value={(user?.totalXP ?? 0).toLocaleString()}
              sub={`Level ${user?.skillLevel ?? "beginner"}`}
              color="success"
            />
            <StatCard
              icon={Activity}
              label="Current Streak"
              value={`${user?.currentStreak ?? 0} days`}
              sub={
                user?.lastPracticeDate
                  ? `Last: ${formatRelativeDate(user.lastPracticeDate)}`
                  : "No sessions yet"
              }
              color="muted"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Trend chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
              7-Day Practice Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trend.length === 0 ? (
              <div className="flex h-52 items-center justify-center text-sm text-[var(--foreground-muted)]">
                No data yet — start practicing!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--foreground-muted)" }}
                    tickFormatter={(v: string) =>
                      new Date(v).toLocaleDateString("en", { weekday: "short" })
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--foreground-muted)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--background-card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgAccuracy"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--primary)", r: 3 }}
                    name="Accuracy %"
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={{ fill: "var(--accent)", r: 3 }}
                    name="Sessions"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent sessions */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-[var(--accent)]" />
                Recent Sessions
              </CardTitle>
              <Link href="/practice">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {sessionsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-sm text-[var(--foreground-muted)]">
                  No sessions yet
                </p>
                <Link href="/practice/new">
                  <Button size="sm" variant="outline">
                    Record your first session
                  </Button>
                </Link>
              </div>
            ) : (
              sessions.map((session) => (
                <Link key={session._id} href={`/practice/${session._id}`}>
                  <div className="flex items-center justify-between rounded-lg p-2.5 hover:bg-[var(--background-muted)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                        <Music2 className="h-4 w-4 text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[140px]">
                          {session.songName}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          {formatRelativeDate(session.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          session.accuracyPercentage >= 80
                            ? "success"
                            : session.accuracyPercentage >= 60
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {formatPercentage(session.accuracyPercentage, 0)}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <QuickAction
          href="/piano"
          icon={Piano}
          title="Virtual Piano"
          description="Play and explore notes"
          color="primary"
        />
        <QuickAction
          href="/practice/new"
          icon={Activity}
          title="Start Practice"
          description="Record a session"
          color="accent"
        />
        <QuickAction
          href="/music"
          icon={Music2}
          title="Browse Music"
          description="Discover tracks"
          color="muted"
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: "primary" | "accent" | "muted";
}) {
  const colorMap = {
    primary:
      "group-hover:text-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]",
    accent:
      "group-hover:text-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]",
    muted:
      "group-hover:text-[var(--foreground)] bg-[var(--background-muted)] text-[var(--foreground-muted)]",
  };

  return (
    <Link href={href} className="group">
      <Card className="transition-all hover:border-[var(--border-muted)] hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-5">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${colorMap[color]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-[var(--foreground-muted)]">
              {description}
            </p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-[var(--foreground-subtle)] transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </Link>
  );
}
