import { randomUUID, type UUID } from 'crypto'
import type { SendMailOptions } from 'nodemailer'
import logger from '../config/logger'
import { getTransporter } from '../config/nodemailer'
import redis from '../config/redis'
import type {
  default as EmailOptions,
  default as IEmailOptions,
} from '../types/IEmailOptions'
import renderEmailTemplate, {
  convertHtmlToText,
} from '../utils/renderEmailTemplate'

export class EmailService {
  private static instance: EmailService
  private readonly fromAddress: string

  private constructor() {
    this.fromAddress = `"${process.env.APP_NAME || 'Twiliver'}" <${
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
    const subject = `Welcome to ${process.env.APP_NAME || 'Twiliver'}!`
    const html = await renderEmailTemplate('welcome', { userName })

    const text = convertHtmlToText(html)

    await this.sendEmail({ to, subject, html, text })
  }

  async createVerificationEmail(email: string): Promise<IEmailOptions> {
    const verificationCode = await this.createEmailVerificationCode(email)
    const verificationLink = `${
      process.env.FRONTEND_URL || 'https://mydomain.com'
    }/api/v1/auth/email/verify?code=${verificationCode}`

    const ttl = parseInt(process.env.EMAIL_VERIFICATION_CODE_TTL || '600', 10)
    const expiresIn = `${Math.floor(ttl / 60)} minutes`

    const html = await renderEmailTemplate('verificationEmail', {
      verificationLink,
      expiresIn,
    })
    const text = convertHtmlToText(html)
    const subject = 'Email Verification - Two-Factor Authentication Setup'

    return { to: email, subject, html, text }
  }

  async createEmailVerificationCode(email: string): Promise<UUID> {
    const verificationCode = randomUUID()
    const key = `verificationCode:${verificationCode}`

    const data = JSON.stringify({
      email,
      createdAt: new Date().toISOString(),
    })

    const ttl = parseInt(process.env.EMAIL_VERIFICATION_CODE_TTL || '600', 10)
    await redis.setex(key, ttl, data)

    return verificationCode
  }

  async getEmailByVerificationCode(
    verificationCode: string,
  ): Promise<string | null> {
    const key = `verificationCode:${verificationCode}`
    const data = await redis.get(key)

    if (!data) return null

    try {
      const parsed = JSON.parse(data)
      return parsed.email
    } catch {
      return null
    }
  }

  async deleteEmailVerificationCode(
    verificationCode: string,
  ): Promise<string | null> {
    const key = `verify:${verificationCode}`
    const tx = redis.multi()
    tx.get(key)
    tx.del(key)
    const res = await tx.exec()

    if (!res || !res[0] || !res[0][1]) return null
    return res[0][1] as string
  }
}

export const emailService = EmailService.getInstance()
