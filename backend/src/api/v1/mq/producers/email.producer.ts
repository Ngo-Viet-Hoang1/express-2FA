import { RabbitMQConfig } from '../../config/rabbitmq'
import type EmailOptions from '../../types/IEmailOptions'
import type { QueueConfig } from '../../types/IQueueConfig'
import { BaseProducer } from '../base/BaseProducer'

class EmailProducer extends BaseProducer<EmailOptions> {
  protected override queueConfig: QueueConfig = RabbitMQConfig.queues.EMAIL
}

const emailProducer = new EmailProducer()
export default emailProducer
