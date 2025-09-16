/* eslint-disable no-console */
import { default as RedisStore } from 'connect-redis'
import session from 'express-session'
import Redis from 'ioredis'

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
})

redis.on('error', (err) => {
  console.error('Redis connection error:', err)
})

redis.on('connect', () => {
  console.log('✅ Connected to Redis')
})

redis.on('reconnecting', () => {
  console.log('🔄 Reconnecting to Redis...')
})

redis.on('ready', () => {
  console.log('🚀 Redis is ready')
})

process.on('SIGINT', async () => {
  console.log('Closing Redis connection...')
  await redis.quit()
  process.exit(0)
})

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
