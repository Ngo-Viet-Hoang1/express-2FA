import { default as RedisStore } from 'connect-redis'
import session from 'express-session'
import redis from './redis'

export const redisStore = new RedisStore({
  client: redis,
  prefix: '2fa:sess:',
  ttl: 24 * 60 * 60, // 24 hours in seconds
})

export const getSessionConfig = (): session.SessionOptions => {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    store: redisStore,
    secret: process.env.SESSION_SECRET || 'secret-key',
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isProduction ? 'strict' : 'lax',
    },
    rolling: true,
  }
}
