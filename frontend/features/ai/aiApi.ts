/**
 * AI Feature API
 * NOTE: All endpoints in this module return MOCKED data from the backend.
 * The actual OpenAI integration is not yet implemented server-side.
 * These endpoints exist for UI scaffolding and will be connected to real
 * AI when the backend implements the OpenAI service calls.
 */
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api/baseQuery";
import type { ApiResponse, AIAnalysis, AIRecommendation, SkillLevel } from "@/lib/api/types";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const aiApi = createApi({
  reducerPath: "aiApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // POST /api/ai/analyze-performance (mocked — returns canned analysis)
    analyzePerformance: builder.mutation<
      ApiResponse<AIAnalysis>,
      { accuracyPercentage: number; notesHit: number; notesMissed: number; songName: string }
    >({
      query: (body) => ({
        url: "/ai/analyze-performance",
        method: "POST",
        body,
      }),
    }),

    // GET /api/ai/recommendations?skillLevel= (mocked — returns canned recs)
    getRecommendations: builder.query<
      ApiResponse<AIRecommendation>,
      { skillLevel?: SkillLevel } | void
    >({
      query: (params) =>
        `/ai/recommendations${params?.skillLevel ? `?skillLevel=${params.skillLevel}` : ""}`,
    }),

    // POST /api/ai/composition-ideas (mocked — returns canned progressions)
    getCompositionIdeas: builder.mutation<
      ApiResponse<{ chordProgressions: string[]; melodyIdeas: string[] }>,
      { style?: string; mood?: string }
    >({
      query: (body) => ({
        url: "/ai/composition-ideas",
        method: "POST",
        body,
      }),
    }),

    // POST /api/ai/chat (mocked — returns hardcoded greeting if API key missing)
    chat: builder.mutation<
      ApiResponse<string>,
      { messages: ChatMessage[] }
    >({
      query: (body) => ({
        url: "/ai/chat",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useAnalyzePerformanceMutation,
  useGetRecommendationsQuery,
  useGetCompositionIdeasMutation,
  useChatMutation,
} = aiApi;
