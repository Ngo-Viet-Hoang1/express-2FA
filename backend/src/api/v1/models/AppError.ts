import createError from 'http-errors'
import type { ErrorCategory, ErrorSeverity } from '../types/error.js'

export class AppError extends Error {
  public statusCode: number
  public errorStatus: string
  public isOperational: boolean
  public category?: ErrorCategory
  public severity?: ErrorSeverity
  public context?: Record<string, unknown>

  constructor(
    message: string,
    statusCode: number,
    category?: ErrorCategory,
    severity?: ErrorSeverity,
    context?: Record<string, unknown>,
  ) {
    super(message)

    this.name = this.constructor.name
    this.statusCode = statusCode
    this.errorStatus = statusCode >= 500 ? 'error' : 'fail'
    this.isOperational = true
    this.category = category
    this.severity = severity
    this.context = context

    Error.captureStackTrace(this, this.constructor)
  }
}

export const ErrorTypes = {
  VALIDATION_ERROR: (
    message: string = 'Validation error',
  ): createError.HttpError => createError.BadRequest(message),
  UNAUTHORIZED: (message: string = 'Unauthorized'): createError.HttpError =>
    createError.Unauthorized(message),
  FORBIDDEN: (message: string = 'Forbidden'): createError.HttpError =>
    createError.Forbidden(message),
  NOT_FOUND: (message: string = 'Resource not found'): createError.HttpError =>
    createError.NotFound(message),
  CONFLICT: (
    message: string = 'Resource already exists',
  ): createError.HttpError => createError.Conflict(message),
  UNPROCESSABLE_ENTITY: (message: string): createError.HttpError =>
    createError.UnprocessableEntity(message),
  TOO_MANY_REQUESTS: (
    message: string = 'Too many requests',
  ): createError.HttpError => createError.TooManyRequests(message),
  INTERNAL_ERROR: (
    message: string = 'Internal server error',
  ): createError.HttpError => createError.InternalServerError(message),

  CUSTOM: (statusCode: number, message: string): createError.HttpError =>
    createError(statusCode, message),
}
