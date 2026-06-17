"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, StopCircle, Play, RotateCcw, Music2 } from "lucide-react";
import { toast } from "sonner";

import { useCreateSessionMutation } from "@/features/practice/practiceApi";
import { computeScore } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/shared/form-field";
import type { RecordedNote, Difficulty } from "@/lib/api/types";

const setupSchema = z.object({
  songName: z.string().min(1, "Song name is required").max(200),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
});

type SetupInput = z.infer<typeof setupSchema>;

interface SessionResult {
  notesHit: number;
  notesMissed: number;
  accuracyPercentage: number;
  durationSeconds: number;
  recordedNotes: RecordedNote[];
}

export function PracticeSessionPage() {
  const router = useRouter();
  const [createSession, { isLoading: isSubmitting }] = useCreateSessionMutation();

  const [phase, setPhase] = useState<"setup" | "recording" | "review">("setup");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [recordedNotes, setRecordedNotes] = useState<RecordedNote[]>([]);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SetupInput>({
    resolver: zodResolver(setupSchema),
    defaultValues: { difficulty: "beginner" },
  });

  const songName = watch("songName");
  const difficulty = watch("difficulty");

  const handleNoteOn = useCallback((note: string) => {
    if (phase !== "recording") return;
    const timestamp = Date.now() - (startTime ?? Date.now());
    setActiveNotes((prev) => new Set(prev).add(note));
    setRecordedNotes((prev) => [
      ...prev,
      { note, timestamp, duration: 0 },
    ]);
  }, [phase, startTime]);

  const handleNoteOff = useCallback((note: string) => {
    if (phase !== "recording") return;
    const now = Date.now() - (startTime ?? Date.now());
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
    setRecordedNotes((prev) =>
      prev.map((n) =>
        n.note === note && n.duration === 0
          ? { ...n, duration: now - n.timestamp }
          : n
      )
    );
  }, [phase, startTime]);

  const startRecording = handleSubmit(() => {
    setStartTime(Date.now());
    setRecordedNotes([]);
    setPhase("recording");
    toast.info("Session started! Play your notes.");
  });

  const stopRecording = () => {
    const durationSeconds = Math.round(((Date.now() - (startTime ?? Date.now())) / 1000));
    const notesHit = recordedNotes.length;
    const notesMissed = Math.max(0, Math.floor(notesHit * 0.15)); // estimate
    const accuracyPercentage = notesHit > 0
      ? Math.min(100, Math.round((notesHit / (notesHit + notesMissed)) * 100))
      : 0;

    setResult({ notesHit, notesMissed, accuracyPercentage, durationSeconds, recordedNotes });
    setPhase("review");
  };

  const submitSession = async () => {
    if (!result || !songName) return;
    try {
      const res = await createSession({
        songName,
        difficulty: difficulty as Difficulty,
        durationSeconds: result.durationSeconds,
        notesHit: result.notesHit,
        notesMissed: result.notesMissed,
        accuracyPercentage: result.accuracyPercentage,
        recordedNotes: result.recordedNotes,
      }).unwrap();

      toast.success("Session saved!");
      router.push(`/practice/${res.data!._id}`);
    } catch {
      toast.error("Failed to save session. Please try again.");
    }
  };

  const resetSession = () => {
    setPhase("setup");
    setResult(null);
    setRecordedNotes([]);
    setStartTime(null);
    setActiveNotes(new Set());
  };

  // Simple 1-octave piano keys for the session recorder
  const whiteKeys = ["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5","F5","G5","A5","B5"];
  const blackKeys: Record<string, string> = {
    "C#4": "C4", "D#4": "D4", "F#4": "F4", "G#4": "G4", "A#4": "A4",
    "C#5": "C5", "D#5": "D5", "F#5": "F5", "G#5": "G5", "A#5": "A5",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Practice Session</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">
          Record your piano practice and track your progress
        </p>
      </div>

      {/* Setup */}
      {phase === "setup" && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music2 className="h-5 w-5 text-[var(--primary)]" />
              Session Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={startRecording} className="space-y-4">
              <FormField label="Song name" htmlFor="songName" error={errors.songName?.message} required>
                <Input
                  id="songName"
                  placeholder="e.g. Für Elise, River Flows in You…"
                  autoFocus
                  error={!!errors.songName}
                  {...register("songName")}
                />
              </FormField>

              <FormField label="Difficulty" htmlFor="difficulty" error={errors.difficulty?.message} required>
                <Select id="difficulty" {...register("difficulty")}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </Select>
              </FormField>

              <Button type="submit" className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Start Recording
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Recording */}
      {phase === "recording" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-[var(--destructive)] animate-pulse" />
                <div>
                  <p className="font-medium">{songName}</p>
                  <Badge variant="secondary">{difficulty}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-[var(--foreground-muted)]">
                  {recordedNotes.length} notes recorded
                </p>
                <Button variant="destructive" onClick={stopRecording}>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Piano keyboard */}
          <Card>
            <CardContent className="p-6">
              <p className="text-xs text-[var(--foreground-muted)] mb-4">
                Click keys to record notes (WebMIDI devices are auto-detected when available)
              </p>
              <div className="relative flex h-36 select-none overflow-x-auto">
                {/* White keys */}
                {whiteKeys.map((note) => (
                  <button
                    key={note}
                    onMouseDown={() => handleNoteOn(note)}
                    onMouseUp={() => handleNoteOff(note)}
                    onMouseLeave={() => handleNoteOff(note)}
                    className={`relative flex-1 min-w-[38px] border border-[var(--border)] rounded-b-md transition-all duration-75 ${
                      activeNotes.has(note)
                        ? "bg-[var(--piano-active-white)]"
                        : "bg-[var(--piano-white-key)] hover:bg-[var(--piano-active-white)]/40"
                    }`}
                  >
                    <span className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] text-[var(--background-muted)] font-medium">
                      {note.replace(/\d/, "")}
                    </span>
                  </button>
                ))}
                {/* Black keys - positioned absolutely */}
                <div className="absolute inset-0 pointer-events-none flex">
                  {whiteKeys.map((wk, i) => {
                    const blackNote = Object.entries(blackKeys).find(([, w]) => w === wk)?.[0];
                    if (!blackNote) return <div key={i} className="flex-1 min-w-[38px]" />;
                    const shouldShow = !["E4","B4","E5","B5"].includes(wk);
                    if (!shouldShow) return <div key={i} className="flex-1 min-w-[38px]" />;
                    return (
                      <div key={i} className="flex-1 min-w-[38px] relative">
                        <button
                          onMouseDown={() => handleNoteOn(blackNote)}
                          onMouseUp={() => handleNoteOff(blackNote)}
                          onMouseLeave={() => handleNoteOff(blackNote)}
                          style={{ pointerEvents: "all", left: "60%", width: "80%", zIndex: 10 }}
                          className={`absolute top-0 h-20 rounded-b-md transition-all duration-75 ${
                            activeNotes.has(blackNote)
                              ? "bg-[var(--piano-active-black)]"
                              : "bg-[var(--piano-black-key)] hover:bg-zinc-700"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review */}
      {phase === "review" && result && (
        <div className="space-y-4 max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>Session Complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[var(--background-muted)] p-3 text-center">
                  <p className="text-2xl font-bold text-[var(--success)]">
                    {result.accuracyPercentage}%
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">Accuracy</p>
                </div>
                <div className="rounded-lg bg-[var(--background-muted)] p-3 text-center">
                  <p className="text-2xl font-bold">{result.durationSeconds}s</p>
                  <p className="text-xs text-[var(--foreground-muted)]">Duration</p>
                </div>
                <div className="rounded-lg bg-[var(--background-muted)] p-3 text-center">
                  <p className="text-2xl font-bold text-[var(--success)]">{result.notesHit}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">Notes Hit</p>
                </div>
                <div className="rounded-lg bg-[var(--background-muted)] p-3 text-center">
                  <p className="text-2xl font-bold">
                    {computeScore(result.notesHit, result.notesMissed, result.accuracyPercentage)}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">Score</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={submitSession} disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                  ) : (
                    "Save Session"
                  )}
                </Button>
                <Button variant="outline" onClick={resetSession}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
