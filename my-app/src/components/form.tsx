import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cx } from '../lib/cx'
import { inputClass } from '../lib/formStyles'

/*
 * Form building blocks for longer forms (project editor).
 * They share the look of <Field> from ui.tsx: pill inputs, label on top,
 * hint or error below, error linked through aria-describedby.
 */

type ShellProps = {
  id: string
  label: ReactNode
  error?: string
  hint?: ReactNode
  required?: boolean
  action?: ReactNode
  className?: string
  children: ReactNode
  /** Use a <legend>-style label for groups of controls. */
  as?: 'label' | 'span'
}

export function FieldShell({ id, label, error, hint, required, action, className, children, as = 'label' }: ShellProps) {
  const Label = as
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label {...(as === 'label' ? { htmlFor: id } : { id: `${id}-label` })} className="text-sm font-medium text-text">
          {label}
          {required && <span className="ml-1.5 text-xs font-normal text-text-muted">Required</span>}
        </Label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="px-4 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="px-4 text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function TextArea({
  error,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <textarea
      aria-invalid={error ? true : undefined}
      className={cx(inputClass(error), 'h-auto min-h-24 resize-y rounded-3xl py-3 leading-relaxed', className)}
      {...props}
    />
  )
}

export function Select({
  error,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <div className={cx('relative', className)}>
      <select aria-invalid={error ? true : undefined} className={inputClass(error, 'appearance-none pr-10')} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden />
    </div>
  )
}

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  description?: ReactNode
  icon?: ReactNode
  disabled?: boolean
  id: string
  children?: ReactNode
}

/** A labelled on/off switch row; `children` unfold below it while on. */
export function SwitchRow({ checked, onChange, label, description, icon, disabled, id, children }: SwitchProps) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-4">
        {icon && (
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-muted text-text-muted" aria-hidden>
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className="block text-sm font-medium text-text">
            {label}
          </label>
          {description && <p id={`${id}-desc`} className="mt-0.5 text-xs text-text-muted">{description}</p>}
        </div>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-describedby={description ? `${id}-desc` : undefined}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cx(
            'relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50',
            checked ? 'bg-primary' : 'bg-border',
          )}
        >
          <span
            className={cx(
              'absolute left-1 top-1 size-5 rounded-full bg-white shadow transition-transform',
              checked && 'translate-x-5',
            )}
          />
        </button>
      </div>
      {checked && children && <div className="mt-4 sm:pl-14">{children}</div>}
    </div>
  )
}

type SectionProps = {
  id: string
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  action?: ReactNode
}

export function FormSection({ id, title, description, icon, children, action }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 rounded-card bg-surface p-5 shadow-soft sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        {icon && (
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-text" aria-hidden>
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 id={`${id}-title`} className="text-lg font-semibold text-text">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-text-muted">{description}</p>}
        </div>
        {action}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  )
}
