"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type Instrument = "piano" | "organ" | "synth" | "strings";

interface PianoState {
  activeNotes: string[];
  volume: number;
  octaveShift: number;
  instrument: Instrument;
  sustainPedal: boolean;
  isMidiConnected: boolean;
  midiDeviceName: string | null;
}

const initialState: PianoState = {
  activeNotes: [],
  volume: 0.7,
  octaveShift: 0,
  instrument: "piano",
  sustainPedal: false,
  isMidiConnected: false,
  midiDeviceName: null,
};

const pianoSlice = createSlice({
  name: "piano",
  initialState,
  reducers: {
    pressNote(state, action: PayloadAction<string>) {
      if (!state.activeNotes.includes(action.payload)) {
        state.activeNotes.push(action.payload);
      }
    },
    releaseNote(state, action: PayloadAction<string>) {
      if (!state.sustainPedal) {
        state.activeNotes = state.activeNotes.filter(
          (n) => n !== action.payload
        );
      }
    },
    releaseAll(state) {
      state.activeNotes = [];
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
    shiftOctave(state, action: PayloadAction<number>) {
      // Allow -2 to +2 octave shift
      state.octaveShift = Math.max(-2, Math.min(2, action.payload));
    },
    setInstrument(state, action: PayloadAction<Instrument>) {
      state.instrument = action.payload;
    },
    toggleSustain(state) {
      state.sustainPedal = !state.sustainPedal;
      if (!state.sustainPedal) {
        state.activeNotes = [];
      }
    },
    setMidiConnected(
      state,
      action: PayloadAction<{ connected: boolean; deviceName?: string }>
    ) {
      state.isMidiConnected = action.payload.connected;
      state.midiDeviceName = action.payload.deviceName ?? null;
    },
  },
});

export const {
  pressNote,
  releaseNote,
  releaseAll,
  setVolume,
  shiftOctave,
  setInstrument,
  toggleSustain,
  setMidiConnected,
} = pianoSlice.actions;

export default pianoSlice.reducer;

export const selectActiveNotes = (s: { piano: PianoState }) =>
  s.piano.activeNotes;
export const selectPianoVolume = (s: { piano: PianoState }) => s.piano.volume;
export const selectOctaveShift = (s: { piano: PianoState }) =>
  s.piano.octaveShift;
export const selectInstrument = (s: { piano: PianoState }) =>
  s.piano.instrument;
export const selectSustainPedal = (s: { piano: PianoState }) =>
  s.piano.sustainPedal;
export const selectMidiConnected = (s: { piano: PianoState }) =>
  s.piano.isMidiConnected;
