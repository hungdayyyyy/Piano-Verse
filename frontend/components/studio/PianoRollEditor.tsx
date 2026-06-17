"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as Tone from "tone";
import { Play, Square, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NOTE_NAMES = ["B","A#","A","G#","G","F#","F","E","D#","D","C#","C"];
const OCTAVES = [6,5,4,3,2];
const ALL_NOTES = OCTAVES.flatMap((o) => NOTE_NAMES.map((n) => `${n}${o}`));

const KEY_H = 16;
const BEAT_W = 40;
const KEY_LABEL_W = 52;
const BEATS = 32;

interface NoteBlock {
  id: string;
  note: string;
  startBeat: number;
  durationBeats: number;
}

export function PianoRollEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [notes, setNotes] = useState<NoteBlock[]>([]);
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [tool, setTool] = useState<"draw" | "erase">("draw");
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const transportRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startBeatRef = useRef(0);
  const startTimeRef = useRef(0);
  const BPM = 120;

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
    return () => synthRef.current?.dispose();
  }, []);

  const beatW = BEAT_W * zoom;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = KEY_LABEL_W + BEATS * beatW;
    const H = ALL_NOTES.length * KEY_H;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = "#0f0f12";
    ctx.fillRect(0, 0, W, H);

    // Rows
    ALL_NOTES.forEach((note, rowIdx) => {
      const y = rowIdx * KEY_H;
      const isBlack = note.includes("#");

      // Piano key
      ctx.fillStyle = isBlack ? "#1c1917" : "#27272a";
      ctx.fillRect(0, y, KEY_LABEL_W - 2, KEY_H - 1);

      // Key label
      if (!isBlack || note.startsWith("C")) {
        ctx.fillStyle = isBlack ? "#71717a" : "#a1a1aa";
        ctx.font = `${KEY_H * 0.6}px monospace`;
        ctx.textAlign = "right";
        ctx.fillText(note, KEY_LABEL_W - 6, y + KEY_H * 0.72);
      }

      // Grid row
      ctx.fillStyle = isBlack ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)";
      ctx.fillRect(KEY_LABEL_W, y, BEATS * beatW, KEY_H - 1);

      // Beat lines
      for (let b = 0; b <= BEATS; b++) {
        ctx.fillStyle = b % 4 === 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)";
        ctx.fillRect(KEY_LABEL_W + b * beatW, y, 1, KEY_H);
      }
    });

    // Note blocks
    notes.forEach((block) => {
      const rowIdx = ALL_NOTES.indexOf(block.note);
      if (rowIdx === -1) return;
      const x = KEY_LABEL_W + block.startBeat * beatW;
      const y = rowIdx * KEY_H + 1;
      const w = block.durationBeats * beatW - 2;
      const h = KEY_H - 2;

      ctx.fillStyle = "rgba(99,102,241,0.85)";
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 3);
      ctx.fill();

      if (w > 20) {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = `${KEY_H * 0.55}px sans-serif`;
        ctx.textAlign = "left";
        ctx.fillText(block.note, x + 4, y + KEY_H * 0.65);
      }
    });

    // Playhead
    if (isPlaying || playhead > 0) {
      const px = KEY_LABEL_W + playhead * beatW;
      ctx.fillStyle = "rgba(245,158,11,0.9)";
      ctx.fillRect(px, 0, 2, H);
    }
  }, [notes, zoom, isPlaying, playhead, beatW]);

  useEffect(() => { draw(); }, [draw]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < KEY_LABEL_W) return;

    const rowIdx = Math.floor(y / KEY_H);
    const beat = Math.floor((x - KEY_LABEL_W) / beatW);
    const note = ALL_NOTES[rowIdx];
    if (!note || beat < 0 || beat >= BEATS) return;

    if (tool === "erase") {
      setNotes((prev) => prev.filter((n) => !(n.note === note && beat >= n.startBeat && beat < n.startBeat + n.durationBeats)));
      return;
    }

    const existing = notes.find((n) => n.note === note && beat >= n.startBeat && beat < n.startBeat + n.durationBeats);
    if (existing) {
      setNotes((prev) => prev.filter((n) => n.id !== existing.id));
    } else {
      setNotes((prev) => [...prev, { id: `${note}-${beat}-${Date.now()}`, note, startBeat: beat, durationBeats: 1 }]);
      synthRef.current?.triggerAttackRelease(note, "8n");
    }
  };

  const play = async () => {
    await Tone.start();
    setIsPlaying(true);
    startTimeRef.current = Date.now();
    startBeatRef.current = 0;
    const secPerBeat = 60 / BPM;

    notes.forEach((block) => {
      synthRef.current?.triggerAttackRelease(
        block.note,
        block.durationBeats * secPerBeat,
        Tone.now() + block.startBeat * secPerBeat
      );
    });

    transportRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const beat = elapsed / secPerBeat;
      setPlayhead(beat);
      if (beat >= BEATS) { stop(); }
    }, 50);
  };

  const stop = () => {
    if (transportRef.current) clearInterval(transportRef.current);
    Tone.getTransport().stop();
    setIsPlaying(false);
    setPlayhead(0);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] p-0.5">
          {(["draw", "erase"] as const).map((t) => (
            <button key={t} onClick={() => setTool(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tool === t ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}>
              {t === "draw" ? "✏️ Draw" : "🗑️ Erase"}
            </button>
          ))}
        </div>

        <Button size="sm" variant={isPlaying ? "destructive" : "default"} onClick={isPlaying ? stop : play}>
          {isPlaying ? <><Square className="mr-1.5 h-3.5 w-3.5" />Stop</> : <><Play className="mr-1.5 h-3.5 w-3.5" />Play</>}
        </Button>

        <Button size="sm" variant="ghost" onClick={() => setNotes([])} disabled={notes.length === 0}>
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />Clear
        </Button>

        <div className="flex items-center gap-1 ml-auto">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}><ZoomOut className="h-3.5 w-3.5" /></Button>
          <span className="text-xs text-[var(--foreground-muted)] w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}><ZoomIn className="h-3.5 w-3.5" /></Button>
        </div>

        <span className="text-xs text-[var(--foreground-muted)]">{notes.length} notes · {BPM} BPM</span>
      </div>

      {/* Canvas */}
      <div className="overflow-auto rounded-lg border border-[var(--border)]" style={{ maxHeight: 400 }}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="cursor-crosshair"
          style={{ display: "block" }}
        />
      </div>
      <p className="text-xs text-[var(--foreground-muted)]">
        Click to draw notes · Click existing note to delete · Drag support coming with backend integration
      </p>
    </div>
  );
}
