import { RabbitMQConfig } from '../../config/rabbitmq'
import { emailService } from '../../services/EmailService'
import type EmailOptions from '../../types/IEmailOptions'
import { BaseConsumer } from '../base/BaseConsumer'

export class EmailConsumer extends BaseConsumer<EmailOptions> {
  protected override queueConfig = RabbitMQConfig.queues.EMAIL

  protected override async processMessage(data: EmailOptions): Promise<void> {
    await emailService.sendEmail(data)
  }
}

const emailConsumer = new EmailConsumer()
export default emailConsumer
