import { AuthService } from '../services/auth.service.js'
import { asyncHandler } from '../../../common/utils/async-handler.js'

export class AuthController {
  constructor() {
    this.authService = new AuthService()
  }

  register = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName } = req.body

    const result = await this.authService.register(email, password, firstName, lastName)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        tokens: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      },
    })
  })

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const result = await this.authService.login(email, password)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        tokens: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      },
    })
  })

  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body

    const tokens = await this.authService.refreshToken(refreshToken)

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    })
  })

  requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body

    const message = await this.authService.requestPasswordReset(email)

    res.status(200).json({
      success: true,
      message,
    })
  })

  resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body

    await this.authService.resetPassword(token, newPassword)

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    })
  })

  validateToken = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      })
    }

    const decoded = await this.authService.validateToken(token)

    res.status(200).json({
      success: true,
      data: decoded,
    })
  })
}
