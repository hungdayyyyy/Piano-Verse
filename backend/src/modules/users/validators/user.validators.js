import Joi from 'joi'

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(50),
  bio: Joi.string().max(500),
  skillLevel: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert'),
  preferences: Joi.object({
    language: Joi.string().valid('en', 'vi', 'es', 'fr'),
    theme: Joi.string().valid('light', 'dark'),
    notifications: Joi.boolean(),
    emailUpdates: Joi.boolean(),
  }),
}).min(1)

export const searchUsersSchema = Joi.object({
  query: Joi.string().required().min(1).max(100),
  limit: Joi.number().integer().min(1).max(50).default(10),
})

export const deleteAccountSchema = Joi.object({
  password: Joi.string().required(),
})
