"use client";

import Link from "next/link";
import { ArrowLeft, Music2, Clock, Target, Award, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSessionQuery } from "@/features/practice/practiceApi";
import { formatDuration, formatPercentage, formatDate, capitalize, computeScore } from "@/lib/utils";

export function SessionDetail({ sessionId }: { sessionId: string }) {
  const { data, isLoading, isError } = useGetSessionQuery(sessionId);
  const session = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-[var(--foreground-muted)]">Session not found.</p>
        <Link href="/practice">
          <Button variant="outline">Back to Practice</Button>
        </Link>
      </div>
    );
  }

  const score = computeScore(session.notesHit, session.notesMissed, session.accuracyPercentage);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/practice">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{session.songName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{capitalize(session.difficulty)}</Badge>
            <span className="text-xs text-[var(--foreground-muted)]">{formatDate(session.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Score overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Target, label: "Accuracy", value: formatPercentage(session.accuracyPercentage, 1), color: "text-[var(--success)]" },
          { icon: Clock, label: "Duration", value: formatDuration(session.durationSeconds), color: "" },
          { icon: Music2, label: "Notes Hit", value: String(session.notesHit), color: "text-[var(--success)]" },
          { icon: Award, label: "Score", value: String(score), color: "text-[var(--primary)]" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <Icon className={`h-5 w-5 mx-auto mb-2 ${color || "text-[var(--foreground-muted)]"}`} />
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-[var(--foreground-muted)]">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notes breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--foreground-muted)]">Notes hit</span>
            <span className="font-medium text-[var(--success)]">{session.notesHit}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--foreground-muted)]">Notes missed</span>
            <span className="font-medium text-[var(--destructive)]">{session.notesMissed}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--foreground-muted)]">Total notes</span>
            <span className="font-medium">{session.notesHit + session.notesMissed}</span>
          </div>

          {/* Accuracy bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[var(--foreground-muted)]">Accuracy</span>
              <span className="font-medium">{formatPercentage(session.accuracyPercentage)}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--background-muted)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--success)] transition-all"
                style={{ width: `${session.accuracyPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recorded notes */}
      {session.recordedNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <List className="h-4 w-4" />
              Recorded Notes ({session.recordedNotes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {session.recordedNotes.slice(0, 100).map((note, i) => (
                <span
                  key={i}
                  className="rounded-md bg-[var(--background-muted)] px-2 py-0.5 text-xs font-mono text-[var(--foreground-muted)]"
                >
                  {note.note}
                </span>
              ))}
              {session.recordedNotes.length > 100 && (
                <span className="text-xs text-[var(--foreground-subtle)] self-center">
                  +{session.recordedNotes.length - 100} more
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Link href="/practice/new">
          <Button>Practice Again</Button>
        </Link>
        <Link href="/practice">
          <Button variant="outline">All Sessions</Button>
        </Link>
      </div>
    </div>
  );
}
