import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  Bell,
  BellRing,
  CalendarDays,
  Flag,
  ImagePlus,
  ListChecks,
  Mail,
  MessageCircle,
  Pencil,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import { Link, useBlocker } from 'react-router'
import { useAuth } from '../../lib/auth'
import { cx } from '../../lib/cx'
import { parseDay } from '../../lib/dates'
import { fieldErrorId, fieldTypeById } from '../../lib/fieldTypes'
import { describedBy, inputClass } from '../../lib/formStyles'
import type { ProjectDraft, Repeat, ReminderLead } from '../../lib/projects'
import { FieldShell, FormSection, Select, SwitchRow, TextArea } from '../form'
import { Button } from '../ui'
import { useToast } from '../Toast'
import { CustomFieldsEditor } from './CustomFieldsEditor'
import { DatePicker } from './DatePicker'
import { ImageUploader } from './ImageUploader'
import { ColorPicker, PriorityPicker } from './Pickers'
import { TagInput } from './TagInput'

type Errors = Record<string, string | undefined>

const NAME_MAX = 60
const DESCRIPTION_MAX = 280

const repeatOptions: { value: Repeat; label: string }[] = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
  { value: 'yearly', label: 'Every year' },
]

const leadOptions: { value: ReminderLead; label: string }[] = [
  { value: 'at-time', label: 'At the time' },
  { value: '15m', label: '15 minutes before' },
  { value: '1h', label: '1 hour before' },
  { value: '1d', label: '1 day before' },
]

const sections = [
  { id: 'basics', label: 'Basics' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'priority', label: 'Priority' },
  { id: 'reminders', label: 'Reminders' },
  { id: 'images', label: 'Images' },
  { id: 'fields', label: 'Custom fields' },
]

const withProtocol = (url: string) => (url && !/^https?:\/\//i.test(url) ? `https://${url}` : url)

function isValidUrl(url: string) {
  try {
    const parsed = new URL(withProtocol(url))
    return parsed.hostname.includes('.')
  } catch {
    return false
  }
}

const TIME_PATTERN = /^\d{1,2}(:\d{2}){0,2}$/

function validate(d: ProjectDraft): Errors {
  const errors: Errors = {}
  if (!d.name.trim()) errors['project-name'] = 'Give your project a name.'
  if (d.link.trim() && !isValidUrl(d.link.trim())) errors['project-link'] = 'Enter a valid address, like example.com/page.'
  if (d.startDate && d.dueDate && parseDay(d.dueDate)! < parseDay(d.startDate)!) {
    errors['project-due'] = 'The due date can’t be before the start date.'
  }
  const { push, email, whatsapp, whatsappNumber } = d.notifications
  if ((push || email || whatsapp) && !d.startDate && !d.dueDate && d.repeat === 'none') {
    errors['project-due'] ??= 'Add a date or a repeat so Knot knows when to remind you.'
  }
  if (whatsapp) {
    const digits = whatsappNumber.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15) errors['whatsapp-number'] = 'Enter the number with country and area code.'
  }

  const seen = new Set<string>()
  for (const field of d.fields) {
    const label = field.label.trim().toLowerCase()
    if (!label) errors[fieldErrorId(field.id, 'label')] = 'Name this field.'
    else if (seen.has(label)) errors[fieldErrorId(field.id, 'label')] = 'Another field already has this name.'
    seen.add(label)

    const def = fieldTypeById[field.type]
    if (def.options) {
      const filled = (field.options ?? []).filter((o) => o.trim()).length
      const min = field.type === 'choice' ? 2 : 1
      if (filled < min) errors[fieldErrorId(field.id, 'options')] = field.type === 'choice' ? 'Add at least two options.' : 'Add at least one item.'
    }
    if (field.goal) {
      const target = field.goal.target.trim()
      const timeLike = field.type === 'duration' || field.type === 'pace'
      if (!target) errors[fieldErrorId(field.id, 'goal')] = 'Enter a goal value, or turn the goal off.'
      else if (timeLike ? !TIME_PATTERN.test(target) : Number.isNaN(Number(target.replace(',', '.'))))
        errors[fieldErrorId(field.id, 'goal')] = timeLike ? 'Use a time like 5:00 or 0:30:00.' : 'Use a number.'
    }
  }
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v))
}

/** Trim text, drop empty options and normalise the link before saving. */
function clean(d: ProjectDraft): ProjectDraft {
  return {
    ...d,
    name: d.name.trim(),
    description: d.description.trim(),
    link: withProtocol(d.link.trim()),
    fields: d.fields.map((f) => ({
      ...f,
      label: f.label.trim(),
      unit: f.unit?.trim() || undefined,
      options: f.options?.map((o) => o.trim()).filter(Boolean),
      goal: f.goal && { ...f.goal, target: f.goal.target.trim().replace(',', '.') },
    })),
  }
}

type Props = {
  initial: ProjectDraft
  submitLabel: string
  cancelTo: string
  onSubmit: (draft: ProjectDraft) => Promise<void>
  onDelete?: () => void
}

export function ProjectForm({ initial, submitLabel, cancelTo, onSubmit, onDelete }: Props) {
  const { user } = useAuth()
  const toast = useToast()
  const [draft, setDraft] = useState(initial)
  const [errors, setErrors] = useState<Errors>({})
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [pushNote, setPushNote] = useState<string>()
  const leaving = useRef(false)

  const set = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setDirty(true)
    // Re-validate live once the user has tried to submit.
    if (attempt) setErrors(validate({ ...draft, [key]: value }))
  }
  const setNotifications = (patch: Partial<ProjectDraft['notifications']>) =>
    set('notifications', { ...draft.notifications, ...patch })

  // Warn before leaving with unsaved changes — inside the app and on reload/close.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && !leaving.current && currentLocation.pathname !== nextLocation.pathname,
  )
  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (window.confirm('Leave without saving? Your changes will be lost.')) blocker.proceed()
    else blocker.reset()
  }, [blocker])
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  // After a failed submit, move focus to the first invalid control.
  useEffect(() => {
    if (!attempt) return
    document.querySelector<HTMLElement>('form [aria-invalid="true"]')?.focus()
  }, [attempt])

  async function togglePush(on: boolean) {
    setPushNote(undefined)
    if (!on) return setNotifications({ push: false })
    if (!('Notification' in window)) return setPushNote('This browser doesn’t support notifications.')
    if (Notification.permission === 'denied') {
      return setPushNote('Notifications are blocked for Knot. Allow them in your browser’s site settings, then try again.')
    }
    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
    if (permission === 'granted') setNotifications({ push: true })
    else setPushNote('Permission wasn’t granted, so push stays off.')
  }

  function sendTestNotification() {
    try {
      new Notification(draft.name.trim() || 'Knot reminder', {
        body: 'This is how your reminders will look.',
        icon: '/favicon.svg',
      })
    } catch {
      setPushNote('Couldn’t show a test notification in this browser.')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next = validate(draft)
    setErrors(next)
    const count = Object.keys(next).length
    if (count) {
      setAttempt((a) => a + 1)
      toast(count === 1 ? 'One thing needs your attention.' : `${count} things need your attention.`)
      return
    }
    setSaving(true)
    leaving.current = true
    try {
      await onSubmit(clean(draft))
    } catch {
      leaving.current = false
      setSaving(false)
      toast('Something went wrong. Please try again.')
    }
  }

  const n = draft.notifications
  const anyChannel = n.push || n.email || n.whatsapp

  return (
    <form onSubmit={handleSubmit} noValidate className="xl:grid xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-10">
      <div className="flex min-w-0 flex-col gap-6">
        {/* 1. Basics */}
        <FormSection id="basics" title="Basics" description="What this project is about." icon={<Pencil className="size-4" />}>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-text">Who is it for?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <ModeCard active icon={<User className="size-4" />} title="Just me" text="Personal routines, goals and reminders." />
              <ModeCard disabled icon={<Users className="size-4" />} title="With a team" text="Invite people, share lists. Coming soon." />
            </div>
          </fieldset>

          <FieldShell id="project-name" label="Project name" required error={errors['project-name']}>
            <input
              id="project-name"
              value={draft.name}
              maxLength={NAME_MAX}
              autoFocus
              placeholder="e.g. Marathon training"
              aria-invalid={errors['project-name'] ? true : undefined}
              aria-describedby={describedBy('project-name', errors['project-name'])}
              onChange={(e) => set('name', e.target.value)}
              className={inputClass(errors['project-name'])}
            />
          </FieldShell>

          <FieldShell
            id="project-description"
            label="Description"
            hint={`${draft.description.length} / ${DESCRIPTION_MAX}`}
          >
            <TextArea
              id="project-description"
              value={draft.description}
              maxLength={DESCRIPTION_MAX}
              rows={3}
              placeholder="What do you want to achieve?"
              aria-describedby="project-description-hint"
              onChange={(e) => set('description', e.target.value)}
            />
          </FieldShell>

          <FieldShell id="project-color" as="span" label="Color">
            <ColorPicker value={draft.color} onChange={(c) => set('color', c)} labelledBy="project-color-label" />
          </FieldShell>

          <FieldShell id="project-tags" label="Tags" hint="Press Enter or comma to add. Tags help you filter and search later.">
            <TagInput id="project-tags" value={draft.tags} onChange={(t) => set('tags', t)} describedBy="project-tags-hint" />
          </FieldShell>

          <FieldShell id="project-link" label="Link" error={errors['project-link']} hint="A plan, a playlist, a shared doc — anything useful.">
            <input
              id="project-link"
              type="url"
              inputMode="url"
              value={draft.link}
              placeholder="example.com/training-plan"
              aria-invalid={errors['project-link'] ? true : undefined}
              aria-describedby={describedBy('project-link', errors['project-link'], true)}
              onChange={(e) => set('link', e.target.value)}
              className={inputClass(errors['project-link'])}
            />
          </FieldShell>
        </FormSection>

        {/* 2. Schedule */}
        <FormSection id="schedule" title="Schedule" description="When it starts, when it’s due, and whether it repeats." icon={<CalendarDays className="size-4" />}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldShell id="project-start" label="Start date">
              <DatePicker id="project-start" value={draft.startDate} onChange={(v) => set('startDate', v)} placeholder="Today or later" />
            </FieldShell>
            <FieldShell id="project-due" label="Due date" error={errors['project-due']}>
              <DatePicker
                id="project-due"
                value={draft.dueDate}
                onChange={(v) => set('dueDate', v)}
                placeholder="No deadline"
                error={errors['project-due']}
                describedBy={describedBy('project-due', errors['project-due'])}
                disabled={draft.startDate ? { before: parseDay(draft.startDate)! } : undefined}
              />
            </FieldShell>
            <FieldShell id="project-time" label="Time" hint="Leave empty for all day.">
              <input
                id="project-time"
                type="time"
                value={draft.time}
                aria-describedby="project-time-hint"
                onChange={(e) => set('time', e.target.value)}
                className={inputClass()}
              />
            </FieldShell>
            <FieldShell id="project-repeat" label="Repeat">
              <Select id="project-repeat" value={draft.repeat} onChange={(e) => set('repeat', e.target.value as Repeat)}>
                {repeatOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FieldShell>
          </div>
        </FormSection>

        {/* 3. Priority */}
        <FormSection id="priority" title="Priority" description="How important is this right now?" icon={<Flag className="size-4" />}>
          <span id="priority-label" className="sr-only">
            Priority
          </span>
          <PriorityPicker value={draft.priority} onChange={(p) => set('priority', p)} labelledBy="priority-label" />
        </FormSection>

        {/* 4. Reminders */}
        <FormSection id="reminders" title="Reminders" description="Choose how Knot should nudge you." icon={<Bell className="size-4" />}>
          <div className="divide-y divide-border">
            <SwitchRow
              id="notify-push"
              checked={n.push}
              onChange={togglePush}
              icon={<BellRing className="size-4" />}
              label="Push notifications"
              description={pushNote ?? 'Alerts from your browser, on this device.'}
            >
              <Button type="button" variant="outline" size="sm" onClick={sendTestNotification}>
                Send a test notification
              </Button>
            </SwitchRow>
            <SwitchRow
              id="notify-email"
              checked={n.email}
              onChange={(v) => setNotifications({ email: v })}
              icon={<Mail className="size-4" />}
              label="Email"
              description={n.email ? `Sent to ${user?.email}` : 'A message in your inbox.'}
            />
            <SwitchRow
              id="notify-whatsapp"
              checked={n.whatsapp}
              onChange={(v) => setNotifications({ whatsapp: v })}
              icon={<MessageCircle className="size-4" />}
              label="WhatsApp"
              description="A message on your phone."
            >
              <FieldShell
                id="whatsapp-number"
                label="WhatsApp number"
                error={errors['whatsapp-number']}
                hint="Include country and area code, e.g. +55 11 91234-5678."
                className="sm:max-w-xs"
              >
                <input
                  id="whatsapp-number"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={n.whatsappNumber}
                  placeholder="+55 11 91234-5678"
                  aria-invalid={errors['whatsapp-number'] ? true : undefined}
                  aria-describedby={describedBy('whatsapp-number', errors['whatsapp-number'], true)}
                  onChange={(e) => setNotifications({ whatsappNumber: e.target.value })}
                  className={inputClass(errors['whatsapp-number'])}
                />
              </FieldShell>
            </SwitchRow>
          </div>
          <FieldShell
            id="notify-lead"
            label="When to remind"
            hint={anyChannel ? 'Based on the due date and time.' : 'Turn on at least one channel above.'}
            className="sm:max-w-xs"
          >
            <Select
              id="notify-lead"
              value={n.lead}
              disabled={!anyChannel}
              aria-describedby="notify-lead-hint"
              onChange={(e) => setNotifications({ lead: e.target.value as ReminderLead })}
            >
              {leadOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FieldShell>
        </FormSection>

        {/* 5. Images */}
        <FormSection id="images" title="Images" description="Inspiration, a route map, a photo of the plant." icon={<ImagePlus className="size-4" />}>
          <ImageUploader id="project-images" value={draft.images} onChange={(imgs) => set('images', imgs)} />
        </FormSection>

        {/* 6. Custom fields */}
        <FormSection
          id="fields"
          title="Custom fields"
          description="What do you want to record each time? Pick a type for each field — some unfold extra settings."
          icon={<ListChecks className="size-4" />}
        >
          <CustomFieldsEditor value={draft.fields} onChange={(f) => set('fields', f)} errors={errors} />
        </FormSection>

        {/* Actions */}
        <div className="sticky bottom-0 z-10 -mx-4 flex items-center gap-3 border-t border-border bg-bg/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-full sm:border sm:px-3 sm:shadow-soft">
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              className="text-danger hover:bg-danger/10 hover:text-danger"
              onClick={() => {
                if (window.confirm(`Delete “${initial.name}”? This can’t be undone.`)) {
                  leaving.current = true
                  onDelete()
                }
              }}
            >
              <Trash2 className="size-4" aria-hidden />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Link
              to={cancelTo}
              className="inline-flex h-11 items-center rounded-full px-5 text-sm font-medium text-text-muted hover:bg-surface-muted hover:text-text focus-visible:outline-2 focus-visible:outline-ring"
            >
              Cancel
            </Link>
            <Button type="submit" loading={saving}>
              {submitLabel}
            </Button>
          </div>
        </div>
      </div>

      {/* Section index — wide screens only */}
      <nav aria-label="Form sections" className="hidden xl:block">
        <ol className="sticky top-24 flex flex-col gap-1 border-l border-border pl-4 text-sm">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="block rounded-full py-1 text-text-muted hover:text-text">
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </form>
  )
}

function ModeCard({
  active,
  disabled,
  icon,
  title,
  text,
}: {
  active?: boolean
  disabled?: boolean
  icon: ReactNode
  title: string
  text: string
}) {
  return (
    <label
      className={cx(
        'flex items-start gap-3 rounded-2xl border p-4',
        active ? 'border-primary bg-primary-soft/50' : 'border-border',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <input type="radio" name="mode" checked={!!active} disabled={disabled} readOnly className="sr-only" />
      <span className={cx('grid size-8 shrink-0 place-items-center rounded-full', active ? 'bg-primary text-on-primary' : 'bg-surface-muted text-text-muted')} aria-hidden>
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-text">{title}</span>
        <span className="block text-xs text-text-muted">{text}</span>
      </span>
    </label>
  )
}
