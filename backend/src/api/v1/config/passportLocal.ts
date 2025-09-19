import type { User } from '@/generated/prisma'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { ErrorTypes } from '../models/AppError'
import { UserService } from '../services/UserService'
import { PasswordUtils } from '../utils/passwordUtils'

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (username, password, cb) => {
      try {
        const user = await UserService.findByEmailForAuth(username)
        if (!user) {
          return cb(null, false, { message: 'Incorrect username or password.' })
        }

        const isValidPassword = await PasswordUtils.comparePassword(
          password,
          user.password,
        )

        if (!isValidPassword) {
          return cb(null, false, { message: 'Incorrect username or password.' })
        }

        await UserService.updateLastLogin(user.id)

        return cb(null, user)
      } catch {
        return cb(ErrorTypes.INTERNAL_ERROR('Authentication failed'))
      }
    },
  ),
)

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, (user as User).id)
  })
})

passport.deserializeUser(async (id: number, cb) => {
  process.nextTick(async () => {
    try {
      const user = await UserService.findById(id)
      if (!user) {
        return cb(null, false)
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, twoFactorSecret, ...safeUser } = user
      return cb(null, safeUser)
    } catch {
      return cb(null, false)
    }
  })
})

export default passport
