import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body)

      req.body = validatedData

      next()
    } catch (error) {
      next(error)
    }
  }
}
