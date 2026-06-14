import mongoose, { Schema } from 'mongoose';

const trackSchema = new Schema(
  {
    title: { type: String, required: true, index: true },
    artist: { type: String, required: true },
    audioUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: null },
    streamingUrl: { type: String, default: null },
    sheetMusicUrl: { type: String, default: null }, // URL PDF
    sheetMusicPages: { type: Number, default: 0 }, // số trang PDF
    durationSeconds: { type: Number, required: true },
    difficulty: { type: String, default: 'intermediate' },
    type: { type: String, enum: ['audio', 'video'], default: 'audio' },
    playCount: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Track', trackSchema);
