import { useState, type FormEvent } from 'react'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { Link } from 'react-router'
import { AuthLayout } from '../components/AuthLayout'
import { Button, Field } from '../components/ui'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { validateEmail } from '../lib/validation'

export default function ForgotPassword() {
  useDocumentTitle('Reset password')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const [sentTo, setSentTo] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const problem = validateEmail(email)
    setError(problem)
    if (!problem) setSentTo(email.trim())
  }

  const backLink = (
    <Link to="/" className="inline-flex items-center gap-1.5 font-semibold text-primary-text hover:underline">
      <ArrowLeft className="size-4" aria-hidden />
      Back to sign in
    </Link>
  )

  if (sentTo) {
    return (
      <AuthLayout title="Check your inbox" subtitle="If an account exists, a reset link is on its way." footer={backLink}>
        <div role="status" className="flex items-start gap-4 rounded-card bg-surface p-5 shadow-soft">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-primary-text" aria-hidden />
          <p className="text-sm text-text-muted">
            We sent instructions to <span className="font-medium text-text">{sentTo}</span>. This is a prototype, so no
            email will actually arrive.
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we’ll send you a reset link." footer={backLink}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Field
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  )
}
