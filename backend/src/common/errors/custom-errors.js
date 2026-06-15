/**
 * @class AppError
 * @extends Error
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code
   */
  constructor(message, statusCode, code) {
    super(message)
    this.message = message
    this.statusCode = statusCode
    this.code = code
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

/**
 * @class ValidationError
 * @extends AppError
 */
export class ValidationError extends AppError {
  constructor(message, code = 'VALIDATION_ERROR') {
    super(message, 400, code)
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * @class NotFoundError
 * @extends AppError
 */
export class NotFoundError extends AppError {
  constructor(resource, code = 'NOT_FOUND') {
    super(`${resource} not found`, 404, code)
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * @class UnauthorizedError
 * @extends AppError
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(message, 401, code)
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

/**
 * @class ForbiddenError
 * @extends AppError
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(message, 403, code)
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}

/**
 * @class ConflictError
 * @extends AppError
 */
export class ConflictError extends AppError {
  constructor(message, code = 'CONFLICT') {
    super(message, 409, code)
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

/**
 * @class InternalServerError
 * @extends AppError
 */
export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    super(message, 500, code)
    Object.setPrototypeOf(this, InternalServerError.prototype)
  }
}

/**
 * @class BadRequestError
 * @extends AppError
 */
export class BadRequestError extends AppError {
  constructor(message, code = 'BAD_REQUEST') {
    super(message, 400, code)
    Object.setPrototypeOf(this, BadRequestError.prototype)
  }
}
