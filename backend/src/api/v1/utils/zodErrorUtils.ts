import type { ZodError, ZodIssue } from 'zod'

export interface ValidationErrorDetail {
  field: string
  message: string
  code: string
  received?: unknown
}

export const formatZodError = (error: ZodError): ValidationErrorDetail[] => {
  return error.issues.map((issue: ZodIssue) => {
    const field = issue.path.length > 0 ? issue.path.join('.') : 'root'

    return {
      field,
      message: issue.message,
      code: issue.code,
      ...('received' in issue &&
        issue.received !== undefined && { received: issue.received }),
    }
  })
}

export const isZodError = (error: unknown): error is ZodError => {
  return (
    (error as ZodError)?.name === 'ZodError' &&
    Array.isArray((error as ZodError).issues)
  )
}
