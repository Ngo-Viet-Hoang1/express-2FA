import createError from 'http-errors'
import { AppError } from '../models/AppError.js'

export const ensureHttpError = (error: unknown): createError.HttpError => {
  if (createError.isHttpError(error)) {
    return error
  }

  if (error instanceof Error) {
    return createError.InternalServerError(error.message)
  }

  if (typeof error === 'string') {
    return createError.InternalServerError(error)
  }

  return createError.InternalServerError('Unknown error occurred')
}

export const isOperationalError = (error: unknown): boolean => {
  return error instanceof AppError && error.isOperational
}
