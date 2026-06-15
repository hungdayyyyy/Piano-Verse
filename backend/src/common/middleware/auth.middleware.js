import jwt from 'jsonwebtoken'
import { config } from '../../config/environment.js'
import { AppError } from './error.middleware.js'

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      throw new AppError('No authentication token provided', 401, 'NO_TOKEN')
    }

    const decoded = jwt.verify(token, config.JWT_SECRET)

    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token has expired', 401, 'TOKEN_EXPIRED')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN')
    }
    throw error
  }
}

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS')
    }

    next()
  }
}

export const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED')
    }

    const hasPermission = permissions.some((perm) =>
      req.user.permissions.includes(perm),
    )

    if (!hasPermission) {
      throw new AppError('Missing required permission', 403, 'MISSING_PERMISSION')
    }

    next()
  }
}
