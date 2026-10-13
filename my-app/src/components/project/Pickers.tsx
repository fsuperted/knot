import { Check } from 'lucide-react'
import { cx } from '../../lib/cx'
import { priorities, priorityStyles } from '../../lib/projectDisplay'
import { projectColors, type Priority } from '../../lib/projectModel'

export function PriorityPicker({ value, onChange, labelledBy }: { value: Priority; onChange: (p: Priority) => void; labelledBy: string }) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {priorities.map((p) => {
        const active = value === p.value
        return (
          <button
            key={p.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(p.value)}
            className={cx(
              'flex flex-col items-start gap-0.5 rounded-2xl border px-4 py-3 text-left transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              active ? 'border-transparent ' + priorityStyles[p.value].chip : 'border-border bg-surface hover:bg-surface-muted',
            )}
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <span className={cx('size-2.5 rounded-full', priorityStyles[p.value].dot)} aria-hidden />
              {p.label}
            </span>
            <span className={cx('text-xs', active ? 'opacity-80' : 'text-text-muted')}>{p.hint}</span>
          </button>
        )
      })}
    </div>
  )
}

export function ColorPicker({ value, onChange, labelledBy }: { value: string; onChange: (c: string) => void; labelledBy: string }) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
      {projectColors.map((c) => {
        const active = value === c.value
        return (
          <button
            key={c.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={c.name}
            title={c.name}
            onClick={() => onChange(c.value)}
            style={{ backgroundColor: c.value }}
            className={cx(
              'grid size-9 place-items-center rounded-full text-white transition-transform',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              active ? 'scale-110 ring-2 ring-text/40 ring-offset-2 ring-offset-surface' : 'hover:scale-105',
            )}
          >
            {active && <Check className="size-4" aria-hidden />}
          </button>
        )
      })}
    </div>
  )
}
