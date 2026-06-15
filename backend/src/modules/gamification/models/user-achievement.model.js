import mongoose, { Schema } from 'mongoose'

const userAchievementSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.model('UserAchievement', userAchievementSchema)
