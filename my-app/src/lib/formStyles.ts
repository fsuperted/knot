import type { ReactNode } from 'react'
import { cx } from './cx'

export const describedBy = (id: string, error?: string, hint?: ReactNode) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined

export const inputClass = (error?: string, extra?: string) =>
  cx(
    'h-11 w-full rounded-full border bg-surface px-4 text-[15px] text-text placeholder:text-text-muted/70',
    'transition-colors focus:outline-2 focus:outline-offset-1 focus:outline-ring disabled:cursor-not-allowed disabled:opacity-60',
    error ? 'border-danger' : 'border-border hover:border-text-muted/40',
    extra,
  )
