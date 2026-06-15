import { redisClient } from '../../../config/redis.js'

export class GamificationService {
  async getUserAchievements(userId) {
    const cacheKey = `user:achievements:${userId}`
    const cached = await redisClient.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const achievements = []
    await redisClient.setex(cacheKey, 3600, JSON.stringify(achievements))
    return achievements
  }

  async unlockAchievement(userId, achievementId) {
    const cacheKey = `user:achievements:${userId}`
    await redisClient.del(cacheKey)
    return { success: true }
  }

  async getUserLeaderboard(limit = 10) {
    const cacheKey = `leaderboard:global:${limit}`
    const cached = await redisClient.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const leaderboard = []
    await redisClient.setex(cacheKey, 3600, JSON.stringify(leaderboard))
    return leaderboard
  }

  async addXP(userId, amount) {
    const cacheKey = `user:xp:${userId}`
    await redisClient.del(cacheKey)
    return { xp_gained: amount, new_total: 0 }
  }

  async updateStreak(userId) {
    const cacheKey = `user:streak:${userId}`
    await redisClient.del(cacheKey)
    return { streak: 0 }
  }
}
