import type { HttpError } from 'http-errors'

export interface RequestWithError extends Request {
  errorContext?: {
    userId?: string
    operation?: string
    resource?: string
  }
}

export interface ErrorResponse {
  success: false
  status: 'fail' | 'error'
  message: string
  error?: string
  stack?: string
  timestamp: string
  path?: string
  method?: string
  requestId?: string
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  RATE_LIMIT = 'rate_limit',
  EXTERNAL_SERVICE = 'external_service',
  DATABASE = 'database',
  INTERNAL = 'internal',
}

export interface EnhancedError extends HttpError {
  category?: ErrorCategory
  severity?: ErrorSeverity
  context?: Record<string, unknown>
  requestId?: string
  userId?: string
}

export interface ErrorLogContext {
  message: string
  stack?: string
  url: string
  method: string
  timestamp: string
  userAgent?: string
  ip?: string
  userId?: string
  requestId?: string
  category?: ErrorCategory
  severity?: ErrorSeverity
  context?: Record<string, unknown>
}
