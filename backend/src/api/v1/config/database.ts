import { PrismaClient } from '@/generated/prisma'
import logger from './logger'

declare global {
  var __prisma: PrismaClient | undefined
}

const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { level: 'error', emit: 'stdout' },
            { level: 'info', emit: 'stdout' },
            { level: 'warn', emit: 'stdout' },
          ]
        : [{ level: 'error', emit: 'stdout' }],
  })
}

const prisma = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

const gracefulShutdown = async (): Promise<void> => {
  logger.info('Disconnecting from database...')
  await prisma.$disconnect()
  logger.info('Database disconnected successfully')
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
process.on('beforeExit', gracefulShutdown)

const testConnection = async (): Promise<void> => {
  try {
    await prisma.$connect()
    logger.info('Database connected successfully')
  } catch (error) {
    logger.error('Failed to connect to database:', error)
    process.exit(1)
  }
}

if (process.env.NODE_ENV !== 'test') {
  testConnection()
}

export default prisma
export { testConnection, gracefulShutdown }
