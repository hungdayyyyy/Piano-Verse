import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api/baseQuery";
import type {
  ApiResponse,
  PianoSample,
  PianoConfig,
  MidiMapping,
} from "@/lib/api/types";

export interface PianoRecording {
  _id: string;
  userId: string;
  name: string;
  notes: Array<{ note: string; timestamp: number; duration: number }>;
  duration: number;
  createdAt: string;
}

export const pianoApi = createApi({
  reducerPath: "pianoApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // GET /api/piano/samples (Redis-cached server-side)
    getSamples: builder.query<ApiResponse<PianoSample[]>, void>({
      query: () => "/piano/samples",
    }),

    // GET /api/piano/config (static config object)
    getConfig: builder.query<ApiResponse<PianoConfig>, void>({
      query: () => "/piano/config",
    }),

    // GET /api/piano/midi-mappings (computed MIDI→note map, Redis-cached)
    getMidiMappings: builder.query<ApiResponse<MidiMapping>, void>({
      query: () => "/piano/midi-mappings",
    }),

    // GET /api/piano/sheet-music?difficulty= (currently returns [])
    getSheetMusic: builder.query<
      ApiResponse<unknown[]>,
      { difficulty?: string } | void
    >({
      query: (params) =>
        `/piano/sheet-music${params?.difficulty ? `?difficulty=${params.difficulty}` : ""}`,
    }),

    // POST /api/piano/recordings (auth required; writes but list returns [])
    saveRecording: builder.mutation<
      ApiResponse<PianoRecording>,
      {
        name: string;
        notes: Array<{ note: string; timestamp: number; duration: number }>;
        duration: number;
      }
    >({
      query: (body) => ({
        url: "/piano/recordings",
        method: "POST",
        body,
      }),
    }),

    // GET /api/piano/recordings (auth required; currently returns [])
    getRecordings: builder.query<ApiResponse<PianoRecording[]>, void>({
      query: () => "/piano/recordings",
    }),
  }),
});

export const {
  useGetSamplesQuery,
  useGetConfigQuery,
  useGetMidiMappingsQuery,
  useGetSheetMusicQuery,
  useSaveRecordingMutation,
  useGetRecordingsQuery,
} = pianoApi;
