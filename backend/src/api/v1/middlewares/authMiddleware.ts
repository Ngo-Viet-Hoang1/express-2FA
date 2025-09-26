import type { User } from '@/generated/prisma'
import type { NextFunction, Request, Response } from 'express'
import passport from 'passport'
import { ErrorTypes } from '../models/AppError'
import { AuthService } from '../services/AuthService'
import { catchAsync } from '../utils/asyncHandler'

export const authenticate = passport.authenticate('jwt', { session: false })

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

export const requireGuest = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // if (req.user) {
    //   throw ErrorTypes.FORBIDDEN('User is already authenticated')
    // }

    const authHeader = req.headers.authorization
    if (!authHeader) return next()

    const token = authHeader?.split(' ')[1] || ''
    if (!token) return next()

    const payload = await AuthService.verifyAccessToken(token)

    if (payload) throw ErrorTypes.FORBIDDEN('User is already authenticated')
    next()
  },
)

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
