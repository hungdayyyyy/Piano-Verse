import { z } from "zod";

// Mirrors backend updateProfileSchema:
// fullName 2-50, bio <=500, skillLevel enum, preferences, min 1 field
export const updateProfileSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name is too long")
      .optional(),
    bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
    skillLevel: z
      .enum(["beginner", "intermediate", "advanced", "expert"])
      .optional(),
    preferences: z
      .object({
        language: z.enum(["en", "vi", "es", "fr"]).optional(),
        theme: z.enum(["light", "dark"]).optional(),
        notifications: z.boolean().optional(),
        emailUpdates: z.boolean().optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided
      return (
        data.fullName !== undefined ||
        data.bio !== undefined ||
        data.skillLevel !== undefined ||
        data.preferences !== undefined
      );
    },
    { message: "At least one field must be provided" }
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Mirrors backend searchUsersSchema: query 1-100, limit 1-50
export const searchUsersSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.number().min(1).max(50).default(10),
});
