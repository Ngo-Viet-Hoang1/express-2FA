/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Error Handling Examples
 * Demonstrates how to use the centralized error handling system
 */

import type { NextFunction, Request, Response } from 'express'
import { AppError, ErrorTypes } from '../models/AppError.js'
import { ErrorCategory, ErrorSeverity } from '../types/error.js'
import { catchAsync } from '../utils/asyncHandler.js'

// ============================================================================
// 1. BASIC USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Using utility functions (Recommended)
 */
export const exampleValidationError = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body

    if (!email) {
      // Using utility function - simple and clean
      throw ErrorTypes.VALIDATION_ERROR('Email is required')
    }

    if (!email.includes('@')) {
      throw ErrorTypes.VALIDATION_ERROR('Invalid email format')
    }

    res.json({ message: 'Email is valid' })
  },
)

/**
 * Example 2: Using AppError directly for custom errors
 */
export const exampleCustomError = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params

    // Simulate user lookup
    const user = null // await getUserById(userId)

    if (!user) {
      // Using AppError with enhanced features
      throw new AppError(
        `User with ID ${userId} not found`,
        404,
        ErrorCategory.NOT_FOUND,
        ErrorSeverity.MEDIUM,
        { userId, operation: 'getUserProfile' },
      )
    }

    res.json({ user })
  },
)

// ============================================================================
// 2. AUTHENTICATION & AUTHORIZATION EXAMPLES
// ============================================================================

/**
 * Example 3: Authentication errors
 */
export const exampleAuthError = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      throw ErrorTypes.UNAUTHORIZED('Access token is required')
    }

    // Simulate token validation
    const isValidToken = false
    if (!isValidToken) {
      throw ErrorTypes.UNAUTHORIZED('Invalid or expired token')
    }

    res.json({ message: 'Authenticated successfully' })
  },
)

/**
 * Example 4: Permission errors
 */
export const examplePermissionError = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params
    // const currentUser = req.user // Assuming user is attached to request

    // Simulate permission check
    const hasPermission = false
    if (!hasPermission) {
      throw new AppError(
        'Insufficient permissions to access this resource',
        403,
        ErrorCategory.AUTHORIZATION,
        ErrorSeverity.HIGH,
        { userId, operation: 'deleteUser', requiredRole: 'admin' },
      )
    }

    res.json({ message: 'Permission granted' })
  },
)

// ============================================================================
// 3. BUSINESS LOGIC EXAMPLES
// ============================================================================

/**
 * Example 5: Conflict errors (duplicate resources)
 */
export const exampleConflictError = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body

    // Simulate email existence check
    const emailExists = true
    if (emailExists) {
      throw ErrorTypes.CONFLICT(`User with email ${email} already exists`)
    }

    res.json({ message: 'User created successfully' })
  },
)

/**
 * Example 6: Database errors with context
 */
export const exampleDatabaseError = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Simulate database operation
      throw new Error('Connection timeout')
    } catch (dbError) {
      throw new AppError(
        'Database operation failed',
        500,
        ErrorCategory.DATABASE,
        ErrorSeverity.CRITICAL,
        {
          operation: 'createUser',
          table: 'users',
          originalError: (dbError as Error).message,
        },
      )
    }
  },
)

// ============================================================================
// 4. EXTERNAL SERVICE EXAMPLES
// ============================================================================

/**
 * Example 7: External API errors
 */
export const exampleExternalServiceError = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Simulate external API call
      // const response = await fetch('https://api.external.com/data')
      throw new Error('Service temporarily unavailable')
    } catch (apiError) {
      throw new AppError(
        'External service is currently unavailable',
        503,
        ErrorCategory.EXTERNAL_SERVICE,
        ErrorSeverity.HIGH,
        {
          service: 'PaymentGateway',
          operation: 'processPayment',
          retryAfter: '300', // seconds
          originalError: (apiError as Error).message,
        },
      )
    }
  },
)

// ============================================================================
// 5. INPUT VALIDATION EXAMPLES
// ============================================================================

/**
 * Example 8: Complex validation with multiple errors
 */
export const exampleComplexValidation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, age, password } = req.body
    const errors: string[] = []

    // Collect all validation errors
    if (!name || name.length < 2) {
      errors.push('Name must be at least 2 characters long')
    }

    if (!email || !email.includes('@')) {
      errors.push('Valid email address is required')
    }

    if (!age || age < 18) {
      errors.push('Age must be 18 or older')
    }

    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    // If there are validation errors, throw a single error with all details
    if (errors.length > 0) {
      throw new AppError(
        'Validation failed',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        {
          validationErrors: errors,
          receivedData: { name, email, age: age ? 'provided' : 'missing' },
        },
      )
    }

    res.json({ message: 'Validation passed' })
  },
)

// ============================================================================
// 6. ASYNC OPERATION EXAMPLES
// ============================================================================

/**
 * Example 9: File upload errors
 */
export const exampleFileUploadError = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Simulate file validation
    const file = req.file

    if (!file) {
      throw ErrorTypes.VALIDATION_ERROR('File is required')
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new AppError(
        'File size exceeds maximum limit',
        413,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        {
          maxSize: '5MB',
          receivedSize: `${Math.round(file.size / 1024 / 1024)}MB`,
          filename: file.originalname,
        },
      )
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError(
        'Invalid file type',
        415,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        {
          allowedTypes,
          receivedType: file.mimetype,
          filename: file.originalname,
        },
      )
    }

    res.json({ message: 'File uploaded successfully' })
  },
)

// ============================================================================
// 7. RATE LIMITING EXAMPLE
// ============================================================================

/**
 * Example 10: Rate limiting simulation
 */
export const exampleRateLimitError = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Simulate rate limit check
    const requestCount = 101 // Simulate exceeding limit
    const limit = 100

    if (requestCount > limit) {
      throw new AppError(
        'Rate limit exceeded',
        429,
        ErrorCategory.RATE_LIMIT,
        ErrorSeverity.LOW,
        {
          limit,
          current: requestCount,
          resetTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour
          retryAfter: 3600, // seconds
        },
      )
    }

    res.json({ message: 'Request processed successfully' })
  },
)

// ============================================================================
// 8. USAGE GUIDELINES
// ============================================================================

/**
 * BEST PRACTICES:
 *
 * 1. Use utility functions for common errors (recommended):
 *    - createValidationError()
 *    - createAuthError()
 *    - createNotFoundError()
 *    - createConflictError()
 *
 * 2. Use AppError directly for complex custom errors with:
 *    - Specific categories and severity levels
 *    - Rich context information
 *    - Custom status codes
 *
 * 3. Always wrap async functions with catchAsync()
 *
 * 4. Include meaningful context in error objects:
 *    - Operation being performed
 *    - Resource identifiers
 *    - User information (when relevant)
 *    - Original error details (for debugging)
 *
 * 5. Use appropriate error categories:
 *    - VALIDATION: Input validation errors
 *    - AUTHENTICATION: Auth/login errors
 *    - AUTHORIZATION: Permission errors
 *    - NOT_FOUND: Resource not found
 *    - CONFLICT: Duplicate/conflict errors
 *    - EXTERNAL_SERVICE: Third-party API errors
 *    - DATABASE: Database operation errors
 *    - INTERNAL: Unexpected server errors
 *
 * 6. Set appropriate severity levels:
 *    - LOW: Minor issues (rate limits, etc.)
 *    - MEDIUM: Standard errors (validation, not found)
 *    - HIGH: Security or permission issues
 *    - CRITICAL: System failures, database errors
 */
