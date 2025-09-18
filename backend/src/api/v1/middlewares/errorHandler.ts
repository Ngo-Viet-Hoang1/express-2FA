import logger from '@/config/logger'
import { AppError } from '@/models/AppError.js'
import { formatZodError, isZodError } from '@/utils/zodErrorUtils.js'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void => {
  logger.error('Error occurred:', {
    requestId: req.requestId,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  })

  let statusCode = 500
  let message = 'Internal Server Error'
  let status = 'error'
  let errors:
    | Array<{
        field: string
        message: string
        code: string
        received?: unknown
      }>
    | undefined

  if (createError.isHttpError(err)) {
    statusCode = err.statusCode || err.status || 500
    message = err.message
    status = statusCode >= 500 ? 'error' : 'fail'
  } else if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
    status = err.errorStatus
  } else if (isZodError(err)) {
    statusCode = 400
    message = 'Validation Error'
    status = 'fail'
    errors = formatZodError(err)
  } else if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation Error'
    status = 'fail'
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401
    message = 'Unauthorized'
    status = 'fail'
  } else if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
    status = 'fail'
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
    status = 'fail'
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
    status = 'fail'
  }

  const errorResponse = {
    success: false,
    status: status,
    message: message,
    requestId: req.requestId,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
    }),
    timestamp: new Date().toISOString(),
  }

  res.status(statusCode).json(errorResponse)
}

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const error = createError.NotFound(`Route ${req.originalUrl} not found`)
  next(error)
}

export const unhandledRejectionHandler = (): void => {
  process.on(
    'unhandledRejection',
    (reason: unknown, promise: Promise<unknown>) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
      process.exit(1)
    },
  )
}

export const uncaughtExceptionHandler = (): void => {
  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught Exception:', err)
    process.exit(1)
  })
}
