import mongoose, { Schema } from 'mongoose'

const achievementSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], required: true },
    iconUrl: { type: String },
  },
  { timestamps: true }
)

export default mongoose.model('Achievement', achievementSchema)
