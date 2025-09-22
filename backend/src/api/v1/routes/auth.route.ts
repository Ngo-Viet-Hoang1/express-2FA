import { Router } from 'express'
import passport from 'passport'
import AuthController from '../controllers/AuthController'
import { requireAuth, requireGuest } from '../middlewares/authMiddleware'
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
  passport.authenticate('local', { failureMessage: true }),
  authController.login,
)
router.get('/status', requireAuth, authController.authStatus)
router.post('/logout', requireAuth, authController.logout)

// router.post('/2fa/setup', requireAuth, authController.setup2FA)
// router.post('/2fa/verify', requireAuth, authController.verify2FA)
// router.post('/2fa/reset', requireAuth, authController.reset2FA)

export default router
