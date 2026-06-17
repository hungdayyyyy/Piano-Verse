import http, { type ApiResponse } from "@/services/http";
import { PIANO_URLS } from "./piano.urls";
import type { PianoSample, PianoConfig, MidiMapping } from "@/lib/api/types";

export interface SaveRecordingPayload {
  name: string;
  notes: Array<{ note: string; timestamp: number; duration: number }>;
  duration: number;
}

export interface PianoRecording {
  _id: string;
  userId: string;
  name: string;
  notes: Array<{ note: string; timestamp: number; duration: number }>;
  duration: number;
  createdAt: string;
}

const pianoService = {
  getSamples(): Promise<ApiResponse<PianoSample[]>> {
    return http.get<PianoSample[]>(PIANO_URLS.SAMPLES);
  },

  getConfig(): Promise<ApiResponse<PianoConfig>> {
    return http.get<PianoConfig>(PIANO_URLS.CONFIG);
  },

  getMidiMappings(): Promise<ApiResponse<MidiMapping>> {
    return http.get<MidiMapping>(PIANO_URLS.MIDI_MAPPINGS);
  },

  getSheetMusic(difficulty?: string): Promise<ApiResponse<unknown[]>> {
    const query = difficulty ? `?difficulty=${difficulty}` : "";
    return http.get<unknown[]>(`${PIANO_URLS.SHEET_MUSIC}${query}`);
  },

  saveRecording(payload: SaveRecordingPayload): Promise<ApiResponse<PianoRecording>> {
    return http.post<PianoRecording>(PIANO_URLS.RECORDINGS, payload);
  },

  getRecordings(): Promise<ApiResponse<PianoRecording[]>> {
    return http.get<PianoRecording[]>(PIANO_URLS.RECORDINGS);
  },
};

export default pianoService;
