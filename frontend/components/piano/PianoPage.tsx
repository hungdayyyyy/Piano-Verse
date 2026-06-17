"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import * as Tone from "tone";
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  pressNote,
  releaseNote,
  releaseAll,
  setVolume,
  shiftOctave,
  setMidiConnected,
  selectActiveNotes,
  selectPianoVolume,
  selectOctaveShift,
  selectSustainPedal,
  selectMidiConnected,
  toggleSustain,
} from "@/features/piano/pianoSlice";
import { useGetConfigQuery, useGetMidiMappingsQuery } from "@/features/piano/pianoApi";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─── Note / key generation ─────────────────────────────────────────────────
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function generateOctaveKeys(octave: number) {
  return NOTE_NAMES.map((name) => ({
    note: `${name}${octave}`,
    isBlack: name.includes("#"),
    name,
  }));
}

// Full 88-key range: A0–C8 (MIDI 21–108)
function generate88Keys() {
  const keys: { note: string; isBlack: boolean; name: string }[] = [];
  for (let oct = 0; oct <= 8; oct++) {
    const octaveKeys = generateOctaveKeys(oct);
    for (const k of octaveKeys) {
      const midi = midiNumber(k.note);
      if (midi >= 21 && midi <= 108) keys.push(k);
    }
  }
  return keys;
}

function midiNumber(note: string): number {
  const match = note.match(/^([A-G]#?)(\d+)$/);
  if (!match) return -1;
  const [, name, octStr] = match;
  const noteIdx = NOTE_NAMES.indexOf(name);
  return (parseInt(octStr) + 1) * 12 + noteIdx;
}

// Keyboard mapping for one octave (Z–M row + Q–U row)
const KEYBOARD_MAP: Record<string, string> = {
  z: "C", s: "C#", x: "D", d: "D#", c: "E",
  v: "F", g: "F#", b: "G", h: "G#", n: "A", j: "A#", m: "B",
  q: "C", "2": "C#", w: "D", "3": "D#", e: "E",
  r: "F", "5": "F#", t: "G", "6": "G#", y: "A", "7": "A#", u: "B",
};

const ALL_KEYS = generate88Keys();

export function PianoPage() {
  const dispatch = useAppDispatch();
  const activeNotes = useAppSelector(selectActiveNotes);
  const volume = useAppSelector(selectPianoVolume);
  const octaveShift = useAppSelector(selectOctaveShift);
  const sustainPedal = useAppSelector(selectSustainPedal);
  const midiConnected = useAppSelector(selectMidiConnected);

  const { data: configData } = useGetConfigQuery();
  const { data: midiMappingData } = useGetMidiMappingsQuery();

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const keysHeld = useRef<Set<string>>(new Set());
  const [audioStarted, setAudioStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ─── Initialize Tone.js synth ──────────────────────────────────────────
  useEffect(() => {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.6, release: 1.2 },
    }).toDestination();
    synth.volume.value = Tone.gainToDb(volume);
    synthRef.current = synth;

    return () => {
      synth.dispose();
    };
  }, []);

  // ─── Volume sync ───────────────────────────────────────────────────────
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.value = volume === 0 ? -Infinity : Tone.gainToDb(volume);
    }
  }, [volume]);

  // ─── Start audio context on first interaction ──────────────────────────
  const ensureAudio = async () => {
    if (!audioStarted) {
      await Tone.start();
      setAudioStarted(true);
    }
  };

  // ─── Play / stop note ─────────────────────────────────────────────────
  const playNote = useCallback(
    async (note: string) => {
      await ensureAudio();
      try {
        synthRef.current?.triggerAttack(note, Tone.now());
        dispatch(pressNote(note));
      } catch {
        // Invalid note — ignore
      }
    },
    [dispatch, audioStarted]
  );

  const stopNote = useCallback(
    (note: string) => {
      try {
        synthRef.current?.triggerRelease(note, Tone.now());
        dispatch(releaseNote(note));
      } catch {}
    },
    [dispatch]
  );

  // ─── Keyboard input ────────────────────────────────────────────────────
  useEffect(() => {
    const baseOctave = 4 + octaveShift;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === " ") {
        e.preventDefault();
        dispatch(toggleSustain());
        return;
      }

      const noteName = KEYBOARD_MAP[e.key.toLowerCase()];
      if (!noteName) return;

      // Q-U row plays one octave higher
      const oct =
        ["q", "2", "w", "3", "e", "r", "5", "t", "6", "y", "7", "u"].includes(
          e.key.toLowerCase()
        )
          ? baseOctave + 1
          : baseOctave;

      const note = `${noteName}${oct}`;
      if (!keysHeld.current.has(e.key)) {
        keysHeld.current.add(e.key);
        playNote(note);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const noteName = KEYBOARD_MAP[e.key.toLowerCase()];
      if (!noteName) return;
      const baseOctave = 4 + octaveShift;
      const oct =
        ["q", "2", "w", "3", "e", "r", "5", "t", "6", "y", "7", "u"].includes(
          e.key.toLowerCase()
        )
          ? baseOctave + 1
          : baseOctave;
      const note = `${noteName}${oct}`;
      keysHeld.current.delete(e.key);
      stopNote(note);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      dispatch(releaseAll());
    };
  }, [dispatch, octaveShift, playNote, stopNote]);

  // ─── WebMIDI ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.requestMIDIAccess) return;

    navigator.requestMIDIAccess().then((midi) => {
      const inputs = Array.from(midi.inputs.values());
      if (inputs.length === 0) return;

      dispatch(setMidiConnected({ connected: true, deviceName: inputs[0].name ?? "MIDI Device" }));

      inputs.forEach((input) => {
        input.onmidimessage = (event) => {
          const [status, noteNum, velocity] = Array.from(event.data);
          const midiMappings = midiMappingData?.data ?? {};
          const note = midiMappings[String(noteNum)];
          if (!note) return;

          const isNoteOn = (status & 0xf0) === 0x90 && velocity > 0;
          const isNoteOff = (status & 0xf0) === 0x80 || ((status & 0xf0) === 0x90 && velocity === 0);

          if (isNoteOn) playNote(note);
          else if (isNoteOff) stopNote(note);
        };
      });

      midi.onstatechange = (e) => {
        const port = e.port;
        if (port.type === "input") {
          const connected = port.state === "connected";
          dispatch(setMidiConnected({ connected, deviceName: connected ? port.name ?? undefined : undefined }));
        }
      };
    }).catch(() => {
      // WebMIDI not supported or permission denied
    });
  }, [dispatch, midiMappingData, playNote, stopNote]);

  // ─── Scroll to middle C on mount ──────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const middleC = el.querySelector('[data-note="C4"]') as HTMLElement;
    if (middleC) {
      el.scrollLeft = middleC.offsetLeft - el.clientWidth / 2;
    }
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────
  const whiteKeys = ALL_KEYS.filter((k) => !k.isBlack);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Virtual Piano</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            88 keys · Click, keyboard (Z–U), or MIDI controller
          </p>
        </div>
        <div className="flex items-center gap-2">
          {midiConnected ? (
            <Badge variant="success" className="gap-1.5">
              <Wifi className="h-3 w-3" />
              MIDI Connected
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5">
              <WifiOff className="h-3 w-3" />
              No MIDI
            </Badge>
          )}
          {sustainPedal && (
            <Badge variant="accent">Sustain ON</Badge>
          )}
        </div>
      </div>

      {/* Controls bar */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 p-4">
          {/* Volume */}
          <div className="flex items-center gap-3 min-w-[160px]">
            <button
              onClick={() => dispatch(setVolume(volume === 0 ? 0.7 : 0))}
              className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Toggle mute"
            >
              {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <Slider
              value={Math.round(volume * 100)}
              onChange={(v) => dispatch(setVolume(v / 100))}
              min={0}
              max={100}
              label="Volume"
              className="w-28"
            />
            <span className="text-xs text-[var(--foreground-muted)] w-8 tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Octave shift */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--foreground-muted)]">Octave</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => dispatch(shiftOctave(octaveShift - 1))}
              disabled={octaveShift <= -2}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-sm font-mono font-semibold">
              {octaveShift > 0 ? `+${octaveShift}` : octaveShift}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => dispatch(shiftOctave(octaveShift + 1))}
              disabled={octaveShift >= 2}
              className="h-7 w-7"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          {/* Sustain pedal */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(toggleSustain())}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                sustainPedal
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              )}
            >
              Sustain (Space)
            </button>
          </div>

          {/* Keyboard hint */}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
            <Settings2 className="h-3 w-3" />
            Z–M · Q–U keys · Space = sustain
          </div>
        </CardContent>
      </Card>

      {/* Piano keyboard */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          {/* Active notes display */}
          <div className="mb-3 flex h-6 items-center gap-1.5 overflow-x-auto">
            {activeNotes.length === 0 ? (
              <span className="text-xs text-[var(--foreground-subtle)]">Play a note…</span>
            ) : (
              activeNotes.map((note) => (
                <Badge key={note} variant="accent" className="text-xs font-mono flex-shrink-0">
                  {note}
                </Badge>
              ))
            )}
          </div>

          {/* Scrollable keyboard */}
          <div
            ref={scrollRef}
            className="relative overflow-x-auto pb-2 select-none"
            style={{ cursor: "default" }}
          >
            <div
              className="relative flex"
              style={{ height: "160px", width: `${whiteKeys.length * 40}px` }}
            >
              {/* White keys */}
              {ALL_KEYS.filter((k) => !k.isBlack).map((key, wIdx) => {
                const isActive = activeNotes.includes(key.note);
                return (
                  <button
                    key={key.note}
                    data-note={key.note}
                    onMouseDown={() => playNote(key.note)}
                    onMouseUp={() => stopNote(key.note)}
                    onMouseEnter={(e) => {
                      if (e.buttons === 1) playNote(key.note);
                    }}
                    onMouseLeave={() => stopNote(key.note)}
                    onTouchStart={(e) => { e.preventDefault(); playNote(key.note); }}
                    onTouchEnd={() => stopNote(key.note)}
                    className={cn(
                      "absolute bottom-0 border border-[var(--border)] rounded-b-md transition-all duration-75",
                      "flex items-end justify-center pb-2",
                      isActive
                        ? "bg-[var(--piano-active-white)] shadow-inner"
                        : "bg-[var(--piano-white-key)] hover:bg-[var(--piano-active-white)]/30"
                    )}
                    style={{
                      left: `${wIdx * 40}px`,
                      width: "38px",
                      height: "160px",
                      zIndex: 1,
                    }}
                    aria-label={`Piano key ${key.note}`}
                  >
                    <span className="text-[10px] text-zinc-400 font-medium select-none">
                      {key.name === "C" ? key.note : ""}
                    </span>
                  </button>
                );
              })}

              {/* Black keys */}
              {(() => {
                // Position black keys between their neighboring white keys
                let wIdx = 0;
                return ALL_KEYS.map((key) => {
                  if (!key.isBlack) {
                    wIdx++;
                    return null;
                  }
                  const isActive = activeNotes.includes(key.note);
                  return (
                    <button
                      key={key.note}
                      data-note={key.note}
                      onMouseDown={(e) => { e.stopPropagation(); playNote(key.note); }}
                      onMouseUp={() => stopNote(key.note)}
                      onMouseLeave={() => stopNote(key.note)}
                      onTouchStart={(e) => { e.preventDefault(); playNote(key.note); }}
                      onTouchEnd={() => stopNote(key.note)}
                      className={cn(
                        "absolute top-0 rounded-b-md transition-all duration-75",
                        isActive
                          ? "bg-[var(--piano-active-black)]"
                          : "bg-[var(--piano-black-key)] hover:bg-zinc-700"
                      )}
                      style={{
                        left: `${(wIdx - 1) * 40 + 24}px`,
                        width: "26px",
                        height: "100px",
                        zIndex: 2,
                      }}
                      aria-label={`Piano key ${key.note}`}
                    />
                  );
                });
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Config info from backend */}
      {configData?.data && (
        <p className="text-xs text-[var(--foreground-subtle)]">
          Backend config: {configData.data.octaves?.length ?? 0} octaves configured ·
          Range {configData.data.startNote}–{configData.data.endNote}
        </p>
      )}
    </div>
  );
}
