"use client";

import { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import { Volume2, RotateCcw } from "lucide-react";

// Simple decibels converter since Tone.Decibels may not be available
const dbToGain = (db: number) => Math.pow(10, db / 20);

interface PianoKey {
  note: string;
  isBlack: boolean;
  frequency: number;
}

const PIANO_NOTES: PianoKey[] = [
  { note: "C3", isBlack: false, frequency: 130.81 },
  { note: "C#3", isBlack: true, frequency: 138.59 },
  { note: "D3", isBlack: false, frequency: 146.83 },
  { note: "D#3", isBlack: true, frequency: 155.56 },
  { note: "E3", isBlack: false, frequency: 164.81 },
  { note: "F3", isBlack: false, frequency: 174.61 },
  { note: "F#3", isBlack: true, frequency: 185.0 },
  { note: "G3", isBlack: false, frequency: 196.0 },
  { note: "G#3", isBlack: true, frequency: 207.65 },
  { note: "A3", isBlack: false, frequency: 220.0 },
  { note: "A#3", isBlack: true, frequency: 233.08 },
  { note: "B3", isBlack: false, frequency: 246.94 },
];

export default function VirtualPiano() {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [volume, setVolume] = useState(0.3);
  const [isInitialized, setIsInitialized] = useState(false);
  const synthRef = useRef<Tone.PolySynth | null>(null);

  // Initialize Tone.js
  useEffect(() => {
    const initAudio = async () => {
      try {
        await Tone.start();
        const synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "triangle" },
          envelope: {
            attack: 0.002,
            decay: 0.1,
            sustain: 0.3,
            release: 1,
          },
        }).toDestination();
        synth.volume.value = 20 * Math.log10(volume);
        synthRef.current = synth;
        setIsInitialized(true);
      } catch (error) {
        console.error("[v0] Failed to initialize audio:", error);
      }
    };
    initAudio();
    return () => {
      synthRef.current?.dispose();
    };
  }, [volume]);

  // Handle mouse events
  const playNote = (note: string) => {
    if (!synthRef.current) return;
    synthRef.current.triggerAttack(note);
    setActiveNotes((prev) => new Set(prev).add(note));
  };

  const stopNote = (note: string) => {
    if (!synthRef.current) return;
    synthRef.current.triggerRelease(note);
    setActiveNotes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  };

  // Keyboard support
  useEffect(() => {
    const noteMap: { [key: string]: string } = {
      z: "C3",
      s: "C#3",
      x: "D3",
      d: "D#3",
      c: "E3",
      v: "F3",
      g: "F#3",
      b: "G3",
      h: "G#3",
      n: "A3",
      j: "A#3",
      m: "B3",
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const note = noteMap[e.key.toLowerCase()];
      if (note && !activeNotes.has(note)) {
        playNote(note);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = noteMap[e.key.toLowerCase()];
      if (note) {
        stopNote(note);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeNotes]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (synthRef.current) {
      synthRef.current.volume.value = 20 * Math.log10(newVolume);
    }
  };

  const handleReset = () => {
    if (synthRef.current && activeNotes.size > 0) {
      synthRef.current.triggerRelease(Array.from(activeNotes));
    }
    setActiveNotes(new Set());
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Virtual Piano</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Use keyboard (Z-M) or click to play
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:border-primary transition text-foreground"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Piano Keyboard */}
      <div className="relative mb-8 h-48 bg-background rounded-lg p-4 overflow-x-auto">
        <div className="flex gap-0.5 relative [perspective:1000px]">
          {PIANO_NOTES.map((key) => (
            <div
              key={key.note}
              className={`relative ${key.isBlack ? "flex-[0_0_50%]" : "flex-[0_0_70px]"}`}
            >
              {key.isBlack ? (
                // Black keys
                <button
                  type="button"
                  onMouseDown={() => playNote(key.note)}
                  onMouseUp={() => stopNote(key.note)}
                  onMouseLeave={() => stopNote(key.note)}
                  aria-label={`Play ${key.note}`}
                  title={`Play ${key.note}`}
                  className={`absolute w-full h-24 rounded-b-lg border-2 border-foreground/20 transition z-10 ${
                    activeNotes.has(key.note)
                      ? "bg-gradient-to-b from-accent to-accent/60 shadow-lg shadow-accent/50"
                      : "bg-gradient-to-b from-black to-gray-800 hover:from-gray-900 hover:to-black"
                  } -ml-[25px] -top-[2px]`}
                />
              ) : (
                // White keys
                <button
                  onMouseDown={() => playNote(key.note)}
                  onMouseUp={() => stopNote(key.note)}
                  onMouseLeave={() => stopNote(key.note)}
                  className={`w-full h-32 rounded-b-lg border-2 border-foreground/30 transition ${
                    activeNotes.has(key.note)
                      ? "bg-gradient-to-b from-primary/30 to-primary/10 shadow-lg shadow-primary/50"
                      : "bg-gradient-to-b from-white to-gray-100 hover:from-gray-50 hover:to-gray-200"
                  }`}
                >
                  <div className="flex flex-col items-center justify-end h-full pb-2">
                    <span className="text-xs font-medium text-foreground/40">
                      {key.note}
                    </span>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Volume</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          aria-label="Volume"
          title="Volume"
          className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm text-muted-foreground w-8 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>

      {!isInitialized && (
        <div className="mt-4 p-3 bg-background border border-border rounded-lg text-sm text-muted-foreground">
          Click anywhere on the page to initialize audio
        </div>
      )}
    </div>
  );
}
