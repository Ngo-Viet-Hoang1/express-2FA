import jwt from 'jsonwebtoken'
import { JWT_SCOPE } from '../constants/auth'
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
}
