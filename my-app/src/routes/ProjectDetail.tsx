import { Bell, BellRing, ExternalLink, ListChecks, Mail, MessageCircle, Pencil, Plus, Target } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { PriorityChip, ScheduleChips } from '../components/project/ProjectBits'
import { tint } from '../lib/projectDisplay'
import { useToast } from '../components/Toast'
import { Avatar } from '../components/ui'
import { useAuth } from '../lib/auth'
import { fieldTypeById, type CustomField } from '../lib/fieldTypes'
import { useProjects, type Project } from '../lib/projects'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const leadLabels: Record<Project['notifications']['lead'], string> = {
  'at-time': 'at the time',
  '15m': '15 min before',
  '1h': '1 hour before',
  '1d': '1 day before',
}

export function ProjectMissing() {
  return (
    <div className="mx-auto max-w-md rounded-card bg-surface p-8 text-center shadow-soft">
      <h1 className="text-xl font-semibold text-text">This project isn’t here</h1>
      <p className="mt-2 text-sm text-text-muted">It may have been deleted, or the link is wrong.</p>
      <Link
        to="/home"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-on-primary hover:bg-primary-hover"
      >
        Back to home
      </Link>
    </div>
  )
}

function describeField(field: CustomField) {
  const def = fieldTypeById[field.type]
  const parts = [def.label]
  if (field.unit) parts.push(field.unit)
  if (field.type === 'pace' && field.autoCalculate) parts.push('auto')
  return parts.join(' · ')
}

function goalText(field: CustomField) {
  if (!field.goal) return null
  const unit = field.type === 'percentage' ? '%' : field.unit ? ` ${field.unit}` : ''
  return `${field.goal.direction === 'at-least' ? 'At least' : 'At most'} ${field.goal.target}${unit}`
}

export default function ProjectDetail() {
  const { projectId } = useParams()
  const { getProject } = useProjects()
  const { user } = useAuth()
  const toast = useToast()
  const project = getProject(projectId)
  useDocumentTitle(project?.name ?? 'Project not found')

  if (!project) return <ProjectMissing />

  const n = project.notifications
  const channels = [
    n.push && { icon: BellRing, label: 'Push' },
    n.email && { icon: Mail, label: 'Email' },
    n.whatsapp && { icon: MessageCircle, label: 'WhatsApp' },
  ].filter(Boolean) as { icon: typeof Bell; label: string }[]

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-card p-6 shadow-soft sm:p-8" style={tint(project.color, 16)}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-surface/80 px-2.5 text-xs font-medium text-text">
              <span className="size-2 rounded-full" style={{ backgroundColor: project.color }} aria-hidden />
              Personal project
            </span>
            <h1 className="mt-3 text-3xl font-semibold break-words text-text sm:text-4xl">{project.name}</h1>
            {project.description && <p className="mt-2 max-w-2xl text-text-muted">{project.description}</p>}
          </div>
          <Link
            to={`/projects/${project.id}/edit`}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-surface px-4 text-sm font-medium text-text shadow-sm hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Pencil className="size-4" aria-hidden />
            Edit
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <PriorityChip priority={project.priority} />
          <ScheduleChips project={project} />
          {channels.length > 0 && (
            <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-surface-muted px-2.5 text-xs text-text">
              <Bell className="size-3.5 text-text-muted" aria-hidden />
              {channels.map((c) => c.label).join(', ')} · {leadLabels[n.lead]}
            </span>
          )}
        </div>

        {(project.tags.length > 0 || project.link) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {project.tags.map((t) => (
              <span key={t} className="rounded-full bg-surface/70 px-2.5 py-0.5 text-xs text-text-muted">
                #{t}
              </span>
            ))}
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-primary-text hover:underline"
              >
                <ExternalLink className="size-3.5" aria-hidden />
                {new URL(project.link).hostname.replace(/^www\./, '')}
              </a>
            )}
          </div>
        )}
      </section>

      {/* Lists (next iteration) */}
      <section aria-labelledby="lists-title">
        <div className="flex items-center justify-between gap-4">
          <h2 id="lists-title" className="text-lg font-semibold text-text">
            Lists
          </h2>
        </div>
        <div className="mt-3 flex flex-col items-center gap-3 rounded-card border-2 border-dashed border-border px-6 py-10 text-center">
          <ListChecks className="size-8 text-primary-text" aria-hidden />
          <p className="font-medium text-text">Add your first list</p>
          <p className="max-w-sm text-sm text-text-muted">
            Lists group the tasks of a project — like “Weekly runs” or “Race day”. Each task can record the custom fields
            below.
          </p>
          <button
            type="button"
            onClick={() => toast('Lists and tasks come in the next step of the prototype.')}
            className="mt-1 inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Plus className="size-4" aria-hidden />
            New list
          </button>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Custom fields */}
        <section aria-labelledby="fields-title">
          <h2 id="fields-title" className="text-lg font-semibold text-text">
            Custom fields
          </h2>
          {project.fields.length === 0 ? (
            <div className="mt-3 rounded-card bg-surface p-6 text-sm text-text-muted shadow-soft">
              No custom fields.{' '}
              <Link to={`/projects/${project.id}/edit`} className="font-medium text-primary-text hover:underline">
                Add some
              </Link>{' '}
              to track distance, prices, dates and more.
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-border rounded-card bg-surface px-5 shadow-soft">
              {project.fields.map((field) => {
                const Icon = fieldTypeById[field.type].icon
                const goal = goalText(field)
                return (
                  <li key={field.id} className="flex items-start gap-3 py-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-text" aria-hidden>
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text">{field.label}</p>
                      <p className="text-xs text-text-muted">{describeField(field)}</p>
                      {field.options && field.options.length > 0 && (
                        <p className="mt-1 truncate text-xs text-text-muted">{field.options.join(' · ')}</p>
                      )}
                    </div>
                    {goal && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs text-text">
                        <Target className="size-3.5 text-primary-text" aria-hidden />
                        {goal}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-8">
          {/* Images */}
          {project.images.length > 0 && (
            <section aria-labelledby="images-title">
              <h2 id="images-title" className="text-lg font-semibold text-text">
                Images
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {project.images.map((image, i) => (
                  <img
                    key={image.id}
                    src={image.src}
                    alt={image.name}
                    className={i === 0 ? 'col-span-3 aspect-[16/9] w-full rounded-3xl object-cover' : 'aspect-square w-full rounded-2xl object-cover'}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Members */}
          <section aria-labelledby="members-title">
            <h2 id="members-title" className="text-lg font-semibold text-text">
              Members
            </h2>
            <div className="mt-3 flex items-center gap-3 rounded-card bg-surface p-4 shadow-soft">
              <Avatar name={user?.name ?? 'You'} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text">You</p>
                <p className="truncate text-xs text-text-muted">{user?.email}</p>
              </div>
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-on-primary">Owner</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
