import type { Options } from 'amqplib'

export interface QueueConfig {
  name: string
  options: Options.AssertQueue
  prefetch?: number
}

export interface MessagePayload<T> {
  data: T
  timestamp: string
  attempts: number
  messageId?: string
  correlationId?: string
}
