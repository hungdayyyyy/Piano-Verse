"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, StopCircle, RotateCcw } from "lucide-react";

interface PlayedNote {
  note: string;
  midiNumber: number;
  timestamp: number;
  duration: number;
}

interface PracticeRecorderProps {
  expectedNotes?: string[];
  songName?: string;
  onRecordingComplete?: (data: {
    accuracy: number;
    notesHit: number;
    notesMissed: number;
    duration: number;
  }) => void;
}

export function PracticeRecorder({
  expectedNotes = [],
  songName = "Practice Session",
  onRecordingComplete,
}: PracticeRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [playedNotes, setPlayedNotes] = useState<PlayedNote[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState(0);
  const midiAccessRef = useRef<MIDIAccess | null>(null);

  // Initialize MIDI input
  useEffect(() => {
    if (!navigator.requestMIDIAccess) return;

    navigator.requestMIDIAccess().then(
      (midiAccess) => {
        midiAccessRef.current = midiAccess;
        const inputs = midiAccess.inputs.values();
        for (const input of inputs) {
          input.addEventListener("midimessage", handleMIDIMessage);
        }
      },
      (err) => {
        console.error("[v0] MIDI access denied:", err);
      },
    );

    return () => {
      if (midiAccessRef.current) {
        const inputs = midiAccessRef.current.inputs.values();
        for (const input of inputs) {
          input.removeEventListener("midimessage", handleMIDIMessage);
        }
      }
    };
  }, []);

  const handleMIDIMessage = (event: MIDIMessageEvent) => {
    if (!isRecording || !startTime) return;

    const data = event.data;
    if (!data) return;

    const status = data[0];
    const data1 = data[1];
    const noteOn = status === 0x90 && data1 !== 0;
    const noteOff = status === 0x80 || (status === 0x90 && data1 === 0);

    if (noteOn) {
      const midiNote = data1;
      const noteName = getMIDINoteName(midiNote);
      const timestamp = performance.now() - startTime;

      const newNote: PlayedNote = {
        note: noteName,
        midiNumber: midiNote,
        timestamp: Math.round(timestamp),
        duration: 0,
      };

      setPlayedNotes((prev) => [...prev, newNote]);
    }
  };

  const getMIDINoteName = (midiNumber: number): string => {
    const notes = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    const octave = Math.floor(midiNumber / 12) - 1;
    const noteIndex = midiNumber % 12;
    return `${notes[noteIndex]}${octave}`;
  };

  const calculateAccuracy = () => {
    if (expectedNotes.length === 0) return 0;

    let matches = 0;
    for (const expectedNote of expectedNotes) {
      if (playedNotes.some((pn) => pn.note === expectedNote)) {
        matches++;
      }
    }

    return Math.round((matches / expectedNotes.length) * 100);
  };

  const startRecording = () => {
    setIsRecording(true);
    setPlayedNotes([]);
    setStartTime(performance.now());
  };

  const stopRecording = () => {
    setIsRecording(false);
    const acc = calculateAccuracy();
    setAccuracy(acc);

    if (onRecordingComplete && startTime) {
      const duration = Math.round((performance.now() - startTime) / 1000);
      const notesHit = playedNotes.length;
      const notesMissed = Math.max(0, expectedNotes.length - notesHit);

      onRecordingComplete({
        accuracy: acc,
        notesHit,
        notesMissed,
        duration,
      });
    }
  };

  const resetRecording = () => {
    setIsRecording(false);
    setPlayedNotes([]);
    setStartTime(null);
    setAccuracy(0);
  };

  const elapsedTime = startTime
    ? Math.round((performance.now() - startTime) / 1000)
    : 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{songName}</h3>
        <div className="text-2xl font-bold text-primary">{elapsedTime}s</div>
      </div>

      {/* Recording Info */}
      {playedNotes.length > 0 && (
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Notes Hit</p>
            <p className="text-xl font-bold text-foreground">
              {playedNotes.length}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Expected</p>
            <p className="text-xl font-bold text-foreground">
              {expectedNotes.length}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Accuracy</p>
            <p
              className={`text-xl font-bold ${accuracy >= 80 ? "text-green-500" : accuracy >= 60 ? "text-yellow-500" : "text-red-500"}`}
            >
              {accuracy}%
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!isRecording ? (
          <>
            <button
              type="button"
              onClick={startRecording}
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition font-medium flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Recording
            </button>
            {playedNotes.length > 0 && (
              <button
                aria-label="Reset recording"
                title="Reset recording"
                type="button"
                onClick={resetRecording}
                className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-card transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex-1 bg-red-600 text-red-foreground px-4 py-2 rounded-lg hover:opacity-90 transition font-medium flex items-center justify-center gap-2"
          >
            <StopCircle className="w-4 h-4" />
            Stop Recording
          </button>
        )}
      </div>

      {/* Played Notes */}
      {playedNotes.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-foreground mb-2">
            Notes Played:
          </p>
          <div className="flex flex-wrap gap-2">
            {playedNotes.map((note, idx) => (
              <span
                key={idx}
                className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium"
              >
                {note.note}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
