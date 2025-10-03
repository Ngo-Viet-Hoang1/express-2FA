import type { SendMailOptions } from 'nodemailer'
import logger from '../config/logger'
import { getTransporter } from '../config/nodemailer'

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
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f4f4f4; padding: 20px; border-radius: 5px; text-align: center; }
            .code { background: #e8f4fd; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <p>Hello,</p>
            <p>You have requested to set up two-factor authentication for your account. Please use the verification code below:</p>
            <div class="code">${verificationCode}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      Email Verification - Two-Factor Authentication Setup
      
      Hello,
      
      You have requested to set up two-factor authentication for your account.
      Please use the verification code below:
      
      ${verificationCode}
      
      This code will expire in 10 minutes.
      
      If you did not request this, please ignore this email.
    `

    await this.sendEmail({ to, subject, html, text })
  }

  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    resetUrl: string,
  ): Promise<void> {
    const subject = 'Password Reset Request'
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f4f4f4; padding: 20px; border-radius: 5px; text-align: center; }
            .button { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .token { background: #e8f4fd; padding: 15px; margin: 20px 0; border-radius: 5px; word-break: break-all; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <p>Hello,</p>
            <p>You have requested to reset your password. Click the button below to reset your password:</p>
            <p><a href="${resetUrl}" class="button">Reset Password</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <div class="token">${resetUrl}</div>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this password reset, please ignore this email.</p>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      Password Reset Request
      
      Hello,
      
      You have requested to reset your password. Please visit the following link to reset your password:
      
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you did not request this password reset, please ignore this email.
    `

    await this.sendEmail({ to, subject, html, text })
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    const subject = `Welcome to ${process.env.APP_NAME || 'Our App'}!`
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f4f4f4; padding: 20px; border-radius: 5px; text-align: center; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome ${userName}!</h1>
            </div>
            <p>Thank you for joining ${
              process.env.APP_NAME || 'our platform'
            }.</p>
            <p>Your account has been successfully created and you can now start using our services.</p>
            <p>For enhanced security, we recommend setting up two-factor authentication in your account settings.</p>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      Welcome ${userName}!
      
      Thank you for joining ${process.env.APP_NAME || 'our platform'}.
      
      Your account has been successfully created and you can now start using our services.
      
      For enhanced security, we recommend setting up two-factor authentication in your account settings.
    `

    await this.sendEmail({ to, subject, html, text })
  }
}

export const emailService = EmailService.getInstance()
