import type { ChannelWrapper } from 'amqp-connection-manager'
import logger from '../../config/logger'
import type { MessagePayload, QueueConfig } from '../../types/IQueueConfig'
import rabbitmqManager from '../connection'

export abstract class BaseProducer<T> {
  protected abstract queueConfig: QueueConfig
  private channel: ChannelWrapper | null = null

  async initialize(): Promise<void> {
    this.channel = await rabbitmqManager.getChannelWrapper()

    await this.channel.assertQueue(
      this.queueConfig.name,
      this.queueConfig.options,
    )

    logger.info(`📤 Producer initialized for queue: ${this.queueConfig.name}`)
  }

  async sendToQueue(
    data: T,
    options?: Record<string, unknown>,
  ): Promise<boolean> {
    if (!this.channel) {
      await this.initialize()
    }

    const message = {
      data,
      timestamp: new Date().toISOString(),
      attempts: 0,
      ...options,
    } as MessagePayload<T>

    const sent = this.channel!.sendToQueue(
      this.queueConfig.name,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    )

    if (!sent) {
      logger.warn('⚠️ Message buffer full, waiting...')
      await new Promise((resolve) => this.channel!.once('drain', resolve))
    }

    logger.info(`✅ Message sent to ${this.queueConfig.name}:`, message.data)
    return sent
  }
}
