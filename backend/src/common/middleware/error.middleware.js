import { config } from '../../config/environment.js'

export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message)
    this.message = message
    this.statusCode = statusCode
    this.code = code
    this.name = 'AppError'
  }
}

export const ErrorHandler = (err, req, res, next) => {
  const isDevelopment = config.NODE_ENV === 'development'

  let statusCode = 500
  let message = 'Internal Server Error'
  let code = 'INTERNAL_ERROR'

  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
    code = err.code || 'APP_ERROR'
  } else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400
    message = 'Invalid JSON'
    code = 'INVALID_JSON'
  }

  console.error(`[${code}] ${message}`, isDevelopment ? err : '')

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(isDevelopment && { stack: err.stack }),
  })
}

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
