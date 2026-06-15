import { AppError } from './error.middleware.js'

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : req.body
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    })

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }))

      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR')
    }

    if (source === 'query') {
      req.query = value
    } else {
      req.body = value
    }
    next()
  }
}

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    })

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }))

      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR')
    }

    req.body = value
    next()
  }
}
