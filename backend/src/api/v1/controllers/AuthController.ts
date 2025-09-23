import type { User } from '@/generated/prisma'
import type { Request, Response } from 'express'
import speakeasy from 'speakeasy'
import { ErrorTypes } from '../models/AppError'
import { UserService } from '../services/UserService'
import { catchAsync } from '../utils/asyncHandler'
import type { RegisterInput } from '../validators/authValidator'
import QRCode from 'qrcode'

export default class AuthController {
  register = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as RegisterInput

    const newUser = await UserService.createUser({ email, password })

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          emailVerified: newUser.emailVerified,
          createdAt: newUser.createdAt,
        },
      },
      message: 'User registered successfully',
    })
  })

  login = catchAsync(async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      data: { user: req.user },
      message: 'User logged in successfully',
    })
  })

  authStatus = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      res.status(200).json({
        success: true,
        data: { user: req.user },
        message: 'User is authenticated',
      })
    },
  )

  logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
    return new Promise((resolve, reject) => {
      req.logOut((err) => {
        if (err) {
          reject(ErrorTypes.INTERNAL_ERROR('Logout failed'))
        } else {
          req.session.destroy((destroyErr) => {
            if (destroyErr) {
              reject(ErrorTypes.INTERNAL_ERROR('Failed to destroy session'))
            } else {
              res.status(200).json({
                success: true,
                message: 'User logged out successfully',
              })
              resolve()
            }
          })
        }
      })
    })
  })

  setup2FA = catchAsync(async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as User
      const secret = speakeasy.generateSecret({
        name: user.email,
        issuer: 'Express 2FA App',
        length: 32,
      })

      await UserService.updateUser(user.id, {
        twoFactorSecret: secret.base32,
        isMfaActive: true,
      })

      if (!secret.otpauth_url) {
        throw ErrorTypes.INTERNAL_ERROR('OTP Auth URL is missing')
      }

      const dataUrl = await QRCode.toDataURL(secret.otpauth_url)

      res.status(200).json({
        success: true,
        data: { qrCodeDataUrl: dataUrl },
        message: '2FA setup initiated',
      })
    } catch {
      throw ErrorTypes.INTERNAL_ERROR('Error when setting up 2FA')
    }
  })

  verify2FA = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { userToken } = req.body
    const user = req.user as User
    const base32secret = await UserService.getTwoFactorSecretByUserId(user.id)

    if (!base32secret) {
      throw ErrorTypes.NOT_FOUND('2FA is not set up for this user')
    }

    const verified = speakeasy.totp.verify({
      secret: base32secret,
      encoding: 'base32',
      token: userToken,
      window: 2,
    })

    res.status(200).json({
      success: true,
      data: { verified },
      message: verified ? '2FA verified successfully' : 'Invalid 2FA token',
    })
  })

  reset2FA = catchAsync(async (req: Request, res: Response): Promise<void> => {
    await UserService.updateUser((req.user as User).id, {
      twoFactorSecret: null,
      isMfaActive: false,
    })

    res.status(200).json({
      success: true,
      message: '2FA has been reset. You can set it up again.',
    })
  })
}
