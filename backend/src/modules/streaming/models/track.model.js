import mongoose, { Schema } from 'mongoose'

const trackSchema = new Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    audioUrl: { type: String, required: true },
    durationSeconds: { type: Number, required: true },
    difficulty: { type: String, default: 'intermediate' },
    playCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.model('Track', trackSchema)
