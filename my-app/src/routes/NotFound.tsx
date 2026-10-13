import { Link } from 'react-router'
import { Logo } from '../components/ui'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-card bg-surface p-8 text-center shadow-soft">
        <Logo className="justify-center" />
        <h1 className="mt-6 text-2xl font-semibold text-text">This page isn’t here</h1>
        <p className="mt-2 text-sm text-text-muted">The link may be broken, or the page may have moved.</p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-on-primary hover:bg-primary-hover"
        >
          Back to Knot
        </Link>
      </div>
    </main>
  )
}
