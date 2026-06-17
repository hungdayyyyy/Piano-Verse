import http, { type ApiResponse } from "@/services/http";
import { PRACTICE_URLS } from "./practice.urls";
import type {
  PracticeSession,
  PracticeStats,
  PracticeTrendPoint,
  Difficulty,
  RecordedNote,
} from "@/lib/api/types";

export interface CreateSessionPayload {
  songName: string;
  difficulty: Difficulty;
  durationSeconds: number;
  notesHit: number;
  notesMissed: number;
  accuracyPercentage: number;
  recordedNotes?: RecordedNote[];
}

const practiceService = {
  createSession(payload: CreateSessionPayload): Promise<ApiResponse<PracticeSession>> {
    return http.post<PracticeSession>(PRACTICE_URLS.SESSIONS, payload);
  },

  getSessions(limit = 20): Promise<ApiResponse<PracticeSession[]>> {
    return http.get<PracticeSession[]>(`${PRACTICE_URLS.SESSIONS}?limit=${limit}`);
  },

  getSession(sessionId: string): Promise<ApiResponse<PracticeSession>> {
    return http.get<PracticeSession>(PRACTICE_URLS.SESSION(sessionId));
  },

  getStats(): Promise<ApiResponse<PracticeStats>> {
    return http.get<PracticeStats>(PRACTICE_URLS.STATS);
  },

  getTrend(days = 7): Promise<ApiResponse<PracticeTrendPoint[]>> {
    return http.get<PracticeTrendPoint[]>(`${PRACTICE_URLS.TREND}?days=${days}`);
  },

  getTopPerformances(limit = 5): Promise<ApiResponse<PracticeSession[]>> {
    return http.get<PracticeSession[]>(`${PRACTICE_URLS.TOP_PERFORMANCES}?limit=${limit}`);
  },
};

export default practiceService;
