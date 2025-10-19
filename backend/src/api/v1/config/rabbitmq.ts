export const RabbitMQConfig = {
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost',
  queues: {
    EMAIL: {
      name: 'email_queue',
      options: { durable: true },
    },
  },

  prefetch: 1,
  retry: {
    maxAttempts: 3,
    delay: 5000,
  },
}
