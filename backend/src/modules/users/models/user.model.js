import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'teacher', 'admin'],
      default: 'user',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    totalPracticeMinutes: {
      type: Number,
      default: 0,
      index: true,
    },
    totalXP: {
      type: Number,
      default: 0,
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    lastPracticeDate: {
      type: Date,
      default: null,
    },
    preferences: {
      language: {
        type: String,
        default: 'en',
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'dark',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      emailUpdates: {
        type: Boolean,
        default: true,
      },
    },
    socialLinks: {
      spotify: String,
      youtube: String,
      instagram: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password
        delete ret.emailVerificationToken
        delete ret.passwordResetToken
      },
    },
  },
)

// Soft delete index
userSchema.index({ deletedAt: 1 })

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

// Query helper for excluding soft deleted
userSchema.query.notDeleted = function () {
  return this.where({ deletedAt: null })
}

export const User = model('User', userSchema)
