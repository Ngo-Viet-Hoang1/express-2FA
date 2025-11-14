import type {
  AmqpConnectionManager,
  ChannelWrapper,
} from 'amqp-connection-manager'
import amqp from 'amqp-connection-manager'
import type { Channel } from 'amqplib'
import logger from '../config/logger'
import { AppError } from '../models/AppError'
import { RabbitMQConfig } from '../config/rabbitmq'

class RabbitMQManager {
  private static instance: RabbitMQManager
  private connection: AmqpConnectionManager | null
  private channelWrapper: ChannelWrapper | null
  private isConnected: boolean

  constructor() {
    this.connection = null
    this.channelWrapper = null
    this.isConnected = false
  }

  static getInstance(): RabbitMQManager {
    if (!RabbitMQManager.instance) {
      RabbitMQManager.instance = new RabbitMQManager()
    }
    return RabbitMQManager.instance
  }

  async connect(): Promise<ChannelWrapper> {
    try {
      this.connection = amqp.connect([RabbitMQConfig.rabbitmqUrl], {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 30,
      })

      this.connection.on('connect', () => {
        logger.info('✓ RabbitMQ connected')
        this.isConnected = true
      })

      this.connection.on('disconnect', ({ err }) => {
        logger.warn('⚠ RabbitMQ disconnected:', err.message)
        this.isConnected = false
      })

      this.connection.on('connectFailed', ({ url, err }) => {
        logger.warn(`⚠ RabbitMQ connection failed to ${url}:`, err.message)
      })

      this.channelWrapper = this.connection.createChannel({
        setup: async (channel: Channel) => {
          for (const queue of Object.values(RabbitMQConfig.queues)) {
            await channel.assertQueue(queue.name, queue.options)
          }

          await channel.prefetch(RabbitMQConfig.prefetch || 1)
          logger.info('✓ Channel created and configured')
        },
      })

      await this.connection.connect()
      await this.channelWrapper.waitForConnect()

      logger.info('✓ RabbitMQ connection ready')
      return this.channelWrapper
    } catch (error) {
      logger.error('✗ Failed to connect to RabbitMQ:', error)
      throw error
    }
  }

  getChannelWrapper(): ChannelWrapper {
    if (!this.channelWrapper)
      throw new AppError(
        'RabbitMQ channel not initialized. Call connect() first.',
        500,
      )

    return this.channelWrapper
  }

  isReady(): boolean {
    return this.isConnected && this.channelWrapper !== null
  }

  async close(): Promise<void> {
    try {
      if (this.channelWrapper) await this.channelWrapper.close()
      if (this.connection) await this.connection.close()

      logger.info('✓ RabbitMQ connection closed gracefully')
    } catch (error) {
      logger.error('✗ Error closing RabbitMQ connection:', error)
    }
  }
}

const rabbitmqManager = RabbitMQManager.getInstance()
export default rabbitmqManager
