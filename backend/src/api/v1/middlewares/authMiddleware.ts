import type { NextFunction, Request, Response } from 'express'
import type { User } from '@/generated/prisma'
import { ErrorTypes } from '../models/AppError'

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    throw ErrorTypes.UNAUTHORIZED('Authentication required')
  }
  next()
}

export const requireGuest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user) {
    throw ErrorTypes.FORBIDDEN('User is already authenticated')
  }
  next()
}

export const requireActiveUser = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    throw ErrorTypes.UNAUTHORIZED('Authentication required')
  }

  const user = req.user as Omit<User, 'password' | 'twoFactorSecret'>

  if (!user.isActive) {
    throw ErrorTypes.FORBIDDEN('Account is deactivated')
  }

  next()
}
