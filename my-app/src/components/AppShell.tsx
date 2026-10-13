import { useEffect, useRef, useState } from 'react'
import { Briefcase, ChevronLeft, LogOut, Menu, Plus, Search, Sprout, X } from 'lucide-react'
import { Link, NavLink, Outlet, useMatches, useNavigate, type Params } from 'react-router'
import { useAmbient, type Ambient } from '../lib/ambient'
import { useAuth } from '../lib/auth'
import { cx } from '../lib/cx'
import { useProjects, type Project } from '../lib/projects'
import { Avatar, Logo } from './ui'

/** Route `handle` that tells the shell what to show in its header. */
export type ShellHandle = {
  header: (ctx: { params: Params; getProject: (id: string | undefined) => Project | undefined }) => {
    title: string
    back?: string
  }
}

const ambients: { value: Ambient; label: string; icon: typeof Sprout }[] = [
  { value: 'personal', label: 'Personal', icon: Sprout },
  { value: 'work', label: 'Work', icon: Briefcase },
]

function AmbientSwitch() {
  const { ambient, setAmbient } = useAmbient()
  return (
    <div role="radiogroup" aria-label="Ambient" className="grid grid-cols-2 gap-1 rounded-full bg-surface-muted p-1">
      {ambients.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={ambient === value}
          onClick={() => setAmbient(value)}
          className={cx(
            'inline-flex h-8 items-center justify-center gap-1.5 rounded-full text-xs font-medium transition-colors',
            'focus-visible:outline-2 focus-visible:outline-ring',
            ambient === value ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text',
          )}
        >
          <Icon className="size-3.5" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { projects } = useProjects()

  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <div className="flex items-center justify-between">
        <Link to="/home" onClick={onClose} className="rounded-full focus-visible:outline-2 focus-visible:outline-ring">
          <Logo />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-text-muted hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
            aria-label="Close menu"
          >
            <X className="size-5" aria-hidden />
          </button>
        )}
      </div>

      <label className="relative block">
        <span className="sr-only">Search everything</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden />
        <input
          type="search"
          placeholder="Search everything"
          className="h-10 w-full rounded-full bg-surface-muted pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:outline-2 focus:outline-ring"
        />
      </label>

      <AmbientSwitch />

      <nav aria-label="Projects" className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-widest text-text-muted">Projects</p>
        {projects.length === 0 ? (
          <p className="mt-3 px-2 text-sm text-text-muted">No projects yet.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-0.5">
            {projects.map((p) => (
              <li key={p.id}>
                <NavLink
                  to={`/projects/${p.id}`}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cx(
                      'flex h-10 items-center gap-3 rounded-full px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring',
                      isActive ? 'bg-surface-muted font-medium text-text' : 'text-text hover:bg-surface-muted/60',
                    )
                  }
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} aria-hidden />
                  <span className="truncate">{p.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/projects/new"
          onClick={onClose}
          className="mt-3 inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm text-text-muted hover:bg-surface-muted hover:text-text focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Plus className="size-4" aria-hidden />
          New project
        </Link>
      </nav>

      {user && (
        <div className="flex items-center gap-3 rounded-card bg-surface p-3 shadow-soft">
          <Avatar name={user.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">{user.name}</p>
            <p className="truncate text-xs text-text-muted">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              signOut()
              navigate('/', { replace: true })
            }}
            className="grid size-9 place-items-center rounded-full text-text-muted hover:bg-surface-muted hover:text-text focus-visible:outline-2 focus-visible:outline-ring"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}

function useShellHeader() {
  const matches = useMatches()
  const { getProject } = useProjects()
  const match = [...matches].reverse().find((m) => (m.handle as ShellHandle | undefined)?.header)
  return match ? (match.handle as ShellHandle).header({ params: match.params, getProject }) : { title: 'Knot' }
}

export function AppShell() {
  const { title, back } = useShellHeader()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const drawer = useRef<HTMLDivElement>(null)

  // Escape closes the drawer; focus moves into it and back out.
  useEffect(() => {
    if (!menuOpen) return
    const button = menuButton.current
    drawer.current?.querySelector<HTMLElement>('a, button, input')?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      button?.focus()
    }
  }, [menuOpen])

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[288px_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r border-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <div className={cx('fixed inset-0 z-40 lg:hidden', !menuOpen && 'pointer-events-none')} aria-hidden={!menuOpen}>
        <div
          className={cx('absolute inset-0 bg-text/40 transition-opacity', menuOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setMenuOpen(false)}
        />
        <div
          ref={drawer}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          inert={!menuOpen}
          className={cx(
            'absolute inset-y-0 left-0 w-[min(20rem,85vw)] bg-sidebar shadow-xl transition-transform duration-200',
            menuOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <SidebarContent onClose={() => setMenuOpen(false)} />
        </div>
      </div>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-15 items-center gap-3 border-b border-border bg-sidebar/90 px-4 backdrop-blur lg:px-10">
          <button
            ref={menuButton}
            type="button"
            onClick={() => setMenuOpen(true)}
            className="grid size-10 place-items-center rounded-full text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu className="size-5" aria-hidden />
          </button>
          {back && (
            <Link
              to={back}
              className="grid size-10 place-items-center rounded-full text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
              aria-label="Back"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </Link>
          )}
          <p className="truncate font-display text-lg font-semibold text-text">{title}</p>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
