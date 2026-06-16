// ─── Backend response envelope ────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

// ─── User / Auth ──────────────────────────────────────────────────────────────
export type UserRole = "user" | "teacher" | "admin";
export type UserStatus = "active" | "inactive" | "suspended";
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type Theme = "light" | "dark";
export type Language = "en" | "vi" | "es" | "fr";

export interface UserPreferences {
  language: Language;
  theme: Theme;
  notifications: boolean;
  emailUpdates: boolean;
}

export interface UserSocialLinks {
  spotify?: string;
  youtube?: string;
  instagram?: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  skillLevel: SkillLevel;
  totalPracticeMinutes: number;
  totalXP: number;
  currentStreak: number;
  lastPracticeDate?: string;
  preferences: UserPreferences;
  socialLinks: UserSocialLinks;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface UserStatistics {
  totalPracticeMinutes: number;
  totalXP: number;
  currentStreak: number;
  level: number;
  achievements: unknown[];
  courses_completed: number;
}

// ─── Practice ─────────────────────────────────────────────────────────────────
export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

export interface RecordedNote {
  note: string;
  timestamp: number;
  duration: number;
}

export interface PracticeSession {
  _id: string;
  userId: string;
  songName: string;
  difficulty: Difficulty;
  durationSeconds: number;
  notesHit: number;
  notesMissed: number;
  accuracyPercentage: number;
  score: number;
  recordedNotes: RecordedNote[];
  createdAt: string;
  updatedAt: string;
}

export interface PracticeStats {
  totalSessions: number;
  totalMinutes: number;
  avgAccuracy: number;
  lastSession?: PracticeSession;
}

export interface PracticeTrendPoint {
  date: string;
  sessions: number;
  avgAccuracy: number;
  totalMinutes: number;
}

// ─── Streaming / Tracks ───────────────────────────────────────────────────────
export type TrackType = "audio" | "video";

export interface Track {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  thumbnailUrl?: string;
  streamingUrl?: string;
  sheetMusicUrl?: string;
  durationSeconds: number;
  difficulty: Difficulty;
  type: TrackType;
  playCount: number;
  tags: string[];
  createdAt: string;
}

// ─── Piano ────────────────────────────────────────────────────────────────────
export interface PianoSample {
  note: string;
  url: string;
}

export interface PianoConfig {
  octaves: number[];
  startNote: string;
  endNote: string;
  keyLayout: string[];
}

export interface MidiMapping {
  [midiNumber: string]: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalCourses: number;
  totalSessions: number;
}

// ─── Courses (mocked/stub backend) ────────────────────────────────────────────
export interface Course {
  _id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  instructorName: string;
  durationMinutes: number;
  coverImage?: string;
  rating: number;
  enrollmentCount: number;
  lessonsCount: number;
  price: number;
  isPublished: boolean;
}

// ─── AI (mocked/stub backend) ─────────────────────────────────────────────────
export interface AIAnalysis {
  accuracy: number;
  timing: string;
  suggestions: string[];
  strengths: string[];
  overallScore: number;
}

export interface AIRecommendation {
  songs: Array<{ title: string; difficulty: string; reason: string }>;
  exercises: Array<{ name: string; description: string }>;
}
