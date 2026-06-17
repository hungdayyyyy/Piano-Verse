"use client";

import { Music2, Dumbbell, Sparkles, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetRecommendationsQuery } from "@/features/ai/aiApi";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { useState } from "react";
import Link from "next/link";

export function RecommendationPanel() {
  const user = useAppSelector(selectCurrentUser);
  const [expanded, setExpanded] = useState(true);

  const { data, isLoading } = useGetRecommendationsQuery(
    { skillLevel: user?.skillLevel },
    { skip: !user }
  );

  const recs = data?.data;

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--primary)]" />
            <CardTitle className="text-base">AI Recommendations</CardTitle>
            <Badge variant="mocked">Mocked AI</Badge>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-[var(--foreground-muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--foreground-muted)]" />}
        </div>
        <CardDescription>
          Personalized suggestions for{" "}
          <span className="font-medium capitalize">{user?.skillLevel ?? "your"}</span> level
        </CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-5">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : !recs ? (
            <p className="text-sm text-[var(--foreground-muted)]">No recommendations available.</p>
          ) : (
            <>
              {/* Song recommendations */}
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  <Music2 className="h-3.5 w-3.5" />
                  Recommended Songs
                </p>
                <div className="space-y-2">
                  {recs.songs.map((song, i) => (
                    <div key={i} className="group flex items-start justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--background-card)] p-3 hover:border-[var(--primary)]/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[var(--primary)]/10 text-sm font-bold text-[var(--primary)]">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{song.title}</p>
                          <p className="text-xs text-[var(--foreground-muted)] mt-0.5">{song.reason}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0 text-[10px]">
                        {song.difficulty}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exercise recommendations */}
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  <Dumbbell className="h-3.5 w-3.5" />
                  Practice Exercises
                </p>
                <div className="space-y-2">
                  {recs.exercises.map((ex, i) => (
                    <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--background-card)] p-3">
                      <p className="text-sm font-medium">{ex.name}</p>
                      <p className="text-xs text-[var(--foreground-muted)] mt-0.5">{ex.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/practice/new" className="block">
                <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--primary)]/40 p-3 text-sm text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-colors">
                  Start a practice session
                  <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </Link>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
