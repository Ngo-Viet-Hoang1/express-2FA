import type { User } from '@/generated/prisma'
import { Prisma } from '@/generated/prisma'
import prisma from '../config/database'
import logger from '../config/logger'
import { ErrorTypes } from '../models/AppError'
import { PasswordUtils } from '../utils/passwordUtils'

export interface CreateUserInput {
  email: string
  password: string
  name?: string
}

export interface UpdateUserInput {
  name?: string
  emailVerified?: boolean
  isActive?: boolean
  isMfaActive?: boolean
  twoFactorSecret?: string | null
  lastLoginAt?: Date
}

export class UserService {
  static async createUser(data: CreateUserInput): Promise<User> {
    try {
      const hashedPassword = await PasswordUtils.hashPassword(data.password)
      // Maybe validate email with bloom filter or Redis set

      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          password: hashedPassword,
          name: data.name?.trim(),
        },
      })

      return user
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[]
          if (target?.includes('email')) {
            throw ErrorTypes.CONFLICT('Email already exists')
          }
          throw ErrorTypes.CONFLICT('Resource already exists')
        }

        // Chỉ log Prisma error details để debug, không log general error
        logger.debug('Prisma error creating user:', {
          code: error.code,
          message: error.message,
          meta: error.meta,
        })
        throw ErrorTypes.INTERNAL_ERROR(
          'Failed to create user due to database constraint',
        )
      }

      throw ErrorTypes.INTERNAL_ERROR(
        'An unexpected error occurred while creating user',
      )
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      })
    } catch {
      throw ErrorTypes.INTERNAL_ERROR('Failed to find user')
    }
  }

  static async findByEmailForAuth(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: {
          email: email.toLowerCase().trim(),
          isActive: true,
        },
      })
    } catch {
      throw ErrorTypes.INTERNAL_ERROR('Failed to find user for authentication')
    }
  }

  static async findByEmailPublic(
    email: string,
  ): Promise<Omit<User, 'password' | 'twoFactorSecret'> | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      })

      if (!user) return null

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, twoFactorSecret, ...publicUser } = user
      return publicUser
    } catch {
      throw ErrorTypes.INTERNAL_ERROR('Failed to find user')
    }
  }

  static async findById(id: number): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
      })
    } catch {
      throw ErrorTypes.INTERNAL_ERROR('Failed to find user by ID')
    }
  }

  static async findByIdPublic(
    id: number,
  ): Promise<Omit<User, 'password' | 'twoFactorSecret'> | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      })

      if (!user) return null

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, twoFactorSecret, ...publicUser } = user
      return publicUser
    } catch {
      throw ErrorTypes.INTERNAL_ERROR('Failed to find user by ID')
    }
  }

  static async updateUser(
    id: number,
    data: UpdateUserInput,
  ): Promise<Omit<User, 'password' | 'twoFactorSecret'>> {
    try {
      return await prisma.user.update({
        where: { id },
        data,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw ErrorTypes.NOT_FOUND('User not found')
        }
        if (error.code === 'P2002') {
          throw ErrorTypes.CONFLICT('Update would create duplicate resource')
        }
      }
      throw ErrorTypes.INTERNAL_ERROR('Failed to update user')
    }
  }

  static async updateLastLogin(id: number): Promise<void> {
    try {
      await prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() },
      })
    } catch {
      throw ErrorTypes.INTERNAL_ERROR('Failed to update last login')
    }
  }

  static async deleteUser(id: number): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data: { isActive: false },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw ErrorTypes.NOT_FOUND('User not found')
        }
      }

      throw ErrorTypes.INTERNAL_ERROR('Failed to delete user')
    }
  }

  static async getTwoFactorSecretByUserId(
    id: number,
  ): Promise<string | null | undefined> {
    try {
      const user = await UserService.findById(id)
      return user?.twoFactorSecret
    } catch {
      throw ErrorTypes.INTERNAL_ERROR(
        'Failed to get two factor secret by userId',
      )
    }
  }
}
