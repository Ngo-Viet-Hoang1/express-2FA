import prisma from '../config/database'
import type { User } from '@/generated/prisma'
import { Prisma } from '@/generated/prisma'
import logger from '../config/logger'

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
  twoFactorSecret?: string
  lastLoginAt?: Date
}

export class UserService {
  static async createUser(data: CreateUserInput): Promise<User> {
    try {
      return await prisma.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          password: data.password,
          name: data.name?.trim(),
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Email already exists')
        }
      }
      logger.error('Error creating user:', error)
      throw new Error('Failed to create user')
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      })
    } catch (error) {
      logger.error('Error finding user by email:', error)
      throw new Error('Failed to find user')
    }
  }

  static async findById(id: number): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
      })
    } catch (error) {
      logger.error('Error finding user by ID:', error)
      throw new Error('Failed to find user')
    }
  }

  static async updateUser(id: number, data: UpdateUserInput): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('User not found')
        }
      }
      logger.error('Error updating user:', error)
      throw new Error('Failed to update user')
    }
  }

  static async updateLastLogin(id: number): Promise<void> {
    try {
      await prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() },
      })
    } catch (error) {
      logger.error('Error updating last login:', error)
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
          throw new Error('User not found')
        }
      }
      logger.error('Error deleting user:', error)
      throw new Error('Failed to delete user')
    }
  }
}
