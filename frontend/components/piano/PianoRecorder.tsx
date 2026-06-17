"use client";

import { useState, useRef, useCallback } from "react";
import * as Tone from "tone";
import { Circle, Square, Play, Pause, Save, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSaveRecordingMutation } from "@/features/piano/pianoApi";
import { formatDuration } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RecordedEvent {
  note: string;
  time: number;   // seconds from start
  duration: number;
  velocity: number;
}

interface PianoRecorderProps {
  onNotePlay: (note: string) => void;
  onNoteStop: (note: string) => void;
}

type Phase = "idle" | "recording" | "playing" | "stopped";

export function PianoRecorder({ onNotePlay, onNoteStop }: PianoRecorderProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [events, setEvents] = useState<RecordedEvent[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [recordingName, setRecordingName] = useState("My Recording");

  const startTimeRef = useRef<number>(0);
  const noteStartRef = useRef<Record<string, number>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playbackRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [saveRecording, { isLoading: saving }] = useSaveRecordingMutation();

  // ─── Recording ────────────────────────────────────────────────────────
  const startRecording = async () => {
    await Tone.start();
    setEvents([]);
    setElapsed(0);
    startTimeRef.current = Date.now();
    noteStartRef.current = {};
    setPhase("recording");

    timerRef.current = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 500);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("stopped");
  };

  const noteOn = useCallback((note: string) => {
    if (phase !== "recording") return;
    noteStartRef.current[note] = (Date.now() - startTimeRef.current) / 1000;
    onNotePlay(note);
  }, [phase, onNotePlay]);

  const noteOff = useCallback((note: string) => {
    if (phase !== "recording") return;
    const start = noteStartRef.current[note];
    if (start === undefined) return;
    const duration = (Date.now() - startTimeRef.current) / 1000 - start;
    setEvents((prev) => [...prev, { note, time: start, duration, velocity: 0.8 }]);
    delete noteStartRef.current[note];
    onNoteStop(note);
  }, [phase, onNoteStop]);

  // ─── Playback ─────────────────────────────────────────────────────────
  const startPlayback = async () => {
    await Tone.start();
    setPhase("playing");
    setElapsed(0);

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now();

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    events.forEach((ev) => {
      const t = setTimeout(() => {
        synth.triggerAttackRelease(ev.note, ev.duration, Tone.now(), ev.velocity);
        onNotePlay(ev.note);
        setTimeout(() => onNoteStop(ev.note), ev.duration * 1000);
        setElapsed(Math.round(ev.time));
      }, ev.time * 1000);
      timeouts.push(t);
    });

    playbackRef.current = timeouts;

    // Auto-stop after last event
    const totalDuration = Math.max(...events.map((e) => e.time + e.duration), 0);
    const doneTimeout = setTimeout(() => {
      setPhase("stopped");
      synth.dispose();
    }, (totalDuration + 0.5) * 1000);
    playbackRef.current.push(doneTimeout);
  };

  const stopPlayback = () => {
    playbackRef.current.forEach(clearTimeout);
    playbackRef.current = [];
    setPhase("stopped");
  };

  const discard = () => {
    stopPlayback();
    setEvents([]);
    setElapsed(0);
    setPhase("idle");
  };

  const handleSave = async () => {
    if (events.length === 0) return;
    try {
      const totalDuration = Math.max(...events.map((e) => e.time + e.duration), 0);
      await saveRecording({
        name: recordingName,
        notes: events.map((e) => ({ note: e.note, timestamp: e.time * 1000, duration: e.duration * 1000 })),
        duration: Math.round(totalDuration),
      }).unwrap();
      toast.success("Recording saved!");
      discard();
    } catch {
      toast.error("Failed to save — backend recordings list is currently mocked");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Circle className="h-4 w-4 text-[var(--destructive)]" />
          Piano Recorder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status + timer */}
        <div className="flex items-center gap-3">
          {phase === "recording" && (
            <span className="flex items-center gap-1.5 text-sm text-[var(--destructive)]">
              <span className="h-2 w-2 rounded-full bg-[var(--destructive)] animate-pulse" />
              Recording
            </span>
          )}
          {phase === "playing" && (
            <span className="flex items-center gap-1.5 text-sm text-[var(--accent)]">
              <Play className="h-3 w-3 fill-current" />
              Playing back
            </span>
          )}
          {phase === "stopped" && events.length > 0 && (
            <Badge variant="secondary">{events.length} notes · {formatDuration(elapsed)}</Badge>
          )}
          {phase === "idle" && (
            <span className="text-sm text-[var(--foreground-muted)]">
              Press record to start capturing
            </span>
          )}
          {(phase === "recording" || phase === "playing") && (
            <span className="ml-auto font-mono text-sm tabular-nums">{formatDuration(elapsed)}</span>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {phase === "idle" && (
            <Button onClick={startRecording} variant="destructive" size="sm">
              <Circle className="mr-1.5 h-3.5 w-3.5 fill-current" />
              Record
            </Button>
          )}

          {phase === "recording" && (
            <Button onClick={stopRecording} variant="outline" size="sm">
              <Square className="mr-1.5 h-3.5 w-3.5" />
              Stop
            </Button>
          )}

          {phase === "stopped" && events.length > 0 && (
            <>
              <Button onClick={startPlayback} variant="outline" size="sm">
                <Play className="mr-1.5 h-3.5 w-3.5" />
                Play Back
              </Button>
              <Button onClick={startRecording} variant="outline" size="sm">
                <Circle className="mr-1.5 h-3.5 w-3.5 text-[var(--destructive)]" />
                Re-record
              </Button>
              <Button onClick={handleSave} size="sm" disabled={saving}>
                {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                Save
              </Button>
              <Button onClick={discard} variant="ghost" size="sm" className="text-[var(--destructive)]">
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Discard
              </Button>
            </>
          )}

          {phase === "playing" && (
            <Button onClick={stopPlayback} variant="destructive" size="sm">
              <Pause className="mr-1.5 h-3.5 w-3.5" />
              Stop
            </Button>
          )}
        </div>

        {/* Notes preview */}
        {events.length > 0 && (
          <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
            {events.slice(-20).map((e, i) => (
              <span key={i} className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-mono",
                "bg-[var(--background-muted)] text-[var(--foreground-muted)]"
              )}>
                {e.note}
              </span>
            ))}
            {events.length > 20 && (
              <span className="text-[10px] text-[var(--foreground-subtle)] self-center">
                +{events.length - 20} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { type PianoRecorderProps };
