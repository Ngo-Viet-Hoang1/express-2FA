import type { Request, Response, NextFunction } from 'express'
import { AppError } from '@/models/AppError.js'
import createError from 'http-errors'

export default class ErrorController {
  index = (req: Request, res: Response, next: NextFunction): void => {
    const error = new AppError('This is a custom test error', 399)
    next(error)
  }

  httpError = (req: Request, res: Response, next: NextFunction): void => {
    const error = createError.BadRequest('This is an http-errors BadRequest')
    next(error)
  }
}
