import { ListChecks, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { PriorityChip, ScheduleChips } from '../components/project/ProjectBits'
import { tint } from '../lib/projectDisplay'
import { useAmbient } from '../lib/ambient'
import { useAuth } from '../lib/auth'
import { useProjects, type Project } from '../lib/projects'
import { useDocumentTitle } from '../lib/useDocumentTitle'

function greeting(date: Date) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const examples = {
  personal: '“Physical activity”, “Groceries”, “Plants”',
  work: '“Sprint 14”, “Equipment reviews”, “Onboarding”',
}

const primaryLink =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-on-primary shadow-sm hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

function EmptyIllustration() {
  return (
    <div className="relative mx-auto size-36" aria-hidden>
      <div className="absolute inset-4 rounded-full bg-primary-soft" />
      <div className="absolute right-1 top-1 size-11 rounded-full bg-deco-2" />
      <div className="absolute bottom-3 left-0 size-8 rounded-full bg-deco-1" />
      <svg viewBox="0 0 40 40" className="absolute inset-0 m-auto size-12 text-primary" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 11l3 3 5-6M6 25l3 3 5-6M19 11h15M19 18h11M19 25h15M19 32h11" />
      </svg>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const cover = project.images[0]
  return (
    <li>
      <Link
        to={`/projects/${project.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-card bg-surface shadow-soft transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {cover ? (
          <img src={cover.src} alt="" className="aspect-[16/7] w-full object-cover" />
        ) : (
          <div className="aspect-[16/7] w-full" style={tint(project.color, 22)} aria-hidden />
        )}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: project.color }} aria-hidden />
            <h3 className="truncate text-lg font-semibold text-text group-hover:underline">{project.name}</h3>
          </div>
          {project.description && <p className="line-clamp-2 text-sm text-text-muted">{project.description}</p>}
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
            <PriorityChip priority={project.priority} />
            <ScheduleChips project={project} compact />
            {project.fields.length > 0 && (
              <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-surface-muted px-2.5 text-xs text-text">
                <ListChecks className="size-3.5 text-text-muted" aria-hidden />
                {project.fields.length} field{project.fields.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  )
}

export default function Home() {
  useDocumentTitle('Home')
  const { user } = useAuth()
  const { ambient } = useAmbient()
  const { projects } = useProjects()
  const now = new Date()
  const firstName = user?.name.split(' ')[0] ?? ''

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm text-text-muted">
        {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold text-text sm:text-4xl">
          {greeting(now)}, {firstName}
        </h1>
        <Link to="/projects/new" className={primaryLink}>
          <Plus className="size-4" aria-hidden />
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <section
          aria-labelledby="empty-title"
          className="mt-10 rounded-card bg-surface px-6 py-12 text-center shadow-soft sm:px-12"
        >
          <EmptyIllustration />
          <h2 id="empty-title" className="mt-6 text-2xl font-semibold text-text">
            Create your first project
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-muted">
            A project can be anything: {examples[ambient]}. Inside it you add lists, and inside lists your tasks.
          </p>
          <Link to="/projects/new" className={`${primaryLink} mt-6`}>
            <Plus className="size-4" aria-hidden />
            New project
          </Link>
        </section>
      ) : (
        <section aria-labelledby="projects-title" className="mt-10">
          <h2 id="projects-title" className="text-lg font-semibold text-text">
            Your projects
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
            <li>
              <Link
                to="/projects/new"
                className="flex h-full min-h-48 flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-border text-sm font-medium text-text-muted hover:border-primary/50 hover:text-primary-text focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Plus className="size-5" aria-hidden />
                New project
              </Link>
            </li>
          </ul>
        </section>
      )}
    </div>
  )
}
