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
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { loginschema, type LoginInputs } from '@/schemas/auth.schema'
import { handleApiError } from '@/utils/errorHanlders'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Spinner } from '../ui/spinner'
import FormField from './FormField'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginschema),
    mode: 'onChange',
  })

  const submitLoginForm: SubmitHandler<LoginInputs> = async ({
    email,
    password,
  }) => {
    try {
      const res = await AuthService.login(email, password)

      if (res.data.success) {
        toast.success(res.data.message ?? 'Login successful!')
        navigate('/')
      }
    } catch (error) {
      handleApiError<LoginInputs>(error, setError)
      toast.error('Login failed. Please try again.')
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(submitLoginForm)}>
            <FieldSet disabled={isSubmitting}>
              <FieldGroup>
                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="johndoe@gmail.com"
                  register={register('email')}
                  error={errors.email?.message}
                />
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link
                      to="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    placeholder="****************"
                    type="password"
                    {...register('password')}
                  />
                  {errors.password?.message && (
                    <FieldDescription className="text-red-500">
                      {errors.password.message}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <Button type="submit">
                    {isSubmitting && <Spinner />}Login
                  </Button>
                  <Button variant="outline" type="button">
                    Login with Google
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{' '}
                    <Link to="/auth/register">Sign up</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldSet>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
