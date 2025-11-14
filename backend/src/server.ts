import logger from '@/config/logger'
import {
  uncaughtExceptionHandler,
  unhandledRejectionHandler,
} from '@/middlewares/errorHandler'
import rabbitmqManager from './api/v1/mq/connection'
import app from './app'

const port = process.env.PORT || 3000

async function startServer(): Promise<void> {
  try {
    logger.info('📡 Connecting to RabbitMQ...')
    await rabbitmqManager.connect()

    // Start workers
    // logger.info('👷 Starting workers...')
    // await startWorkers()

    // Setup process error handlers
    unhandledRejectionHandler()
    uncaughtExceptionHandler()

    const server = app.listen(port, () => {
      logger.info(`🚀 2FA app listening at http://localhost:${port}`)
      logger.info('📊 RabbitMQ Management: http://localhost:15672')
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully')
      rabbitmqManager.close()
      server.close(() => {
        logger.info('Process terminated')
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully')
      rabbitmqManager.close()
      server.close(() => {
        logger.info('Process terminated')
        process.exit(0)
      })
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
