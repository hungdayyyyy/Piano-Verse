"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import * as Tone from "tone";
import {
  Volume2, VolumeX, ChevronLeft, ChevronRight, Wifi, WifiOff,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  pressNote, releaseNote, releaseAll,
  setVolume, shiftOctave, setMidiConnected,
  toggleSustain, selectActiveNotes, selectPianoVolume,
  selectOctaveShift, selectSustainPedal, selectMidiConnected,
} from "@/features/piano/pianoSlice";
import { useGetConfigQuery, useGetMidiMappingsQuery } from "@/features/piano/pianoApi";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InstrumentSelector } from "./InstrumentSelector";
import { Metronome } from "./Metronome";
import { PianoRecorder } from "./PianoRecorder";
import { FallingNotes } from "./FallingNotes";
import { cn } from "@/lib/utils";

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const KEYBOARD_MAP: Record<string, string> = {
  z:"C",s:"C#",x:"D",d:"D#",c:"E",v:"F",g:"F#",b:"G",h:"G#",n:"A",j:"A#",m:"B",
  q:"C","2":"C#",w:"D","3":"D#",e:"E",r:"F","5":"F#",t:"G","6":"G#",y:"A","7":"A#",u:"B",
};
const UPPER_ROW = new Set(["q","2","w","3","e","r","5","t","6","y","7","u"]);

function generateKeys() {
  const keys: { note: string; isBlack: boolean; octave: number }[] = [];
  for (let oct = 0; oct <= 8; oct++) {
    for (const name of NOTE_NAMES) {
      const midi = (oct + 1) * 12 + NOTE_NAMES.indexOf(name);
      if (midi >= 21 && midi <= 108) {
        keys.push({ note: `${name}${oct}`, isBlack: name.includes("#"), octave: oct });
      }
    }
  }
  return keys;
}

const ALL_KEYS = generateKeys();
const WHITE_KEYS = ALL_KEYS.filter((k) => !k.isBlack);

function getSynthOptions(instrument: string): Partial<Tone.SynthOptions> {
  switch (instrument) {
    case "organ":
      return { oscillator: { type: "square" as const }, envelope: { attack: 0.01, decay: 0, sustain: 1, release: 0.1 } };
    case "synth":
      return { oscillator: { type: "sawtooth" as const }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.8 } };
    case "strings":
      return { oscillator: { type: "sine" as const }, envelope: { attack: 0.3, decay: 0.1, sustain: 0.8, release: 1.5 } };
    default:
      return { oscillator: { type: "triangle" as const }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.6, release: 1.2 } };
  }
}

export function PianoPageFull() {
  const dispatch = useAppDispatch();
  const activeNotes = useAppSelector(selectActiveNotes);
  const volume = useAppSelector(selectPianoVolume);
  const octaveShift = useAppSelector(selectOctaveShift);
  const sustainPedal = useAppSelector(selectSustainPedal);
  const midiConnected = useAppSelector(selectMidiConnected);
  const instrument = useAppSelector((s) => s.piano.instrument);

  const { data: midiMappingData } = useGetMidiMappingsQuery();
  const { data: configData } = useGetConfigQuery();

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const keysHeld = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [audioStarted, setAudioStarted] = useState(false);

  // ─── Build synth ──────────────────────────────────────────────────────
  useEffect(() => {
    synthRef.current?.dispose();
    const synth = new Tone.PolySynth(Tone.Synth, getSynthOptions(instrument)).toDestination();
    synth.volume.value = volume === 0 ? -Infinity : Tone.gainToDb(volume);
    synthRef.current = synth;
    return () => synth.dispose();
  }, [instrument]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.value = volume === 0 ? -Infinity : Tone.gainToDb(volume);
    }
  }, [volume]);

  const ensureAudio = async () => {
    if (!audioStarted) { await Tone.start(); setAudioStarted(true); }
  };

  const playNote = useCallback(async (note: string) => {
    await ensureAudio();
    try { synthRef.current?.triggerAttack(note, Tone.now()); dispatch(pressNote(note)); } catch {}
  }, [dispatch, audioStarted]);

  const stopNote = useCallback((note: string) => {
    try { synthRef.current?.triggerRelease(note, Tone.now()); dispatch(releaseNote(note)); } catch {}
  }, [dispatch]);

  // ─── Keyboard events ──────────────────────────────────────────────────
  useEffect(() => {
    const baseOctave = 4 + octaveShift;
    const onDown = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey) return;
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === " ") { e.preventDefault(); dispatch(toggleSustain()); return; }
      const name = KEYBOARD_MAP[e.key.toLowerCase()];
      if (!name || keysHeld.current.has(e.key)) return;
      keysHeld.current.add(e.key);
      playNote(`${name}${UPPER_ROW.has(e.key.toLowerCase()) ? baseOctave + 1 : baseOctave}`);
    };
    const onUp = (e: KeyboardEvent) => {
      const name = KEYBOARD_MAP[e.key.toLowerCase()];
      if (!name) return;
      keysHeld.current.delete(e.key);
      const baseOctave = 4 + octaveShift;
      stopNote(`${name}${UPPER_ROW.has(e.key.toLowerCase()) ? baseOctave + 1 : baseOctave}`);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); dispatch(releaseAll()); };
  }, [dispatch, octaveShift, playNote, stopNote]);

  // ─── WebMIDI ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.requestMIDIAccess) return;
    navigator.requestMIDIAccess().then((midi) => {
      const inputs = Array.from(midi.inputs.values());
      if (!inputs.length) return;
      dispatch(setMidiConnected({ connected: true, deviceName: inputs[0].name ?? "MIDI" }));
      inputs.forEach((input) => {
        input.onmidimessage = (ev) => {
          const [status, noteNum, velocity] = Array.from(ev.data);
          const note = midiMappingData?.data?.[String(noteNum)];
          if (!note) return;
          const isOn = (status & 0xf0) === 0x90 && velocity > 0;
          const isOff = (status & 0xf0) === 0x80 || ((status & 0xf0) === 0x90 && velocity === 0);
          if (isOn) playNote(note);
          else if (isOff) stopNote(note);
        };
      });
    }).catch(() => {});
  }, [dispatch, midiMappingData, playNote, stopNote]);

  // ─── Scroll to C4 ────────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    const c4 = el?.querySelector('[data-note="C4"]') as HTMLElement;
    if (el && c4) el.scrollLeft = c4.offsetLeft - el.clientWidth / 2 + 80;
  }, []);

  // ─── Keyboard render ──────────────────────────────────────────────────
  const PianoKeys = () => (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex h-6 items-center gap-1.5 overflow-x-auto">
          {activeNotes.length === 0
            ? <span className="text-xs text-[var(--foreground-subtle)]">Play a note… (keys Z–M, Q–U, Space=sustain)</span>
            : activeNotes.map((n) => <Badge key={n} variant="accent" className="font-mono text-xs flex-shrink-0">{n}</Badge>)
          }
        </div>
        <div ref={scrollRef} className="relative overflow-x-auto pb-2 select-none" style={{ height: 172 }}>
          <div className="relative flex" style={{ width: `${WHITE_KEYS.length * 40}px`, height: 168 }}>
            {WHITE_KEYS.map((key, wIdx) => {
              const isActive = activeNotes.includes(key.note);
              return (
                <button key={key.note} data-note={key.note}
                  onMouseDown={() => playNote(key.note)} onMouseUp={() => stopNote(key.note)}
                  onMouseLeave={() => stopNote(key.note)}
                  onTouchStart={(e) => { e.preventDefault(); playNote(key.note); }} onTouchEnd={() => stopNote(key.note)}
                  className={cn("absolute bottom-0 border border-[var(--border)] rounded-b-md flex items-end justify-center pb-2 transition-all duration-75",
                    isActive ? "bg-[var(--piano-active-white)] shadow-inner" : "bg-[var(--piano-white-key)] hover:bg-[var(--piano-active-white)]/30"
                  )}
                  style={{ left: `${wIdx * 40}px`, width: 38, height: 168, zIndex: 1 }}
                >
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {key.note.startsWith("C") ? key.note : ""}
                  </span>
                </button>
              );
            })}
            {(() => {
              let wIdx = 0;
              return ALL_KEYS.map((key) => {
                if (!key.isBlack) { wIdx++; return null; }
                const isActive = activeNotes.includes(key.note);
                return (
                  <button key={key.note} data-note={key.note}
                    onMouseDown={(e) => { e.stopPropagation(); playNote(key.note); }}
                    onMouseUp={() => stopNote(key.note)} onMouseLeave={() => stopNote(key.note)}
                    onTouchStart={(e) => { e.preventDefault(); playNote(key.note); }} onTouchEnd={() => stopNote(key.note)}
                    className={cn("absolute top-0 rounded-b-md transition-all duration-75",
                      isActive ? "bg-[var(--piano-active-black)]" : "bg-[var(--piano-black-key)] hover:bg-zinc-700"
                    )}
                    style={{ left: `${(wIdx - 1) * 40 + 24}px`, width: 26, height: 104, zIndex: 2 }}
                  />
                );
              });
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ─── Controls bar ────────────────────────────────────────────────────
  const Controls = () => (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-5 p-4">
        <div className="flex items-center gap-2">
          <button onClick={() => dispatch(setVolume(volume === 0 ? 0.7 : 0))} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
            {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <Slider value={Math.round(volume * 100)} onChange={(v) => dispatch(setVolume(v / 100))} min={0} max={100} className="w-24" label="Volume" />
          <span className="w-8 text-xs font-mono text-[var(--foreground-muted)]">{Math.round(volume * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--foreground-muted)]">Octave</span>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => dispatch(shiftOctave(octaveShift - 1))} disabled={octaveShift <= -2}><ChevronLeft className="h-3 w-3" /></Button>
          <span className="w-6 text-center text-sm font-mono font-semibold">{octaveShift > 0 ? `+${octaveShift}` : octaveShift}</span>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => dispatch(shiftOctave(octaveShift + 1))} disabled={octaveShift >= 2}><ChevronRight className="h-3 w-3" /></Button>
        </div>
        <button onClick={() => dispatch(toggleSustain())}
          className={cn("rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
            sustainPedal ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}>
          Sustain (Space)
        </button>
        <InstrumentSelector />
        <div className="ml-auto">
          <Metronome />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Virtual Piano</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">88 keys · Keyboard · WebMIDI · 4 instruments</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={midiConnected ? "success" : "secondary"} className="gap-1.5">
            {midiConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {midiConnected ? "MIDI" : "No MIDI"}
          </Badge>
          {sustainPedal && <Badge variant="accent">Sustain ON</Badge>}
        </div>
      </div>

      <Controls />

      <Tabs defaultValue="play">
        <TabsList>
          <TabsTrigger value="play">🎹 Play</TabsTrigger>
          <TabsTrigger value="record">🔴 Record</TabsTrigger>
          <TabsTrigger value="falling">🎵 Falling Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="play" className="space-y-4">
          <PianoKeys />
        </TabsContent>

        <TabsContent value="record" className="space-y-4">
          <PianoKeys />
          <PianoRecorder
            onNotePlay={playNote}
            onNoteStop={stopNote}
          />
        </TabsContent>

        <TabsContent value="falling">
          <FallingNotes />
        </TabsContent>
      </Tabs>
    </div>
  );
}
