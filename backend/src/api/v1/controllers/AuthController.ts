import type { User } from '@/generated/prisma'
import type { Request, Response } from 'express'
import QRCode from 'qrcode'
import speakeasy from 'speakeasy'
import { ErrorTypes } from '../models/AppError'
import emailProducer from '../mq/producers/email.producer'
import { emailService } from '../services/EmailService'
import { UserService } from '../services/UserService'
import type { IJwtPayload } from '../types/IJwtPayload'
import { catchAsync } from '../utils/asyncHandler'
import type { RegisterInput } from '../validators/authValidator'
import { AuthService } from './../services/AuthService'

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

  login = catchAsync(async (req: Request, res: Response): Promise<Response> => {
    const user = req.user as User
    const ip =
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
    const deviceInfo = req.get('User-Agent')

    if (user.isMfaActive) {
      const mfaToken = AuthService.generateMfaToken(user.id, user.email)
      return res.status(200).json({
        success: true,
        data: { mfaRequired: true, mfaToken },
        message: 'MFA is required for this account',
      })
    }

    const accessToken = AuthService.generateAccessToken(user.id, user.email)
    const refreshToken = AuthService.generateRefreshToken(user.id)

    await AuthService.storeRefreshTokenToRedis(
      user.id,
      refreshToken,
      ip,
      deviceInfo,
    )

    res.cookie('refreshToken', refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })

    return res.status(200).json({
      success: true,
      data: { accessToken },
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
    const { refreshToken } = req.cookies

    // Revoke refresh token if exists
    if (refreshToken) {
      try {
        await AuthService.revokeRefreshToken(refreshToken)
      } catch {
        // Continue with logout even if token revocation fails
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })

    if (req.session) {
      return new Promise<void>((resolve, reject) => {
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
    } else {
      res.status(200).json({
        success: true,
        message: 'User logged out successfully',
      })
    }
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
        isMfaActive: false,
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
    const { id: userId } = req.user as IJwtPayload
    const user = await UserService.findByIdForAuth(userId)
    const base32secret = user?.twoFactorSecret
    const ip =
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
    const deviceInfo = req.get('User-Agent')

    if (!base32secret)
      throw ErrorTypes.NOT_FOUND('2FA is not set up for this user')

    const verified = speakeasy.totp.verify({
      secret: base32secret,
      encoding: 'base32',
      token: userToken,
      window: 2,
    })

    if (!verified) throw ErrorTypes.UNAUTHORIZED('Invalid 2FA token')

    const accessToken = AuthService.generateAccessToken(user.id, user.email)
    const refreshToken = AuthService.generateRefreshToken(user.id)
    await UserService.updateUser(user.id, { isMfaActive: true })

    await AuthService.storeRefreshTokenToRedis(
      user.id,
      refreshToken,
      ip,
      deviceInfo,
    )

    res.cookie('refreshToken', refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })

    res.status(200).json({
      success: true,
      data: { accessToken },
      message: '2FA verified successfully',
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

  refreshToken = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { refreshToken } = req.cookies
      const ip =
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
      const deviceInfo = req.get('User-Agent')

      if (!refreshToken)
        throw ErrorTypes.UNAUTHORIZED('Refresh token not provided')

      const decoded = (await AuthService.verifyRefreshToken(
        refreshToken,
      )) as IJwtPayload

      const user = await UserService.findByIdForAuth(decoded.id)
      if (!user) throw ErrorTypes.UNAUTHORIZED('User not found')

      const isValidToken = await AuthService.validateRefreshTokenInRedis(
        refreshToken,
      )
      if (!isValidToken)
        throw ErrorTypes.UNAUTHORIZED('Invalid or revoked refresh token')

      await AuthService.revokeRefreshToken(refreshToken)

      const accessToken = AuthService.generateAccessToken(user.id, user.email)
      const newRefreshToken = AuthService.generateRefreshToken(user.id)
      await AuthService.storeRefreshTokenToRedis(
        user.id,
        newRefreshToken,
        ip,
        deviceInfo,
      )

      res.cookie('refreshToken', newRefreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      })

      res.status(200).json({
        success: true,
        data: { accessToken },
        message: 'Token refreshed successfully',
      })
    },
  )

  googleOAuthCallback = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const user = req.user as User
      if (!user) throw ErrorTypes.UNAUTHORIZED('No user data from Google OAuth')

      const ip =
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
      const deviceInfo = req.get('User-Agent')

      await UserService.updateLastLogin(user.id)

      if (user.isMfaActive) {
        const mfaToken = AuthService.generateMfaToken(user.id, user.email)
        res.status(200).json({
          success: true,
          data: { mfaRequired: true, mfaToken },
          message: 'MFA is required for this account',
        })
        return
      }

      const accessToken = AuthService.generateAccessToken(user.id, user.email)
      const refreshToken = AuthService.generateRefreshToken(user.id)

      await AuthService.storeRefreshTokenToRedis(
        user.id,
        refreshToken,
        ip,
        deviceInfo,
      )

      res.cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      })

      // Redirect to frontend success page instead of JSON response for better UX
      // const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      // res.redirect(`${frontendUrl}/auth/success?token=${accessToken}`)
      res.status(200).json({
        success: true,
        data: { accessToken },
        message: 'User logged in successfully via Google OAuth',
      })
    },
  )

  sendEmailVerification = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body as { email?: string }
      if (!email) throw ErrorTypes.VALIDATION_ERROR('Email is required')

      const user = await UserService.findByEmail(email)
      if (!user) throw ErrorTypes.NOT_FOUND('User not found')

      if (user.emailVerified) {
        res.status(200).json({
          success: true,
          message: 'Email is already verified',
        })
        return
      }

      const emailOptions = await emailService.createVerificationEmail(email)
      await emailProducer.sendToQueue(emailOptions)

      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully',
        data: emailOptions,
      })
    },
  )

  verifyEmailCode = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { code } = req.query as { code?: string }

      if (!code)
        throw ErrorTypes.VALIDATION_ERROR('Verification code is required')

      const email = await emailService.getEmailByVerificationCode(code)
      if (!email) throw ErrorTypes.UNAUTHORIZED('Invalid or expired code')

      const user = await UserService.findByEmail(email)
      if (!user) throw ErrorTypes.NOT_FOUND('User not found')

      await UserService.updateUser(user.id, { emailVerified: true })

      await emailService.deleteEmailVerificationCode(code)

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      })
    },
  )
}
