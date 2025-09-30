import type { User } from '@/generated/prisma'
import passport from 'passport'
import {
  Strategy as GoogleStrategy,
  type Profile,
  type StrategyOptions,
} from 'passport-google-oauth20'
import { UserService } from '../services/UserService'

// Validate required environment variables
if (
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.GOOGLE_CALLBACK_URL
) {
  throw new Error('Missing required Google OAuth environment variables')
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
      // Add security options
      passReqToCallback: false,
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    } as StrategyOptions,
    async function (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      cb: (err: Error | null, user?: User) => void,
    ) {
      try {
        const user = await UserService.findOrCreateFromGoogleProfile(profile)

        if (!user)
          return cb(new Error('Failed to create or find user'), undefined)

        return cb(null, user)
      } catch (error) {
        return cb(error as Error, undefined)
      }
    },
  ),
)

export default passport
