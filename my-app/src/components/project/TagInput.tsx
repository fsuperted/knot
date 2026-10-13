import { useState, type KeyboardEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { cx } from '../../lib/cx'

const SUGGESTIONS = ['health', 'home', 'errands', 'finance', 'study', 'family', 'routine', 'goals']
export const MAX_TAGS = 8

const normalize = (tag: string) => tag.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-').slice(0, 24)

type Props = {
  id: string
  value: string[]
  onChange: (tags: string[]) => void
  describedBy?: string
}

export function TagInput({ id, value, onChange, describedBy }: Props) {
  const [draft, setDraft] = useState('')
  const full = value.length >= MAX_TAGS

  function add(raw: string) {
    const tag = normalize(raw)
    if (tag && !value.includes(tag) && !full) onChange([...value, tag])
    setDraft('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  const suggestions = SUGGESTIONS.filter((s) => !value.includes(s))

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cx(
          'flex min-h-11 flex-wrap items-center gap-1.5 rounded-3xl border border-border bg-surface px-2 py-1.5',
          'focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-ring',
        )}
      >
        {value.map((tag) => (
          <span key={tag} className="inline-flex h-7 items-center gap-1 rounded-full bg-primary-soft pl-3 pr-1 text-xs font-medium text-primary-text">
            #{tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="grid size-5 place-items-center rounded-full hover:bg-surface/60 focus-visible:outline-2 focus-visible:outline-ring"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="size-3" aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          disabled={full}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft && add(draft)}
          aria-describedby={describedBy}
          placeholder={full ? `Up to ${MAX_TAGS} tags` : value.length ? 'Add another…' : 'Type a tag and press Enter'}
          className="h-7 min-w-32 flex-1 bg-transparent px-2 text-[15px] text-text outline-none placeholder:text-text-muted/70 disabled:cursor-not-allowed"
        />
      </div>
      {suggestions.length > 0 && !full && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-text-muted">Suggestions:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-border px-2.5 text-xs text-text-muted hover:border-primary hover:text-primary-text focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Plus className="size-3" aria-hidden />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
