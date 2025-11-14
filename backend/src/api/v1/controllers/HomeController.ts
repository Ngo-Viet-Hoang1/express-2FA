/* eslint-disable indent */
import type { Request, Response } from 'express'
import prisma from '../config/database'
import emailProducer from '../mq/producers/email.producer'
import { emailService } from '../services/EmailService'
import { catchAsync } from '../utils/asyncHandler'

export default class HomeController {
  index = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const users = await prisma.user.findMany()

    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    })
  })

  testMail = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, type } = req.query as { email?: string; type?: string }
    const testEmail = email || 'test@example.com'

    let result

    switch (type) {
      case 'verification': {
        await emailService.sendVerificationEmail(testEmail, '123456')
        result = { type: 'verification', email: testEmail }
        break
      }
      case 'password-reset': {
        await emailService.sendPasswordResetEmail(
          testEmail,
          'dummy-token',
          'https://example.com/reset',
        )
        result = { type: 'password-reset', email: testEmail }
        break
      }
      case 'welcome': {
        await emailService.sendWelcomeEmail(testEmail, 'Test User')
        result = { type: 'welcome', email: testEmail }
        break
      }
      default: {
        const emailResult = await emailService.sendEmail({
          to: testEmail,
          subject: 'Test Email ✔',
          text: 'This is a test email from your application.',
          html: '<b>This is a test email from your application.</b>',
        })
        result = {
          type: 'basic',
          email: testEmail,
          messageId: emailResult.messageId,
        }
      }
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Test email sent successfully',
    })
  })

  testRabbitMQSendMail = catchAsync(async (req: Request, res: Response) => {
    await emailProducer.sendToQueue({
      to: 'test@gmail.com',
      subject: 'Test Email ✔',
      text: 'This is a test email from your application.',
      html: '<b>This is a test email from your application.</b>',
    })

    res.status(200).json({
      success: true,
      message: 'Test email job sent to RabbitMQ successfully',
    })
  })
}
