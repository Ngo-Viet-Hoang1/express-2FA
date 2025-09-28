/* eslint-disable no-console */
import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
  family: 4,
  keepAlive: 30000,
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'app:',
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

export default redis
