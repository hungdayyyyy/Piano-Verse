"use client";

import { useState } from "react";
import { Brain, TrendingUp, AlertCircle, CheckCircle2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useAnalyzePerformanceMutation } from "@/features/ai/aiApi";
import { useGetSessionsQuery } from "@/features/practice/practiceApi";
import { formatPercentage, formatDate } from "@/lib/utils";
import type { AIAnalysis } from "@/lib/api/types";
import { toast } from "sonner";

export function PerformanceAnalyzer() {
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [result, setResult] = useState<AIAnalysis | null>(null);
  const [expanded, setExpanded] = useState(true);

  const { data: sessionsData } = useGetSessionsQuery({ limit: 20 });
  const [analyze, { isLoading }] = useAnalyzePerformanceMutation();

  const sessions = sessionsData?.data ?? [];
  const selectedSession = sessions.find((s) => s._id === selectedSessionId);

  const handleAnalyze = async () => {
    if (!selectedSession) return;
    try {
      const res = await analyze({
        accuracyPercentage: selectedSession.accuracyPercentage,
        notesHit: selectedSession.notesHit,
        notesMissed: selectedSession.notesMissed,
        songName: selectedSession.songName,
      }).unwrap();
      setResult(res.data ?? null);
      toast.success("Analysis complete!");
    } catch {
      toast.error("Analysis failed — backend AI is mocked");
    }
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-[var(--accent)]" />
            <CardTitle className="text-base">Performance Analyzer</CardTitle>
            <Badge variant="mocked">Mocked AI</Badge>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-[var(--foreground-muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--foreground-muted)]" />}
        </div>
        <CardDescription>Select a practice session for AI-powered analysis and feedback</CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Select
              value={selectedSessionId}
              onChange={(e) => { setSelectedSessionId(e.target.value); setResult(null); }}
              className="flex-1"
            >
              <option value="">Select a practice session…</option>
              {sessions.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.songName} — {formatPercentage(s.accuracyPercentage, 0)} accuracy ({formatDate(s.createdAt)})
                </option>
              ))}
            </Select>
            <Button
              onClick={handleAnalyze}
              disabled={!selectedSessionId || isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing…</>
              ) : (
                "Analyze"
              )}
            </Button>
          </div>

          {selectedSession && !result && (
            <div className="rounded-lg bg-[var(--background-muted)] p-4 text-sm space-y-1">
              <p className="font-medium">{selectedSession.songName}</p>
              <div className="flex gap-4 text-[var(--foreground-muted)]">
                <span>Accuracy: <strong className="text-[var(--foreground)]">{formatPercentage(selectedSession.accuracyPercentage)}</strong></span>
                <span>Notes Hit: <strong className="text-[var(--success)]">{selectedSession.notesHit}</strong></span>
                <span>Missed: <strong className="text-[var(--destructive)]">{selectedSession.notesMissed}</strong></span>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-fade-in">
              {/* Overall score */}
              <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-[var(--accent)]/10 to-[var(--primary)]/10 p-4 border border-[var(--accent)]/20">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20">
                  <span className="text-2xl font-bold text-[var(--accent)]">{result.overallScore}</span>
                </div>
                <div>
                  <p className="font-semibold text-lg">Overall Score</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Accuracy: {formatPercentage(result.accuracy)} · Timing: {result.timing}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Strengths */}
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--success)]">
                    <CheckCircle2 className="h-4 w-4" />
                    Strengths
                  </p>
                  <div className="space-y-1.5">
                    {result.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg bg-[var(--success)]/5 border border-[var(--success)]/20 px-3 py-2 text-sm">
                        <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--success)]" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--warning)]">
                    <AlertCircle className="h-4 w-4" />
                    Areas to Improve
                  </p>
                  <div className="space-y-1.5">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg bg-[var(--warning)]/5 border border-[var(--warning)]/20 px-3 py-2 text-sm">
                        <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--warning)]" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-xs text-[var(--foreground-muted)]">
                  Analysis powered by AI — backend currently returns demonstration data
                </p>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
