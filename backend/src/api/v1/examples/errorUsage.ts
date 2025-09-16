/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Error Handling Usage Guide
 * Simple examples for using the centralized error system
 */

import type { Request, Response } from 'express'
import { AppError, ErrorTypes } from '../models/AppError.js'
import { ErrorCategory, ErrorSeverity } from '../types/error.js'
import { catchAsync } from '../utils/asyncHandler.js'

// ============================================================================
// QUICK REFERENCE - Common Error Patterns
// ============================================================================

/**
 * 1. VALIDATION ERRORS
 */
export const validationExample = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body

    if (!email) {
      throw ErrorTypes.VALIDATION_ERROR('Email is required')
    }

    res.json({ success: true })
  },
)

/**
 * 2. AUTHENTICATION ERRORS
 */
export const authExample = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization

  if (!token) {
    throw ErrorTypes.UNAUTHORIZED('Access token is required')
  }

  res.json({ success: true })
})

/**
 * 3. NOT FOUND ERRORS
 */
export const notFoundExample = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params
    // const user = await getUserById(userId) // Simulate DB call

    const user = null // Simulate not found
    if (!user) {
      throw ErrorTypes.NOT_FOUND(`User with ID ${userId} not found`)
    }

    res.json({ user })
  },
)

/**
 * 4. CONFLICT ERRORS (Duplicate resources)
 */
export const conflictExample = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body
    // const existingUser = await findUserByEmail(email)

    const existingUser = true // Simulate duplicate
    if (existingUser) {
      throw ErrorTypes.CONFLICT(`User with email ${email} already exists`)
    }

    res.json({ success: true })
  },
)

/**
 * 5. CUSTOM ERRORS with Enhanced Context
 */
export const customErrorExample = catchAsync(
  async (req: Request, res: Response) => {
    // Business logic that requires custom error with context
    throw new AppError(
      'Payment processing failed',
      402, // Payment Required
      ErrorCategory.EXTERNAL_SERVICE,
      ErrorSeverity.HIGH,
      {
        paymentMethod: 'credit_card',
        amount: 99.99,
        currency: 'USD',
        merchantId: 'merchant_123',
      },
    )
  },
)

// ============================================================================
// ERROR RESPONSE EXAMPLES
// ============================================================================

/**
 * Standard Error Response Format:
 * {
 *   "success": false,
 *   "status": "fail" | "error",
 *   "message": "Error description",
 *   "requestId": "uuid-string",
 *   "path": "/api/users",
 *   "method": "POST",
 *   "timestamp": "2024-01-01T00:00:00.000Z",
 *   "category": "validation", // Optional: for AppError
 *   "severity": "medium",     // Optional: for AppError
 *   // Development only:
 *   "error": "Detailed error message",
 *   "stack": "Error stack trace"
 * }
 */

// ============================================================================
// USAGE GUIDELINES
// ============================================================================

/**
 * QUICK TIPS:
 *
 * ✅ DO:
 * - Always wrap async route handlers with catchAsync()
 * - Use utility functions for common errors
 * - Include meaningful error messages
 * - Add context for debugging in AppError
 *
 * ❌ DON'T:
 * - Use generic "Something went wrong" messages
 * - Expose sensitive information in error messages
 * - Forget to set appropriate HTTP status codes
 * - Skip error context for complex operations
 *
 * COMMON HTTP STATUS CODES:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (authentication required)
 * - 403: Forbidden (insufficient permissions)
 * - 404: Not Found (resource doesn't exist)
 * - 409: Conflict (duplicate resource)
 * - 422: Unprocessable Entity (semantic errors)
 * - 429: Too Many Requests (rate limiting)
 * - 500: Internal Server Error (unexpected errors)
 */
