/* eslint-disable @typescript-eslint/no-explicit-any */
import type { User } from '@/generated/prisma'
import { Router } from 'express'
import passport from 'passport'
import AuthController from '../controllers/AuthController'
import {
  authenticate,
  googleAuthMiddleWare,
  requireActiveUser,
  requireGuest,
} from '../middlewares/authMiddleware'
import { validateRequest } from '../middlewares/validationMiddleware'
import { loginSchema, registerSchema } from '../validators/authValidator'

const authController = new AuthController()
const router = Router()

router.post(
  '/register',
  requireGuest,
  validateRequest(registerSchema),
  authController.register,
)
router.post(
  '/login',
  requireGuest,
  validateRequest(loginSchema),
  (req, res, next) => {
    // Custom callback to handle authentication result
    // passport local not throw error on invalid credentials but return message
    passport.authenticate(
      'local',
      { session: false },
      (err: any, user: User, info: any) => {
        if (err) {
          return next(err)
        }

        if (!user) {
          return res.status(401).json({
            success: false,
            message: info?.message || 'Email hoặc mật khẩu không đúng',
          })
        }

        req.user = user
        next()
      },
    )(req, res, next)
  },
  authController.login,
)
router.get(
  '/login/federated/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
)
router.get(
  '/oauth2/redirect/google',
  googleAuthMiddleWare,
  authController.googleOAuthCallback,
)
router.post('/refresh', authController.refreshToken)

// router.use(requireAuth)
router.post(
  '/2fa/verify',
  passport.authenticate('jwt-mfa', { session: false }),
  authController.verify2FA,
)

router.get('/email/verify', authController.verifyEmailCode)

router.use(authenticate, requireActiveUser)

router.post('/email/send-verification', authController.sendEmailVerification)

router.get('/status', authController.authStatus)
router.post('/logout', authController.logout)

router.post('/2fa/setup', authController.setup2FA)
router.post('/2fa/reset', authController.reset2FA)

export default router
