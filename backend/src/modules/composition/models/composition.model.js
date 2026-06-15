import mongoose, { Schema } from 'mongoose'

const compositionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    musicData: { type: String, required: true },
    durationSeconds: { type: Number },
    isPublic: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.model('Composition', compositionSchema)
