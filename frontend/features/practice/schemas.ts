import { z } from "zod";

// Backend has no Joi schema for practice sessions — authored from controller logic
export const createSessionSchema = z.object({
  songName: z
    .string()
    .min(1, "Song name is required")
    .max(200, "Song name is too long"),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  durationSeconds: z.number().min(1).max(86400),
  notesHit: z.number().min(0),
  notesMissed: z.number().min(0),
  accuracyPercentage: z.number().min(0).max(100),
  recordedNotes: z
    .array(
      z.object({
        note: z.string(),
        timestamp: z.number(),
        duration: z.number(),
      })
    )
    .optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
