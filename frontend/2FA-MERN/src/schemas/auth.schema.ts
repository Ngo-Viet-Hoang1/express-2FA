import { z } from 'zod'

export const emailSchema = z
  .email()
  .min(5, 'Email must be at least 5 characters')
  .max(254, 'Email must be less than 254 characters')
  .toLowerCase()
  .trim()

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
  .regex(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
  .regex(/^(?=.*\d)/, 'Password must contain at least one number')
  .regex(
    /^(?=.*[@$!%*?&])/,
    'Password must contain at least one special character (@$!%*?&)',
  )

export const registerSchema = z
  .object({
    username: z.string().trim(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .trim()
      .min(1, { message: 'Confirm Password is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignUpInputs = z.infer<typeof registerSchema>
