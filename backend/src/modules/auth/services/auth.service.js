import jwt from 'jsonwebtoken'
import { config } from '../../../config/environment.js'
import { UserRepository } from '../../users/repositories/user.repository.js'
import { AppError } from '../../../common/middleware/error.middleware.js'

export class AuthService {
  constructor() {
    this.userRepository = new UserRepository()
  }

  /**
   * @param {string} email
   * @param {string} password
   * @param {string} firstName
   * @param {string} lastName
   * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>}
   */
  async register(email, password, firstName, lastName) {
    const existingUser = await this.userRepository.findByEmail(email)
    if (existingUser) {
      throw new AppError('Email already registered', 400, 'EMAIL_EXISTS')
    }

    const user = await this.userRepository.create({
      email,
      password,
      firstName,
      lastName,
      role: 'user',
    })

    const accessToken = this.generateAccessToken(user)
    const refreshToken = this.generateRefreshToken(user)

    return {
      user: user.toJSON?.() || user,
      accessToken,
      refreshToken,
    }
  }

  /**
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>}
   */
  async login(email, password) {
    const user = await this.userRepository.findByEmailWithPassword(email)
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
    }

    if (user.status !== 'active') {
      throw new AppError('Account is not active', 403, 'ACCOUNT_INACTIVE')
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
    }

    const accessToken = this.generateAccessToken(user)
    const refreshToken = this.generateRefreshToken(user)

    return {
      user: user.toJSON?.() || user,
      accessToken,
      refreshToken,
    }
  }

  /**
   * @param {string} token
   * @returns {Promise<{accessToken: string, refreshToken: string}>}
   */
  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET)
      const user = await this.userRepository.findById(decoded.id)
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND')
      }

      const accessToken = this.generateAccessToken(user)
      const refreshToken = this.generateRefreshToken(user)

      return { accessToken, refreshToken }
    } catch (error) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN')
    }
  }

  /**
   * @param {string} token
   * @returns {Promise<object>}
   */
  async validateToken(token) {
    try {
      return jwt.verify(token, config.JWT_SECRET)
    } catch (error) {
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN')
    }
  }

  /**
   * @param {object} user
   * @returns {string}
   */
  generateAccessToken(user) {
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: [],
    }

    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRY,
    })
  }

  /**
   * @param {object} user
   * @returns {string}
   */
  generateRefreshToken(user) {
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: [],
    }

    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRY,
    })
  }

  /**
   * @param {string} email
   * @returns {Promise<string>}
   */
  async requestPasswordReset(email) {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      return 'If an account with this email exists, a password reset link has been sent'
    }

    const resetToken = jwt.sign(
      { id: user._id, type: 'password-reset' },
      config.JWT_SECRET,
      { expiresIn: '1h' },
    )

    await this.userRepository.setPasswordResetToken(user._id.toString(), resetToken, 3600000)

    return 'Password reset link sent to your email'
  }

  /**
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise<void>}
   */
  async resetPassword(token, newPassword) {
    try {
      jwt.verify(token, config.JWT_SECRET)
    } catch {
      throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN')
    }

    const user = await this.userRepository.findByPasswordResetToken(token)
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN')
    }

    await this.userRepository.updatePassword(user._id.toString(), newPassword)
    await this.userRepository.clearPasswordResetToken(user._id.toString())
  }
}
