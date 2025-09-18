import { Router } from 'express'
import AuthController from '../controllers/AuthController'
import { validateRequest } from '../middlewares/validationMiddleware'
import { registerSchema } from '../validators/authValidator'

const authController = new AuthController()
const router = Router()

router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register,
)
// router.post('/login', validateRequest(loginSchema), authController.login)
// router.get('/status', authController.authStatus)
// router.post('/logout', authController.logout)

// router.post('/2fa/setup', authController.setup2FA)
// router.post('/2fa/verify', authController.verify2FA)
// router.post('/2fa/reset', authController.reset2FA)

export default router
