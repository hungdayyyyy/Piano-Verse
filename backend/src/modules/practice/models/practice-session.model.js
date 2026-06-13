import mongoose, { Schema } from 'mongoose'

const practiceSessionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    songName: { type: String, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    durationSeconds: { type: Number, required: true },
    notesHit: { type: Number, required: true, default: 0 },
    notesMissed: { type: Number, required: true, default: 0 },
    accuracyPercentage: { type: Number, required: true, default: 0 },
    score: { type: Number, required: true, default: 0 },
    recordedNotes: [
      {
        note: String,
        timestamp: Number,
        duration: Number,
      },
    ],
  },
  { timestamps: true }
)

export default mongoose.model('PracticeSession', practiceSessionSchema)
