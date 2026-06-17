"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Square, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FallingNote {
  id: number;
  note: string;
  x: number;           // 0-1 normalized piano position
  y: number;           // current y (px)
  height: number;      // px based on duration
  isBlack: boolean;
  hit: boolean;
  missed: boolean;
}

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const WHITE_NOTES = NOTE_NAMES.filter((n) => !n.includes("#"));
const DEMO_SEQUENCE = [
  { note: "C4", delay: 0, duration: 0.5 },
  { note: "E4", delay: 0.5, duration: 0.5 },
  { note: "G4", delay: 1.0, duration: 0.5 },
  { note: "C5", delay: 1.5, duration: 1.0 },
  { note: "D4", delay: 2.5, duration: 0.5 },
  { note: "F4", delay: 3.0, duration: 0.5 },
  { note: "A4", delay: 3.5, duration: 0.5 },
  { note: "D5", delay: 4.0, duration: 1.0 },
  { note: "E4", delay: 5.0, duration: 0.5 },
  { note: "G4", delay: 5.5, duration: 0.5 },
  { note: "B4", delay: 6.0, duration: 0.5 },
  { note: "E5", delay: 6.5, duration: 1.0 },
];

function noteToX(note: string, totalWhiteKeys: number): number {
  const match = note.match(/^([A-G]#?)(\d+)$/);
  if (!match) return 0;
  const [, name, octStr] = match;
  const oct = parseInt(octStr);
  const isBlack = name.includes("#");

  const whitesBefore = (oct - 3) * 7 + WHITE_NOTES.indexOf(
    isBlack ? NOTE_NAMES[NOTE_NAMES.indexOf(name) - 1] : name
  );
  return (whitesBefore + (isBlack ? 0.65 : 0.5)) / totalWhiteKeys;
}

export function FallingNotes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const notesRef = useRef<FallingNote[]>([]);
  const startTimeRef = useRef<number>(0);
  const idRef = useRef(0);

  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(100); // px/sec
  const CANVAS_H = 260;
  const CANVAS_W = 600;
  const TOTAL_WHITE = 28; // ~4 octaves for display
  const KEY_ZONE_Y = CANVAS_H - 40;

  const spawnNotes = useCallback((elapsed: number) => {
    const pxPerSec = speed;
    const lookahead = CANVAS_H / pxPerSec; // seconds of lookahead

    DEMO_SEQUENCE.forEach((seq) => {
      const noteId = `${seq.note}-${seq.delay}`;
      const alreadySpawned = notesRef.current.some((n) => n.id === seq.delay * 1000);
      if (alreadySpawned) return;
      if (seq.delay <= elapsed + lookahead && seq.delay > elapsed - 0.1) {
        const x = noteToX(seq.note, TOTAL_WHITE);
        const match = seq.note.match(/^([A-G]#?)(\d+)$/);
        const isBlack = match ? match[1].includes("#") : false;
        notesRef.current.push({
          id: seq.delay * 1000,
          note: seq.note,
          x,
          y: -seq.height,
          height: seq.duration * pxPerSec,
          isBlack,
          hit: false,
          missed: false,
        });
      }
    });
  }, [speed]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const pxPerSec = speed;

    // Clear
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Background
    ctx.fillStyle = "var(--background-secondary, #0f0f12)";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Key zone line
    ctx.fillStyle = "rgba(245,158,11,0.2)";
    ctx.fillRect(0, KEY_ZONE_Y, CANVAS_W, 2);

    // Spawn and update notes
    spawnNotes(elapsed);

    notesRef.current = notesRef.current
      .map((n) => ({
        ...n,
        y: (elapsed - n.id / 1000) * pxPerSec - n.height,
      }))
      .filter((n) => n.y < CANVAS_H + 50);

    // Draw notes
    const keyW = CANVAS_W / TOTAL_WHITE;
    notesRef.current.forEach((n) => {
      const x = n.x * CANVAS_W;
      const w = n.isBlack ? keyW * 0.5 : keyW * 0.85;
      const xOffset = n.isBlack ? -w / 2 : -w / 2;

      const atZone = n.y + n.height >= KEY_ZONE_Y && n.y <= KEY_ZONE_Y + 10;
      ctx.fillStyle = atZone
        ? "rgba(245,158,11,0.9)"
        : n.isBlack
        ? "rgba(139,92,246,0.85)"
        : "rgba(99,102,241,0.8)";

      // Rounded rectangle
      const rx = 4;
      ctx.beginPath();
      ctx.roundRect(x + xOffset, n.y, w, n.height, rx);
      ctx.fill();

      // Note label
      if (n.height > 20) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(n.note.replace(/\d/, ""), x, n.y + Math.min(n.height / 2 + 4, 16));
      }
    });

    animRef.current = requestAnimationFrame(draw);
  }, [speed, spawnNotes]);

  const start = () => {
    notesRef.current = [];
    startTimeRef.current = Date.now();
    setIsRunning(true);
  };

  const stop = () => {
    cancelAnimationFrame(animRef.current);
    notesRef.current = [];
    setIsRunning(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, CANVAS_W, CANVAS_H);
    }
  };

  useEffect(() => {
    if (isRunning) {
      animRef.current = requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isRunning, draw]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            Falling Notes Mode
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Gauge className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
              <Slider
                value={speed}
                onChange={setSpeed}
                min={40}
                max={200}
                label="Speed"
                className="w-24"
              />
              <span className="w-8 text-xs font-mono text-[var(--foreground-muted)]">{speed}</span>
            </div>
            <Button
              size="sm"
              variant={isRunning ? "destructive" : "default"}
              onClick={isRunning ? stop : start}
            >
              {isRunning ? <><Square className="mr-1.5 h-3.5 w-3.5" />Stop</> : <><Play className="mr-1.5 h-3.5 w-3.5" />Play Demo</>}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden rounded-b-xl">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full"
          style={{ imageRendering: "pixelated" }}
        />
        {!isRunning && (
          <div className="flex items-center justify-center py-6 text-sm text-[var(--foreground-muted)]">
            Press &quot;Play Demo&quot; to see notes fall — connect a song from the Music library when backend is ready
          </div>
        )}
      </CardContent>
    </Card>
  );
}
