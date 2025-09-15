import type { NextFunction, Request, Response } from 'express'
import { ensureHttpError } from './errorUtils.js'

export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<unknown> => {
    return fn(req, res, next).catch((error) => {
      const httpError = ensureHttpError(error)
      next(httpError)
    })
  }
}
