import { CalendarDays, Clock, Repeat as RepeatIcon } from 'lucide-react'
import { cx } from '../../lib/cx'
import type { Project, Repeat } from '../../lib/projectModel'
import { displayDay } from '../../lib/dates'
import { priorities, priorityStyles } from '../../lib/projectDisplay'

export function PriorityChip({ priority, className }: { priority: Project['priority']; className?: string }) {
  const p = priorities.find((x) => x.value === priority)!
  return (
    <span className={cx('inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium', priorityStyles[priority].chip, className)}>
      <span className={cx('size-1.5 rounded-full', priorityStyles[priority].dot)} aria-hidden />
      {p.label}
      <span className="sr-only"> priority</span>
    </span>
  )
}

const repeatLabels: Record<Repeat, string> = {
  none: '',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

export function ScheduleChips({ project, compact }: { project: Project; compact?: boolean }) {
  const { startDate, dueDate, time, repeat } = project
  const chip = 'inline-flex h-6 items-center gap-1.5 rounded-full bg-surface-muted px-2.5 text-xs text-text'
  const range =
    startDate && dueDate
      ? `${displayDay(startDate, 'short')} → ${displayDay(dueDate, 'short')}`
      : dueDate
        ? `Due ${displayDay(dueDate, 'short')}`
        : startDate
          ? `From ${displayDay(startDate, 'short')}`
          : ''
  return (
    <>
      {range && (
        <span className={chip}>
          <CalendarDays className="size-3.5 text-text-muted" aria-hidden />
          {range}
        </span>
      )}
      {time && !compact && (
        <span className={chip}>
          <Clock className="size-3.5 text-text-muted" aria-hidden />
          {time}
        </span>
      )}
      {repeat !== 'none' && (
        <span className={chip}>
          <RepeatIcon className="size-3.5 text-text-muted" aria-hidden />
          {repeatLabels[repeat]}
        </span>
      )}
    </>
  )
}
