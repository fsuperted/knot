import { useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { AuthLayout, OrDivider } from '../components/AuthLayout'
import { Button, Field, FormError, GoogleIcon } from '../components/ui'
import { useAuth } from '../lib/auth'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { MIN_PASSWORD_LENGTH, validateEmail, validateNewPassword } from '../lib/validation'

type Values = { name: string; email: string; password: string; confirm: string }
type Errors = Partial<Record<keyof Values | 'form', string>>

function validate(values: Values): Errors {
  return {
    name: values.name.trim() ? undefined : 'Tell us what to call you.',
    email: validateEmail(values.email),
    password: validateNewPassword(values.password),
    confirm: !values.confirm
      ? 'Repeat your password.'
      : values.confirm !== values.password
        ? 'Passwords don’t match.'
        : undefined,
  }
}

export default function SignUp() {
  useDocumentTitle('Create account')
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState<Values>({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState<'email' | 'google' | null>(null)

  const update = (key: keyof Values) => (e: ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    // Clear a field's error as soon as the user edits it.
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next = validate(values)
    setErrors(next)
    if (Object.values(next).some(Boolean)) return

    setPending('email')
    const result = await signUp(values.name.trim(), values.email.trim(), values.password)
    setPending(null)
    if (result.ok) navigate('/home', { replace: true })
    else setErrors({ form: result.error })
  }

  async function handleGoogle() {
    setPending('google')
    await signInWithGoogle()
    navigate('/home', { replace: true })
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start with one project. Tie the rest in as you go."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/" className="font-semibold text-primary-text hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormError>{errors.form}</FormError>
        <Field
          label="Name"
          name="name"
          autoComplete="name"
          placeholder="Alex Morgan"
          value={values.name}
          onChange={update('name')}
          error={errors.name}
        />
        <Field
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={update('email')}
          error={errors.email}
        />
        <Field
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          value={values.password}
          onChange={update('password')}
          error={errors.password}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        />
        <Field
          label="Confirm password"
          type="password"
          name="confirm"
          autoComplete="new-password"
          value={values.confirm}
          onChange={update('confirm')}
          error={errors.confirm}
        />
        <Button type="submit" loading={pending === 'email'} disabled={pending !== null} className="mt-1 w-full">
          Create account
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
        Sign up with Google
      </Button>
    </AuthLayout>
  )
}
