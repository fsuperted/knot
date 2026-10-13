import { useState, type FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'
import { AuthLayout, OrDivider } from '../components/AuthLayout'
import { Button, Field, FormError, GoogleIcon } from '../components/ui'
import { useAuth } from '../lib/auth'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { validateEmail } from '../lib/validation'

type Errors = { email?: string; password?: string; form?: string }

export default function SignIn() {
  useDocumentTitle('Sign in')
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/home'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState<'email' | 'google' | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next: Errors = {
      email: validateEmail(email),
      password: password ? undefined : 'Enter your password.',
    }
    setErrors(next)
    if (next.email || next.password) return

    setPending('email')
    const result = await signIn(email.trim(), password)
    setPending(null)
    if (result.ok) navigate(redirectTo, { replace: true })
    else setErrors({ form: result.error })
  }

  async function handleGoogle() {
    setPending('google')
    await signInWithGoogle()
    navigate(redirectTo, { replace: true })
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Everything you planned is still tied together."
      footer={
        <>
          New to Knot?{' '}
          <Link to="/signup" className="font-semibold text-primary-text hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormError>{errors.form}</FormError>
        <Field
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Field
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          action={
            <Link to="/forgot-password" className="text-xs text-text-muted hover:text-primary-text hover:underline">
              Forgot password?
            </Link>
          }
        />
        <Button type="submit" loading={pending === 'email'} disabled={pending !== null} className="mt-1 w-full">
          Sign in
          {pending !== 'email' && <ArrowRight className="size-4" aria-hidden />}
        </Button>
      </form>

      <OrDivider />

      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
        loading={pending === 'google'}
        disabled={pending !== null}
      >
        {pending !== 'google' && <GoogleIcon />}
        Continue with Google
      </Button>
    </AuthLayout>
  )
}
