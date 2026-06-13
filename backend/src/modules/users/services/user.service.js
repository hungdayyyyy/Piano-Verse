import { UserRepository } from '../repositories/user.repository.js'
import { redisClient } from '../../../config/redis.js'

export class UserService {
  constructor() {
    this.userRepository = new UserRepository()
  }

  async getUserProfile(userId) {
    const cacheKey = `user:profile:${userId}`
    const cached = await redisClient.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const user = await this.userRepository.findById(userId)
    if (!user) throw new Error('User not found')

    await redisClient.setex(cacheKey, 3600, JSON.stringify(user))
    return user
  }

  async updateUserProfile(userId, data) {
    const user = await this.userRepository.update(userId, data)

    const cacheKey = `user:profile:${userId}`
    await redisClient.del(cacheKey)

    return user
  }

  async getUserStatistics(userId) {
    return {
      totalPracticeMinutes: 0,
      totalXP: 0,
      currentStreak: 0,
      level: 1,
      achievements: [],
      courses_completed: 0,
    }
  }

  async deleteUser(userId) {
    const cacheKey = `user:profile:${userId}`
    await redisClient.del(cacheKey)
    return this.userRepository.softDelete(userId)
  }

  async searchUsers(query, limit = 10) {
    return this.userRepository.search(query, limit)
  }
}
