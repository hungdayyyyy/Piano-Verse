import http, { type ApiResponse } from "@/services/http";
import { AI_URLS } from "./ai.urls";
import type { AIAnalysis, AIRecommendation, SkillLevel } from "@/lib/api/types";
import type { ChatMessage } from "@/features/ai/aiApi";

const aiService = {
  analyzePerformance(payload: {
    accuracyPercentage: number;
    notesHit: number;
    notesMissed: number;
    songName: string;
  }): Promise<ApiResponse<AIAnalysis>> {
    return http.post<AIAnalysis>(AI_URLS.ANALYZE_PERFORMANCE, payload);
  },

  getRecommendations(skillLevel?: SkillLevel): Promise<ApiResponse<AIRecommendation>> {
    const q = skillLevel ? `?skillLevel=${skillLevel}` : "";
    return http.get<AIRecommendation>(`${AI_URLS.RECOMMENDATIONS}${q}`);
  },

  getCompositionIdeas(payload: {
    style?: string;
    mood?: string;
  }): Promise<ApiResponse<{ chordProgressions: string[]; melodyIdeas: string[] }>> {
    return http.post(AI_URLS.COMPOSITION_IDEAS, payload);
  },

  chat(messages: ChatMessage[]): Promise<ApiResponse<string>> {
    return http.post<string>(AI_URLS.CHAT, { messages });
  },
};

export default aiService;
