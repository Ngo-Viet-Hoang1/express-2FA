import logger from '../config/logger'
import rabbitmqManager from './connection'
import emailConsumer from './consumers/email.consumer'

async function startWorker(): Promise<void> {
  try {
    logger.info('Starting RabbitMQ Worker...')

    await rabbitmqManager.connect()

    await emailConsumer.startConsuming()

    logger.info('Worker started successfully.')

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Worker is shutting down...')
      await rabbitmqManager.close()
      process.exit(0)
    })

    process.on('SIGTERM', async () => {
      logger.info('Worker is shutting down...')
      await rabbitmqManager.close()
      process.exit(0)
    })
  } catch (error) {
    logger.error('Failed to start worker:', error)
    process.exit(1)
  }
}

startWorker()
