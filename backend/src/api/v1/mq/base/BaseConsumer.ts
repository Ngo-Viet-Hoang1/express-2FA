import type { ChannelWrapper } from 'amqp-connection-manager'
import type { ConsumeMessage } from 'amqplib'
import logger from '../../config/logger'
import type { QueueConfig, MessagePayload } from '../../types/IQueueConfig'
import rabbitmqManager, { RabbitMQConfig } from '../connection'

export abstract class BaseConsumer<T> {
  protected abstract queueConfig: QueueConfig
  private channel: ChannelWrapper | null = null

  protected abstract processMessage(data: T): Promise<void>

  async initialize(): Promise<void> {
    this.channel = await rabbitmqManager.getChannelWrapper()

    await this.channel.assertQueue(
      this.queueConfig.name,
      this.queueConfig.options,
    )

    logger.info(`📥 Consumer initialized for queue: ${this.queueConfig.name}`)
  }

  async startConsuming(): Promise<void> {
    if (!this.channel) await this.initialize()

    await this.channel!.consume(
      this.queueConfig.name,
      async (msg) => {
        if (!msg) return

        try {
          const content: MessagePayload<T> = JSON.parse(msg.content.toString())
          logger.info(
            `📥 Received message from ${this.queueConfig.name}:`,
            content,
          )

          await this.processMessage(content.data)

          this.channel!.ack(msg)
        } catch (error) {
          await this.handleError(msg, error)
        }
      },
      {
        noAck: false,
      },
    )

    logger.info(`👂 Listening for messages on queue: ${this.queueConfig.name}`)
  }

  private async handleError(
    msg: ConsumeMessage,
    error: unknown,
  ): Promise<void> {
    const content = JSON.parse(msg.content.toString())
    const attempts = (content.attempts || 0) + 1

    if (attempts < RabbitMQConfig.retry.maxAttempts) {
      logger.error('❌ Error processing message:', {
        queue: this.queueConfig.name,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        messageContent: content,
        attempts,
      })

      this.channel!.ack(msg)

      await new Promise((resolve) =>
        setTimeout(resolve, RabbitMQConfig.retry.delay),
      )

      await this.channel!.sendToQueue(
        msg.fields.routingKey,
        Buffer.from(JSON.stringify({ ...content, attempts })),
        { persistent: true },
      )
    } else {
      logger.error(
        `💀 Max retries (${attempts}) reached. Moving to dead letter queue...`,
        error,
      )
      // await this.sendToDeadLetterQueue({
      //   ...content,
      //   attempts,
      //   error: String(error),
      // })
      // this.channel!.ack(msg)
    }
  }
}
