import passport from 'passport'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'
import { JWT_SCOPE } from '../constants/auth'
import type { IJwtPayload } from '../types/IJwtPayload'

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'secret',
}

passport.use(
  new JwtStrategy(opts, async (jwt_payload: IJwtPayload, done) => {
    if (jwt_payload.scope !== JWT_SCOPE.ACCESS)
      return done(null, false, { message: 'MFA required' })

    return done(null, jwt_payload)
  }),
)

passport.use(
  'jwt-mfa',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_MFA_SECRET || 'jwt-mfa-secret',
    },
    async (jwt_payload: IJwtPayload, done) => {
      if (jwt_payload.scope !== JWT_SCOPE.MFA)
        return done(null, false, { message: 'Invalid MFA token' })

      return done(null, jwt_payload)
    },
  ),
)

export default passport
