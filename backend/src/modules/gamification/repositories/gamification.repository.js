import { BaseRepository } from '../../../common/repositories/base.repository.js'
import AchievementModel from '../models/achievement.model.js'
import UserAchievementModel from '../models/user-achievement.model.js'

export class AchievementRepository extends BaseRepository {
  constructor() {
    super(AchievementModel)
  }

  async getUserAchievements(userId) {
    return UserAchievementModel.find({ userId })
      .populate('achievementId')
      .sort({ unlockedAt: -1 })
      .lean()
  }

  async unlockAchievement(userId, achievementId) {
    return UserAchievementModel.create({
      userId,
      achievementId,
      unlockedAt: new Date(),
    })
  }

  async hasUnlockedAchievement(userId, achievementId) {
    const result = await UserAchievementModel.findOne({ userId, achievementId })
    return !!result
  }

  async getLeaderboard(limit = 100) {
    const UserModel = require('../../users/models/user.model.js').User
    return UserModel.find()
      .select('username totalXP currentStreak')
      .sort({ totalXP: -1 })
      .limit(limit)
      .lean()
  }

  async updateUserXP(userId, xpGain) {
    const UserModel = require('../../users/models/user.model.js').User
    await UserModel.findByIdAndUpdate(userId, { $inc: { totalXP: xpGain } })
  }

  async getAchievementsByRarity(rarity) {
    return this.model.find({ rarity }).lean()
  }
}
