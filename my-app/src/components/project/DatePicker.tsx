import { useEffect, useRef, useState } from 'react'
import { DayPicker, type Matcher } from '@daypicker/react'
import '@daypicker/react/style.css'
import { CalendarDays, X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { formatDay, displayDay, parseDay } from '../../lib/dates'
import { inputClass } from '../../lib/formStyles'

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  describedBy?: string
  disabled?: Matcher | Matcher[]
}

export function DatePicker({ id, value, onChange, placeholder = 'Pick a date', error, describedBy, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const selected = parseDay(value)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onClick={() => setOpen((o) => !o)}
        className={inputClass(error, 'flex items-center gap-2 text-left')}
      >
        <CalendarDays className="size-4 shrink-0 text-text-muted" aria-hidden />
        <span className={cx('flex-1 truncate', !value && 'text-text-muted/70')}>{value ? displayDay(value) : placeholder}</span>
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-1 my-auto grid size-9 place-items-center rounded-full text-text-muted hover:bg-surface-muted hover:text-text focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Clear date"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
      {open && (
        <div
          role="dialog"
          aria-label="Choose a date"
          className="knot-calendar absolute left-0 top-full z-20 mt-2 rounded-3xl border border-border bg-surface p-3 shadow-soft"
        >
          <DayPicker
            mode="single"
            autoFocus
            selected={selected}
            defaultMonth={selected}
            disabled={disabled}
            showOutsideDays
            onSelect={(date) => {
              onChange(date ? formatDay(date) : '')
              setOpen(false)
              trigger.current?.focus()
            }}
          />
          <div className="flex justify-between border-t border-border px-2 pt-2">
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-primary-text hover:bg-primary-soft"
              onClick={() => {
                onChange(formatDay(new Date()))
                setOpen(false)
                trigger.current?.focus()
              }}
            >
              Today
            </button>
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-muted"
              onClick={() => {
                setOpen(false)
                trigger.current?.focus()
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
