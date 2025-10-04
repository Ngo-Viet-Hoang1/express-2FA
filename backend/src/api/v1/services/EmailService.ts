import type { SendMailOptions } from 'nodemailer'
import logger from '../config/logger'
import { getTransporter } from '../config/nodemailer'
import renderEmailTemplate, {
  convertHtmlToText,
} from '../utils/renderEmailTemplate'

export interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

export class EmailService {
  private static instance: EmailService
  private readonly fromAddress: string

  private constructor() {
    this.fromAddress = `"${process.env.APP_NAME || 'Your App'}" <${
      process.env.ADMIN_EMAIL_ADDRESS
    }>`
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendEmail(
    options: EmailOptions,
  ): Promise<{ messageId: string; success: boolean }> {
    try {
      const transporter = await getTransporter()

      const mailOptions: SendMailOptions = {
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      }

      const info = await transporter.sendMail(mailOptions)

      logger.info(`Email sent successfully to ${options.to}`, {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      })

      return {
        messageId: info.messageId,
        success: true,
      }
    } catch (error) {
      logger.error('Failed to send email:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to: options.to,
        subject: options.subject,
      })
      throw error
    }
  }

  async sendVerificationEmail(
    to: string,
    verificationCode: string,
  ): Promise<void> {
    const subject = 'Email Verification - Two-Factor Authentication Setup'
    const html = await renderEmailTemplate('verificationEmail', {
      verificationCode,
      appName: process.env.APP_NAME || 'Your App',
    })

    const text = convertHtmlToText(html)

    await this.sendEmail({ to, subject, html, text })
  }

  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    resetUrl: string,
  ): Promise<void> {
    const subject = 'Password Reset Request'
    const html = await renderEmailTemplate('resetPassword', {
      resetUrl,
    })

    const text = convertHtmlToText(html)

    await this.sendEmail({ to, subject, html, text })
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    const subject = `Welcome to ${process.env.APP_NAME || 'Our App'}!`
    const html = await renderEmailTemplate('welcome', { userName })

    const text = convertHtmlToText(html)

    await this.sendEmail({ to, subject, html, text })
  }
}

export const emailService = EmailService.getInstance()
