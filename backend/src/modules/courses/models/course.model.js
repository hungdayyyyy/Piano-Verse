import mongoose, { Schema } from 'mongoose'

const courseSchema = new Schema(
  {
    title: { type: String, required: true, index: true },
    description: { type: String },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    instructorId: { type: String, required: true },
    instructorName: { type: String },
    durationMinutes: { type: Number },
    coverImage: { type: String },
    rating: { type: Number, default: 0 },
    enrollmentCount: { type: Number, default: 0 },
    lessonsCount: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  },
  { timestamps: true }
)

export default mongoose.model('Course', courseSchema)
