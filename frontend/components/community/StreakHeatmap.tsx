"use client";

import { useMemo } from "react";
import { useGetSessionsQuery } from "@/features/practice/practiceApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/auth/authSlice";

const WEEKS = 26; // 6 months
const DAYS = 7;

function getDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getLast26WeeksDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: Date[] = [];
  // Start from Sunday of 26 weeks ago
  const start = new Date(today);
  start.setDate(start.getDate() - WEEKS * 7 + 1);
  for (let i = 0; i < WEEKS * DAYS; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function StreakHeatmap() {
  const user = useAppSelector(selectCurrentUser);
  const { data } = useGetSessionsQuery({ limit: 500 });
  const sessions = data?.data ?? [];

  const activityMap = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s) => {
      const key = new Date(s.createdAt).toISOString().slice(0, 10);
      map[key] = (map[key] ?? 0) + 1;
    });
    return map;
  }, [sessions]);

  const allDays = useMemo(() => getLast26WeeksDates(), []);

  const maxCount = Math.max(...Object.values(activityMap), 1);

  function getColor(count: number) {
    if (!count) return "bg-[var(--background-muted)]";
    const intensity = count / maxCount;
    if (intensity < 0.25) return "bg-[var(--primary)]/20";
    if (intensity < 0.5) return "bg-[var(--primary)]/40";
    if (intensity < 0.75) return "bg-[var(--primary)]/70";
    return "bg-[var(--primary)]";
  }

  // Group into weeks
  const weeks: Date[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(allDays.slice(w * DAYS, w * DAYS + DAYS));
  }

  // Month labels: find first day of each month
  const monthLabels: { label: string; weekIdx: number }[] = [];
  weeks.forEach((week, wi) => {
    week.forEach((day) => {
      if (day.getDate() === 1 || (wi === 0 && day.getDay() === 0)) {
        if (!monthLabels.find((m) => m.weekIdx === wi)) {
          monthLabels.push({ label: MONTH_LABELS[day.getMonth()], weekIdx: wi });
        }
      }
    });
  });

  const totalSessions = sessions.length;
  const activeDays = Object.keys(activityMap).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-4 w-4 text-[var(--primary)]" />
          Practice Streak
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
          <span><strong className="text-[var(--foreground)]">{user?.currentStreak ?? 0}</strong> day streak</span>
          <span><strong className="text-[var(--foreground)]">{activeDays}</strong> active days</span>
          <span><strong className="text-[var(--foreground)]">{totalSessions}</strong> total sessions</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-flex flex-col gap-1">
            {/* Month labels */}
            <div className="flex ml-8">
              {weeks.map((_, wi) => {
                const ml = monthLabels.find((m) => m.weekIdx === wi);
                return (
                  <div key={wi} className="w-3.5 text-[10px] text-[var(--foreground-muted)] mr-0.5">
                    {ml ? ml.label : ""}
                  </div>
                );
              })}
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
              {/* Day labels */}
              <div className="flex flex-col gap-0.5 mr-1">
                {DAY_LABELS.map((d, i) => (
                  <div key={d} className="h-3.5 text-[10px] text-[var(--foreground-muted)] leading-3.5">
                    {i % 2 === 1 ? d.slice(0, 1) : ""}
                  </div>
                ))}
              </div>

              {/* Weeks */}
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day) => {
                    const key = getDayKey(day);
                    const count = activityMap[key] ?? 0;
                    const isToday = key === getDayKey(new Date());
                    return (
                      <div
                        key={key}
                        title={`${key}: ${count} session${count !== 1 ? "s" : ""}`}
                        className={`h-3.5 w-3.5 rounded-sm transition-colors cursor-default ${getColor(count)} ${isToday ? "ring-1 ring-[var(--primary)]" : ""}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1 justify-end mt-1">
              <span className="text-[10px] text-[var(--foreground-muted)]">Less</span>
              {["bg-[var(--background-muted)]","bg-[var(--primary)]/20","bg-[var(--primary)]/40","bg-[var(--primary)]/70","bg-[var(--primary)]"].map((c) => (
                <div key={c} className={`h-3 w-3 rounded-sm ${c}`} />
              ))}
              <span className="text-[10px] text-[var(--foreground-muted)]">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
