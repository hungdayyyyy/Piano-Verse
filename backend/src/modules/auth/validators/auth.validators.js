import Joi from 'joi'

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
})

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
})

export const requestPasswordResetSchema = Joi.object({
  email: Joi.string().email().required(),
})
