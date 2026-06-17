import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api/baseQuery";
import type {
  ApiResponse,
  PracticeSession,
  PracticeStats,
  PracticeTrendPoint,
  RecordedNote,
  Difficulty,
} from "@/lib/api/types";

export interface CreateSessionInput {
  songName: string;
  difficulty: Difficulty;
  durationSeconds: number;
  notesHit: number;
  notesMissed: number;
  accuracyPercentage: number;
  recordedNotes?: RecordedNote[];
}

export const practiceApi = createApi({
  reducerPath: "practiceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Sessions", "Stats"],
  endpoints: (builder) => ({
    // POST /api/practice/sessions
    createSession: builder.mutation<
      ApiResponse<PracticeSession>,
      CreateSessionInput
    >({
      query: (body) => ({
        url: "/practice/sessions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Sessions", "Stats"],
    }),

    // GET /api/practice/sessions?limit=
    getSessions: builder.query<
      ApiResponse<PracticeSession[]>,
      { limit?: number } | void
    >({
      query: (params) =>
        `/practice/sessions${params?.limit ? `?limit=${params.limit}` : ""}`,
      providesTags: ["Sessions"],
    }),

    // GET /api/practice/sessions/:sessionId
    getSession: builder.query<ApiResponse<PracticeSession>, string>({
      query: (sessionId) => `/practice/sessions/${sessionId}`,
    }),

    // GET /api/practice/stats
    getStats: builder.query<ApiResponse<PracticeStats>, void>({
      query: () => "/practice/stats",
      providesTags: ["Stats"],
    }),

    // GET /api/practice/trend?days=
    getTrend: builder.query<
      ApiResponse<PracticeTrendPoint[]>,
      { days?: number } | void
    >({
      query: (params) =>
        `/practice/trend${params?.days ? `?days=${params.days}` : ""}`,
    }),

    // GET /api/practice/top-performances?limit=
    getTopPerformances: builder.query<
      ApiResponse<PracticeSession[]>,
      { limit?: number } | void
    >({
      query: (params) =>
        `/practice/top-performances${params?.limit ? `?limit=${params.limit}` : ""}`,
    }),
  }),
});

export const {
  useCreateSessionMutation,
  useGetSessionsQuery,
  useGetSessionQuery,
  useGetStatsQuery,
  useGetTrendQuery,
  useGetTopPerformancesQuery,
} = practiceApi;
