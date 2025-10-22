import redis from '@/config/redis'

interface CanSendEmailResult {
  allowed: boolean
  remainingAttempts: number
  retryAfter: number | null
  reason?: string
}

interface EmailLimiterStatus {
  attempts: number
  remaining: number
  nextAllowedAt: Date | null
  blocked: boolean
  blockedUntil: Date | null
}

export class EmailLimiter {
  async canSendEmail(email: string): Promise<CanSendEmailResult> {
    const key = `email_verify:${email}`
    const data = await redis.get(key)

    if (!data) {
      return {
        allowed: true,
        remainingAttempts: 2,
        retryAfter: null,
      }
    }

    const { count, lastSent, blockedUntil } = JSON.parse(data)
    const now = Date.now()

    if (blockedUntil && now < blockedUntil) {
      const secondsRemaining = Math.ceil((blockedUntil - now) / 1000)
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfter: secondsRemaining,
        reason: 'You have sent too many requests. Please try again later.',
      }
    }

    const COOLDOWN = 2 * 60 * 1000 // 2 minutes
    if (now - lastSent < COOLDOWN) {
      const secondsRemaining = Math.ceil((COOLDOWN - (now - lastSent)) / 1000)
      return {
        allowed: false,
        remainingAttempts: 3 - count,
        retryAfter: secondsRemaining,
        reason: `Please wait ${secondsRemaining} seconds before trying again.`,
      }
    }

    const MAX_ATTEMPTS = 3
    if (count >= MAX_ATTEMPTS) {
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfter: 3600, // Block 1 giờ
        reason:
          'You have exceeded the email sending limit. Please try again in 1 hour.',
      }
    }

    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS - count - 1,
      retryAfter: null,
    }
  }

  async recordSend(email: string): Promise<void> {
    const key = `email_verify:${email}`
    const data = await redis.get(key)

    const now = Date.now()
    let count = 1
    let blockedUntil = null

    if (data) {
      const existing = JSON.parse(data)
      count = existing.count + 1

      if (count >= 3) {
        blockedUntil = now + 60 * 60 * 1000 // 1 hour
      }
    }

    const newData = {
      count,
      lastSent: now,
      blockedUntil,
    }

    await redis.setex(key, 3600, JSON.stringify(newData))
  }

  async reset(email: string): Promise<void> {
    const key = `email_verify:${email}`
    await redis.del(key)
  }

  async getStatus(email: string): Promise<EmailLimiterStatus> {
    const key = `email_verify:${email}`
    const data = await redis.get(key)

    if (!data) {
      return {
        attempts: 0,
        remaining: 3,
        nextAllowedAt: null,
        blocked: false,
        blockedUntil: null,
      }
    }

    const { count, lastSent, blockedUntil } = JSON.parse(data)
    const now = Date.now()

    return {
      attempts: count,
      remaining: Math.max(0, 3 - count),
      nextAllowedAt: new Date(lastSent + 2 * 60 * 1000),
      blocked: blockedUntil && now < blockedUntil,
      blockedUntil: blockedUntil ? new Date(blockedUntil) : null,
    }
  }
}

const emailLimiter = new EmailLimiter()
export default emailLimiter
