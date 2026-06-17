export const PRACTICE_URLS = {
  SESSIONS: "/practice/sessions",
  SESSION: (id: string) => `/practice/sessions/${id}`,
  STATS: "/practice/stats",
  TREND: "/practice/trend",
  TOP_PERFORMANCES: "/practice/top-performances",
} as const;
