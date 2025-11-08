import AuthService from '@/api/services/auth.service'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSet,
} from '@/components/ui/field'
import { AxiosError } from 'axios'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Spinner } from '../ui/spinner'
import FormField from './FormField'

export interface SignUpInputs {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInputs>()

  const onSubmit: SubmitHandler<SignUpInputs> = async ({
    username,
    email,
    password,
  }) => {
    try {
      const res = await AuthService.register(email!, password!, username!)
      if (res?.data?.success) {
        toast.success('Registration successful! Please log in.')
        navigate('/auth/login')
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach((field) => {
          setError(field as keyof SignUpInputs, {
            message: error.response?.data.errors[field],
          })
        })
        toast.error(error.response.data.message || 'Registration failed. ')
      } else {
        toast.error('Registration failed. Please try again.')
      }
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet disabled={isSubmitting}>
            <FieldGroup>
              <FormField
                id="full-name"
                label="Full Name"
                type="text"
                placeholder="John Doe"
                register={register('username')}
                error={errors.username?.message}
              />
              <FormField
                id="email"
                label="Email"
                type="email"
                placeholder="m@example.com"
                register={register('email', { required: 'Email is required' })}
                error={errors.email?.message}
                description="We'll use this to contact you. We will not share your email with anyone else."
              />
              <FormField
                id="password"
                label="Password"
                type="password"
                register={register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long',
                  },
                })}
                description="Must be at least 8 characters long."
                error={errors.password?.message}
              />
              <FormField
                id="confirm-password"
                label="Confirm Password"
                type="password"
                register={register('confirmPassword', {
                  required: 'Confirm Password is required',
                  validate: (value) =>
                    value === watch('password') || 'Passwords do not match',
                })}
                description="Please confirm your password."
                error={errors.confirmPassword?.message}
              />
              <FieldGroup>
                <Field>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Spinner />}Create Account
                  </Button>
                  <Button variant="outline" type="button">
                    Sign up with Google
                  </Button>
                  <FieldDescription className="px-6 text-center">
                    Already have an account?{' '}
                    <Link to="/auth/login">Sign in</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
    </Card>
  )
}
