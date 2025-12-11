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
import { registerSchema, type SignUpInputs } from '@/schemas/auth.schema'
import { handleApiError } from '@/utils/errorHanlders'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Spinner } from '../ui/spinner'
import FormField from './FormField'

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    trigger,
    watch,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<SignUpInputs>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  })

  const password = watch('password')

  useEffect(() => {
    const { confirmPassword } = touchedFields
    if (confirmPassword) {
      trigger('confirmPassword')
    }
  }, [password, trigger, touchedFields])

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
      handleApiError<SignUpInputs>(error, setError)
      toast.error('Registration failed. Please try again.')
    }
  }

  const handleGoogleRegister = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/login/federated/google`
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
            <FieldGroup className="gap-3">
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
                register={register('email')}
                error={errors.email?.message}
                description="We'll use this to contact you. We will not share your email with anyone else."
              />
              <FormField
                id="password"
                label="Password"
                type="password"
                register={register('password')}
                description="Must be at least 8 characters long."
                error={errors.password?.message}
              />
              <FormField
                id="confirm-password"
                label="Confirm Password"
                type="password"
                register={register('confirmPassword')}
                description="Please confirm your password."
                error={errors.confirmPassword?.message}
              />
              <FieldGroup>
                <Field>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Spinner />}Create Account
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleGoogleRegister}
                  >
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
