"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star } from "lucide-react";

const LEVELS = [
  { level: 1, label: "Beginner", xpRequired: 0, color: "text-slate-400" },
  { level: 2, label: "Novice", xpRequired: 500, color: "text-green-400" },
  { level: 3, label: "Apprentice", xpRequired: 1500, color: "text-blue-400" },
  {
    level: 4,
    label: "Intermediate",
    xpRequired: 3500,
    color: "text-purple-400",
  },
  { level: 5, label: "Advanced", xpRequired: 7500, color: "text-amber-400" },
  { level: 6, label: "Expert", xpRequired: 15000, color: "text-orange-400" },
  { level: 7, label: "Master", xpRequired: 30000, color: "text-red-400" },
  { level: 8, label: "Grandmaster", xpRequired: 60000, color: "text-pink-400" },
];

function getCurrentLevel(xp: number) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
    else break;
  }
  return current;
}

function getNextLevel(xp: number) {
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp < LEVELS[i].xpRequired) return LEVELS[i];
  }
  return null;
}

export function XPProgressBar() {
  const user = useAppSelector(selectCurrentUser);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const xp = mounted ? (user?.totalXP ?? 0) : 0;

  const current = getCurrentLevel(xp);
  const next = getNextLevel(xp);

  const progressPct = next
    ? Math.min(
        100,
        ((xp - current.xpRequired) / (next.xpRequired - current.xpRequired)) *
          100,
      )
    : 100;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10">
              <Trophy className={`h-6 w-6 ${current.color}`} />
            </div>
            <div>
              <p className="font-semibold text-lg">{current.label}</p>
              <p className="text-xs text-[var(--foreground-muted)]">
                Level {current.level}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums text-[var(--primary)]">
              {xp.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--foreground-muted)]">Total XP</p>
          </div>
        </div>

        {next ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--foreground-muted)]">
              <span>
                Progress to {next.label} (Lv.{next.level})
              </span>
              <span className="tabular-nums">
                {(xp - current.xpRequired).toLocaleString()} /{" "}
                {(next.xpRequired - current.xpRequired).toLocaleString()} XP
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-[var(--background-muted)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-[var(--foreground-muted)]">
              {Math.round(next.xpRequired - xp).toLocaleString()} XP needed to
              reach {next.label}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-[var(--primary)] font-medium">
            <Star className="h-4 w-4 fill-current" />
            Maximum level reached! You are a Grandmaster.
          </div>
        )}

        {/* Level milestones */}
        <div className="mt-4 flex items-center gap-1">
          {LEVELS.map((lvl) => (
            <div
              key={lvl.level}
              title={`${lvl.label} — ${lvl.xpRequired.toLocaleString()} XP`}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                xp >= lvl.xpRequired
                  ? "bg-[var(--primary)]"
                  : "bg-[var(--background-muted)]"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[var(--foreground-subtle)]">
            Lv.1
          </span>
          <span className="text-[10px] text-[var(--foreground-subtle)]">
            Lv.8
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
