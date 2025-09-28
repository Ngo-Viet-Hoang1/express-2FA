import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import redis from '../config/redis'
import { JWT_SCOPE } from '../constants/auth'
import { REFRESH_TOKEN_STATUS } from '../constants/refreshTokenStatus'
import { ErrorTypes } from '../models/AppError'
import type { IJwtPayload } from '../types/IJwtPayload'

export class AuthService {
  static generateAccessToken(userId: number, email?: string): string {
    const secret = process.env.JWT_SECRET || 'jwt-secret'
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h'
    const payload: IJwtPayload = {
      id: userId,
      email,
      scope: JWT_SCOPE.ACCESS,
    }

    return jwt.sign(payload, secret, {
      expiresIn,
    } as jwt.SignOptions)
  }

  static generateRefreshToken(userId: number): string {
    const secret = process.env.JWT_REFRESH_SECRET || 'jwt-refresh-secret'
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    const payload: IJwtPayload = { id: userId }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions)
  }

  static generateMfaToken(userId: number, email: string): string {
    const secret = process.env.JWT_MFA_SECRET || 'jwt-mfa-secret'
    const expiresIn = process.env.JWT_MFA_EXPIRES_IN || '10m'
    const payload: IJwtPayload = {
      id: userId,
      email,
      scope: JWT_SCOPE.MFA,
    }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions)
  }

  static async verifyAccessToken(
    token: string,
  ): Promise<jwt.JwtPayload | string | undefined> {
    const secret = process.env.JWT_SECRET || 'jwt-secret'

    try {
      const decoded = await jwt.verify(token, secret)
      return decoded
    } catch {
      throw ErrorTypes.UNAUTHORIZED('Invalid Access Token')
    }
  }

  static async verifyRefreshToken(
    token: string,
  ): Promise<jwt.JwtPayload | string | undefined> {
    const secret = process.env.JWT_REFRESH_SECRET || 'jwt-refresh-secret'

    try {
      const decoded = await jwt.verify(token, secret)
      return decoded
    } catch {
      throw ErrorTypes.UNAUTHORIZED('Invalid Refresh Token')
    }
  }

  static async verifyMfaToken(
    token: string,
  ): Promise<jwt.JwtPayload | string | undefined> {
    const secret = process.env.JWT_MFA_SECRET || 'jwt-mfa-secret'
    try {
      const decoded = await jwt.verify(token, secret)
      return decoded
    } catch {
      throw ErrorTypes.UNAUTHORIZED('Invalid MFA Token')
    }
  }

  static hashRefreshToken(token: string): string {
    const hash = crypto.createHash('sha256')
    hash.update(token)
    return hash.digest('hex')
  }

  static async storeRefreshTokenToRedis(
    userId: number,
    token: string,
    ip: string = 'Unknown',
    deviceInfo: string = 'Unknown',
  ): Promise<void> {
    const hashedToken = this.hashRefreshToken(token)
    const key = `refreshToken:${hashedToken}`
    const metadata = JSON.stringify({
      userId,
      ip,
      deviceInfo,
      status: REFRESH_TOKEN_STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    })

    const ttl = 7 * 24 * 60 * 60
    await redis.set(key, metadata, 'EX', ttl)
    await redis.sadd(`user:${userId}:refreshTokens`, hashedToken)

    await redis.expire(`user:${userId}:refreshTokens`, ttl)
  }

  static async revokeRefreshToken(token: string): Promise<void> {
    const hashedToken = this.hashRefreshToken(token)
    const key = `refreshToken:${hashedToken}`
    const metadata = await redis.get(key)

    if (metadata) {
      const parsedMetadata = JSON.parse(metadata)

      // Option 1: Delete completely (for better security)
      await redis.del(key)
      await redis.srem(
        `user:${parsedMetadata.userId}:refreshTokens`,
        hashedToken,
      )

      // Option 2: Mark as revoked (if one needs audit trail)
      // parsedMetadata.status = REFRESH_TOKEN_STATUS.REVOKED
      // parsedMetadata.revokedAt = new Date().toISOString()
      // await redis.set(key, JSON.stringify(parsedMetadata))
      // await redis.srem(`user:${parsedMetadata.userId}:refreshTokens`, hashedToken)
    }
  }

  static async revokeAllRefreshTokensForUser(userId: number): Promise<void> {
    const tokens = await redis.smembers(`user:${userId}:refreshTokens`)
    const pipeline = redis.pipeline()

    tokens.forEach((hashedToken) => {
      pipeline.del(`refreshToken:${hashedToken}`)
    })
    pipeline.del(`user:${userId}:refreshTokens`)

    await pipeline.exec()
  }

  static async validateRefreshTokenInRedis(token: string): Promise<boolean> {
    const hashedToken = this.hashRefreshToken(token)
    const key = `refreshToken:${hashedToken}`
    const metadata = await redis.get(key)

    if (!metadata) return false

    try {
      const parsedMetadata = JSON.parse(metadata)
      return parsedMetadata.status === REFRESH_TOKEN_STATUS.ACTIVE
    } catch {
      return false
    }
  }
}
