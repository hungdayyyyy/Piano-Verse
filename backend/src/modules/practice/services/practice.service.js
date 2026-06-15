import { PracticeRepository } from '../repositories/practice.repository.js'

export class PracticeService {
  constructor() {
    this.practiceRepository = new PracticeRepository()
  }

  async recordSession(data) {
    return this.practiceRepository.create(data)
  }

  async getUserSessions(userId, limit = 10) {
    return this.practiceRepository.getUserSessions(userId, limit)
  }

  async getSessionDetails(sessionId) {
    return this.practiceRepository.findById(sessionId)
  }

  async getUserStats(userId) {
    return this.practiceRepository.getUserStats(userId)
  }

  async getPracticeTrend(userId, days = 7) {
    return this.practiceRepository.getPracticeTrend(userId, days)
  }

  async getTopPerformances(userId, limit = 5) {
    return this.practiceRepository.getTopPerformances(userId, limit)
  }

  async createPracticeSession(userId, data) {
    return {
      id: `session-${Date.now()}`,
      user_id: userId,
      song_name: data.song_name,
      difficulty: data.difficulty,
      duration_seconds: data.duration_seconds,
      notes_hit: data.notes_hit || 0,
      notes_missed: data.notes_missed || 0,
      accuracy_percentage: data.accuracy_percentage || 0,
      score: data.score || 0,
      created_at: new Date(),
    }
  }

  async getPracticeSessions(userId) {
    return []
  }

  async getPracticeStatistics(userId) {
    return {
      total_sessions: 0,
      total_practice_minutes: 0,
      average_accuracy: 85.5,
      current_streak: 0,
    }
  }
}
