import { google } from 'googleapis'
import type { Transporter } from 'nodemailer'
import nodemailer from 'nodemailer'
import logger from './logger'

const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN',
  'ADMIN_EMAIL_ADDRESS',
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

const OAuth2 = google.auth.OAuth2

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground',
)

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
})

async function getAccessToken(): Promise<string> {
  try {
    const accessToken = await oauth2Client.getAccessToken()

    if (!accessToken || !accessToken.token)
      throw new Error('Failed to retrieve access token from Google OAuth2')

    return accessToken.token
  } catch (error) {
    logger.error('Error getting access token:', error)
    throw new Error('Failed to authenticate with Google OAuth2')
  }
}

async function createTransporter(): Promise<Transporter> {
  try {
    const accessToken = await getAccessToken()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.ADMIN_EMAIL_ADDRESS,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000, // 1 second between messages
      rateLimit: 5, // max 5 messages per rateDelta
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    })

    await transporter.verify()
    logger.info('✅ Nodemailer transporter is ready to send emails')

    return transporter
  } catch (error) {
    logger.error('❌ Error creating email transporter:', error)
    throw error
  }
}

let transporter: Transporter | null = null

export async function getTransporter(): Promise<Transporter> {
  if (!transporter) {
    transporter = await createTransporter()

    process.on('SIGTERM', async () => {
      if (transporter) {
        await transporter.close()
        logger.info('Email transporter closed')
      }
      process.exit(0)
    })

    // Setup idle event for queue processing (if needed)
    // transporter.on('idle', async () => {
    //   while (transporter.isIdle()) {
    //     const message = await getNextMessage()
    //     if (!message) return // queue is empty
    //     try {
    //       await transporter.sendMail(message)
    //       logger.info('Email sent successfully')
    //     } catch (err) {
    //       logger.error('Failed to send email:', err)
    //     }
    //   }
    // })
  }

  return transporter
}

// For backward compatibility - lazy initialization
const transporterProxy = new Proxy({} as Transporter, {
  get(target, prop): unknown {
    if (!transporter) {
      throw new Error(
        'Transporter not initialized. Call getTransporter() first.',
      )
    }
    const value = transporter[prop as keyof Transporter]
    return typeof value === 'function' ? value.bind(transporter) : value
  },
})

export default transporterProxy
