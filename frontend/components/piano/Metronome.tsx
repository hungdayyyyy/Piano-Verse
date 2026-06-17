"use client";

import { useState, useRef, useEffect } from "react";
import * as Tone from "tone";
import { Play, Square, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Metronome() {
  const [bpm, setBpm] = useState(80);
  const [isRunning, setIsRunning] = useState(false);
  const [beat, setBeat] = useState(0);
  const [beatsPerMeasure] = useState(4);
  const loopRef = useRef<Tone.Loop | null>(null);
  const synthRef = useRef<Tone.Synth | null>(null);

  useEffect(() => {
    synthRef.current = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
    }).toDestination();
    synthRef.current.volume.value = -10;
    return () => { synthRef.current?.dispose(); loopRef.current?.dispose(); };
  }, []);

  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  const start = async () => {
    await Tone.start();
    setBeat(0);
    let currentBeat = 0;

    loopRef.current = new Tone.Loop((time) => {
      const isDownbeat = currentBeat % beatsPerMeasure === 0;
      synthRef.current?.triggerAttackRelease(
        isDownbeat ? "C5" : "G4",
        "32n",
        time
      );
      currentBeat++;
      Tone.getDraw().schedule(() => setBeat(currentBeat % beatsPerMeasure), time);
    }, "4n");

    loopRef.current.start(0);
    Tone.getTransport().start();
    setIsRunning(true);
  };

  const stop = () => {
    loopRef.current?.stop();
    loopRef.current?.dispose();
    loopRef.current = null;
    Tone.getTransport().stop();
    setBeat(0);
    setIsRunning(false);
  };

  const changeBpm = (delta: number) => {
    setBpm((v) => Math.max(20, Math.min(240, v + delta)));
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[var(--foreground-muted)]">Metronome</span>

      {/* Beat indicator */}
      <div className="flex gap-1">
        {Array.from({ length: beatsPerMeasure }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-all duration-75",
              isRunning && beat % beatsPerMeasure === i
                ? i === 0 ? "bg-[var(--primary)] scale-125" : "bg-[var(--accent)] scale-125"
                : "bg-[var(--border)]"
            )}
          />
        ))}
      </div>

      {/* BPM control */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => changeBpm(-5)}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-10 text-center text-sm font-mono font-semibold">{bpm}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => changeBpm(5)}>
          <Plus className="h-3 w-3" />
        </Button>
        <span className="text-xs text-[var(--foreground-muted)]">BPM</span>
      </div>

      {/* Play/Stop */}
      <Button
        size="sm"
        variant={isRunning ? "destructive" : "outline"}
        onClick={isRunning ? stop : start}
        className="h-7 px-2.5"
      >
        {isRunning ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
      </Button>
    </div>
  );
}
