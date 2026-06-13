import { BaseRepository } from '../../../common/repositories/base.repository.js'
import PracticeSessionModel from '../models/practice-session.model.js'

export class PracticeRepository extends BaseRepository {
  constructor() {
    super(PracticeSessionModel)
  }

  async getUserSessions(userId, limit = 10) {
    return this.model
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  async getUserStats(userId) {
    const sessions = await this.model.find({ userId }).lean()
    const totalSessions = sessions.length
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 60
    const avgAccuracy =
      sessions.reduce((sum, s) => sum + (s.accuracyPercentage || 0), 0) / sessions.length || 0

    return {
      totalSessions,
      totalMinutes: Math.round(totalMinutes),
      avgAccuracy: Math.round(avgAccuracy),
      lastSession: sessions[0]?.createdAt,
    }
  }

  async getTopPerformances(userId, limit = 5) {
    return this.model
      .find({ userId })
      .sort({ score: -1 })
      .limit(limit)
      .lean()
  }

  async getPracticeTrend(userId, days = 7) {
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    return this.model
      .find({
        userId,
        createdAt: { $gte: dateFrom },
      })
      .sort({ createdAt: 1 })
      .lean()
  }
}
