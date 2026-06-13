import { User } from '../models/user.model.js'

export class UserRepository {
  async findById(id) {
    return User.findById(id).where({ deletedAt: null })
  }

  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase(), deletedAt: null })
  }

  async findByEmailWithPassword(email) {
    return User.findOne({ email: email.toLowerCase(), deletedAt: null }).select('+password')
  }

  async create(userData) {
    const user = new User(userData)
    return user.save()
  }

  async update(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).where({ deletedAt: null })
  }

  async delete(id) {
    return User.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true })
  }

  async hardDelete(id) {
    const result = await User.findByIdAndDelete(id)
    return !!result
  }

  async findAll(skip = 0, limit = 20, filter = {}) {
    const query = { deletedAt: null, ...filter }
    const data = await User.find(query).skip(skip).limit(limit)
    const total = await User.countDocuments(query)
    return { data, total }
  }

  async search(query, limit = 10) {
    return User.find({
      deletedAt: null,
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    }).limit(limit)
  }

  async findByRole(role) {
    return User.find({ role, deletedAt: null })
  }

  async updatePassword(id, password) {
    const user = await User.findById(id)
    if (!user) return null
    user.password = password
    return user.save()
  }

  async setEmailVerificationToken(id, token, expiresIn) {
    const expiresAt = new Date(Date.now() + expiresIn)
    return User.findByIdAndUpdate(
      id,
      {
        emailVerificationToken: token,
        emailVerificationExpires: expiresAt,
      },
      { new: true },
    )
  }

  async verifyEmail(id) {
    return User.findByIdAndUpdate(
      id,
      {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
      { new: true },
    )
  }

  async setPasswordResetToken(id, token, expiresIn) {
    const expiresAt = new Date(Date.now() + expiresIn)
    return User.findByIdAndUpdate(
      id,
      {
        passwordResetToken: token,
        passwordResetExpires: expiresAt,
      },
      { new: true },
    )
  }

  async clearPasswordResetToken(id) {
    return User.findByIdAndUpdate(
      id,
      {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
      { new: true },
    )
  }

  async findByPasswordResetToken(token) {
    return User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
      deletedAt: null,
    })
  }
}
