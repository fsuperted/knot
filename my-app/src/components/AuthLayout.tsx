import type { ReactNode } from 'react'
import { CalendarCheck, CircleCheck, Users } from 'lucide-react'
import { Link } from 'react-router'
import { Logo } from './ui'

const highlights = [
  {
    icon: CircleCheck,
    title: 'Projects, lists, tasks',
    text: 'Three simple levels that fit a marathon plan or a product release.',
  },
  {
    icon: Users,
    title: 'Invite your people',
    text: 'Share a project and choose who coordinates and who collaborates.',
  },
  {
    icon: CalendarCheck,
    title: 'Gentle reminders',
    text: 'Due dates and priorities that keep the week honest.',
  },
]

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <main className="relative flex flex-col px-4 py-8 sm:px-10 lg:px-16">
        <Link
          to="/"
          className="self-start rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <Logo />
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-semibold text-text">{title}</h1>
          <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-text-muted">{footer}</div>}
        </div>
      </main>

      <aside className="relative hidden overflow-hidden bg-showcase lg:flex lg:items-center lg:px-16" aria-label="About Knot">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-deco-1" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 left-10 size-80 rounded-full bg-deco-2" aria-hidden />
        <div className="pointer-events-none absolute right-24 bottom-40 size-16 rounded-full bg-deco-3" aria-hidden />

        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold text-text">Tie your days together.</h2>
          <p className="mt-4 text-text-muted">
            Knot keeps personal habits and team work in the same calm place.
          </p>
          <ul className="mt-10 space-y-4">
            {highlights.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 rounded-card bg-surface/85 p-5 shadow-soft backdrop-blur">
                <Icon className="mt-0.5 size-5 shrink-0 text-primary-text" aria-hidden />
                <div>
                  <p className="font-medium text-text">{title}</p>
                  <p className="mt-1 text-sm text-text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-4 text-xs tracking-widest text-text-muted" role="separator">
      <span className="h-px flex-1 bg-border" />
      OR
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
