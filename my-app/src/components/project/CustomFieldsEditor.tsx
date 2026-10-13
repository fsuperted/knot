import { useEffect, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { cx } from '../../lib/cx'
import {
  defaultsFor,
  fieldErrorId,
  fieldGroups,
  fieldTemplates,
  fieldTypeById,
  fieldTypes,
  newFieldId,
  type CustomField,
  type FieldTypeId,
} from '../../lib/fieldTypes'
import { inputClass } from '../../lib/formStyles'
import { Select } from '../form'

const MAX_FIELDS = 20
const MAX_OPTIONS = 20

type Errors = Record<string, string | undefined>

type Props = {
  value: CustomField[]
  onChange: (fields: CustomField[]) => void
  errors: Errors
}

export function CustomFieldsEditor({ value, onChange, errors }: Props) {
  const [focusId, setFocusId] = useState<string | null>(null)

  // Move focus to the label of a freshly added field.
  useEffect(() => {
    if (!focusId) return
    document.getElementById(fieldErrorId(focusId, 'label'))?.focus()
  }, [focusId])

  const update = (id: string, patch: Partial<CustomField>) =>
    onChange(value.map((f) => (f.id === id ? { ...f, ...patch } : f)))

  function changeType(field: CustomField, type: FieldTypeId) {
    const previousLabel = fieldTypeById[field.type].label
    const keepLabel = field.label.trim() && field.label !== previousLabel
    // Keep options when switching between the two list types.
    const options = fieldTypeById[type].options && field.options ? field.options : undefined
    onChange(
      value.map((f) =>
        f.id === field.id
          ? { id: f.id, type, label: keepLabel ? f.label : fieldTypeById[type].label, ...defaultsFor(type), ...(options && { options }) }
          : f,
      ),
    )
  }

  function add() {
    const id = newFieldId()
    onChange([...value, { id, type: 'text', label: '', ...defaultsFor('text') }])
    setFocusId(id)
  }

  function move(index: number, delta: -1 | 1) {
    const next = [...value]
    const [item] = next.splice(index, 1)
    next.splice(index + delta, 0, item)
    onChange(next)
  }

  function applyTemplate(templateId: string) {
    const template = fieldTemplates.find((t) => t.id === templateId)!
    const existing = new Set(value.map((f) => f.label.trim().toLowerCase()))
    const added = template.fields
      .filter((f) => !existing.has(f.label.toLowerCase()))
      .map((f) => ({ ...f, id: newFieldId(), options: f.options && [...f.options] }))
    onChange([...value, ...added].slice(0, MAX_FIELDS))
  }

  const hasDistance = value.some((f) => f.type === 'distance')
  const hasDuration = value.some((f) => f.type === 'duration')

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="flex items-center gap-1.5 text-sm font-medium text-text">
          <Sparkles className="size-4 text-primary-text" aria-hidden />
          Start from a template
        </p>
        <p className="mt-0.5 text-xs text-text-muted">Adds a ready-made set of fields. You can change or remove any of them.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {fieldTemplates.map(({ id, label, icon: Icon, fields }) => (
            <button
              key={id}
              type="button"
              onClick={() => applyTemplate(id)}
              disabled={value.length >= MAX_FIELDS}
              title={fields.map((f) => f.label).join(' · ')}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm text-text hover:border-primary/50 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
            >
              <Icon className="size-4 text-primary-text" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      {value.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-text-muted">
          No custom fields yet. Fields are what you record each time — like distance and pace for a run, or price for a
          purchase.
        </p>
      ) : (
        <ol className="flex flex-col gap-3" aria-label="Custom fields">
          {value.map((field, index) => {
            const def = fieldTypeById[field.type]
            const Icon = def.icon
            const labelError = errors[fieldErrorId(field.id, 'label')]
            const optionsError = errors[fieldErrorId(field.id, 'options')]
            const goalError = errors[fieldErrorId(field.id, 'goal')]
            const name = field.label.trim() || `Field ${index + 1}`

            return (
              <li key={field.id} className="rounded-3xl border border-border bg-bg/60 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-text" aria-hidden>
                    <Icon className="size-4" />
                  </span>

                  <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[1fr_13rem]">
                    <div className="flex flex-col gap-1">
                      <label htmlFor={fieldErrorId(field.id, 'label')} className="sr-only">
                        Field name
                      </label>
                      <input
                        id={fieldErrorId(field.id, 'label')}
                        value={field.label}
                        maxLength={40}
                        placeholder="Field name, e.g. Distance"
                        aria-invalid={labelError ? true : undefined}
                        aria-describedby={labelError ? `${fieldErrorId(field.id, 'label')}-error` : undefined}
                        onChange={(e) => update(field.id, { label: e.target.value })}
                        className={inputClass(labelError)}
                      />
                      {labelError && (
                        <p id={`${fieldErrorId(field.id, 'label')}-error`} className="px-4 text-xs text-danger">
                          {labelError}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor={`field-${field.id}-type`} className="sr-only">
                        Type of {name}
                      </label>
                      <Select
                        id={`field-${field.id}-type`}
                        value={field.type}
                        onChange={(e) => changeType(field, e.target.value as FieldTypeId)}
                      >
                        {fieldGroups.map((g) => (
                          <optgroup key={g.id} label={g.label}>
                            {fieldTypes
                              .filter((t) => t.group === g.id)
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.label}
                                </option>
                              ))}
                          </optgroup>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                    <IconButton label={`Move ${name} up`} disabled={index === 0} onClick={() => move(index, -1)}>
                      <ArrowUp className="size-4" />
                    </IconButton>
                    <IconButton label={`Move ${name} down`} disabled={index === value.length - 1} onClick={() => move(index, 1)}>
                      <ArrowDown className="size-4" />
                    </IconButton>
                    <IconButton label={`Remove ${name}`} onClick={() => onChange(value.filter((f) => f.id !== field.id))} danger>
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </div>

                {/* Settings that unfold according to the chosen type */}
                <div className="mt-4 flex flex-col gap-4 sm:pl-12">
                  <p className="text-xs text-text-muted">{def.description}</p>

                  {def.units && def.units.length > 1 && (
                    <UnitChoice
                      id={`field-${field.id}-unit`}
                      units={def.units}
                      value={field.unit ?? def.units[0]}
                      onChange={(unit) => update(field.id, { unit })}
                      label={field.type === 'money' ? 'Currency' : field.type === 'rating' ? 'Scale' : field.type === 'duration' ? 'Format' : field.type === 'sets-reps' ? 'Load unit' : 'Unit'}
                    />
                  )}

                  {def.freeUnit && (
                    <div className="flex flex-col gap-1.5 sm:max-w-60">
                      <label htmlFor={`field-${field.id}-unit`} className="text-xs font-medium text-text">
                        Unit <span className="font-normal text-text-muted">(optional)</span>
                      </label>
                      <input
                        id={`field-${field.id}-unit`}
                        value={field.unit ?? ''}
                        maxLength={16}
                        placeholder="e.g. pages, liters, days"
                        onChange={(e) => update(field.id, { unit: e.target.value })}
                        className={inputClass(undefined, 'h-9 text-sm')}
                      />
                    </div>
                  )}

                  {def.options && (
                    <OptionsEditor
                      fieldId={field.id}
                      kind={field.type === 'checklist' ? 'Items' : 'Options'}
                      value={field.options ?? []}
                      onChange={(options) => update(field.id, { options })}
                      error={optionsError}
                    />
                  )}

                  {field.type === 'sets-reps' && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      Each entry records:
                      {['Sets', 'Reps', `Load (${field.unit ?? 'kg'})`].map((part) => (
                        <span key={part} className="rounded-full bg-surface px-3 py-1 font-medium text-text shadow-sm">
                          {part}
                        </span>
                      ))}
                    </div>
                  )}

                  {field.type === 'pace' && (
                    <label className="flex items-start gap-3 text-sm text-text">
                      <input
                        type="checkbox"
                        checked={!!field.autoCalculate}
                        onChange={(e) => update(field.id, { autoCalculate: e.target.checked })}
                        className="mt-0.5 size-4 accent-[var(--primary)]"
                      />
                      <span>
                        Calculate automatically from Distance and Duration
                        {field.autoCalculate && !(hasDistance && hasDuration) && (
                          <span className="block text-xs text-text-muted">
                            Add a {[!hasDistance && 'Distance', !hasDuration && 'Duration'].filter(Boolean).join(' and a ')} field
                            for this to work.
                          </span>
                        )}
                      </span>
                    </label>
                  )}

                  {def.goal && (
                    <GoalEditor
                      field={field}
                      error={goalError}
                      onChange={(goal) => update(field.id, { goal })}
                      defaultDirection={def.goal}
                    />
                  )}

                  <p className="text-xs text-text-muted">
                    Preview: <span className="rounded-full bg-surface px-2.5 py-1 font-medium text-text shadow-sm">{def.example(field)}</span>
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      <button
        type="button"
        onClick={add}
        disabled={value.length >= MAX_FIELDS}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-dashed border-border text-sm font-medium text-text-muted hover:border-primary/50 hover:text-primary-text focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
      >
        <Plus className="size-4" aria-hidden />
        {value.length >= MAX_FIELDS ? `Up to ${MAX_FIELDS} fields` : 'Add a field'}
      </button>
    </div>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'grid size-9 place-items-center rounded-full text-text-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-30',
        danger ? 'hover:bg-danger/10 hover:text-danger' : 'hover:bg-surface-muted hover:text-text',
      )}
    >
      {children}
    </button>
  )
}

function UnitChoice({ id, units, value, onChange, label }: { id: string; units: string[]; value: string; onChange: (u: string) => void; label: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span id={id} className="text-xs font-medium text-text">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={id} className="inline-flex flex-wrap gap-1 rounded-full bg-surface-muted p-1">
        {units.map((u) => (
          <button
            key={u}
            type="button"
            role="radio"
            aria-checked={value === u}
            onClick={() => onChange(u)}
            className={cx(
              'h-7 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring',
              value === u ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text',
            )}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  )
}

function OptionsEditor({
  fieldId,
  kind,
  value,
  onChange,
  error,
}: {
  fieldId: string
  kind: 'Options' | 'Items'
  value: string[]
  onChange: (options: string[]) => void
  error?: string
}) {
  const groupId = fieldErrorId(fieldId, 'options')
  return (
    <fieldset aria-describedby={error ? `${groupId}-error` : undefined} className="flex flex-col gap-2">
      <legend className="mb-2 text-xs font-medium text-text">{kind}</legend>
      {value.map((option, i) => (
        <div key={i} className="flex items-center gap-2 sm:max-w-md">
          <input
            id={i === 0 ? groupId : undefined}
            value={option}
            maxLength={40}
            aria-label={`${kind === 'Items' ? 'Item' : 'Option'} ${i + 1}`}
            aria-invalid={error && !option.trim() ? true : undefined}
            placeholder={`${kind === 'Items' ? 'Item' : 'Option'} ${i + 1}`}
            onChange={(e) => onChange(value.map((o, j) => (j === i ? e.target.value : o)))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (value.length < MAX_OPTIONS) onChange([...value, ''])
              }
            }}
            className={inputClass(error && !option.trim() ? error : undefined, 'h-9 text-sm')}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="grid size-8 shrink-0 place-items-center rounded-full text-text-muted hover:bg-surface-muted hover:text-text focus-visible:outline-2 focus-visible:outline-ring"
            aria-label={`Remove ${option || `${kind === 'Items' ? 'item' : 'option'} ${i + 1}`}`}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
      {error && (
        <p id={`${groupId}-error`} className="px-4 text-xs text-danger">
          {error}
        </p>
      )}
      {value.length < MAX_OPTIONS && (
        <button
          type="button"
          onClick={() => onChange([...value, ''])}
          className="inline-flex h-8 items-center gap-1.5 self-start rounded-full px-3 text-xs font-medium text-primary-text hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Plus className="size-3.5" aria-hidden />
          Add {kind === 'Items' ? 'item' : 'option'}
        </button>
      )}
    </fieldset>
  )
}

function GoalEditor({
  field,
  onChange,
  defaultDirection,
  error,
}: {
  field: CustomField
  onChange: (goal: CustomField['goal']) => void
  defaultDirection: 'at-least' | 'at-most'
  error?: string
}) {
  const id = fieldErrorId(field.id, 'goal')
  const timeLike = field.type === 'duration' || field.type === 'pace'
  const suffix = field.type === 'percentage' ? '%' : field.unit
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-3 text-sm text-text">
        <input
          type="checkbox"
          checked={!!field.goal}
          onChange={(e) => onChange(e.target.checked ? { target: '', direction: defaultDirection } : undefined)}
          className="size-4 accent-[var(--primary)]"
        />
        Set a goal
      </label>
      {field.goal && (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={`${id}-direction`} className="sr-only">
            Goal direction
          </label>
          <Select
            id={`${id}-direction`}
            value={field.goal.direction}
            onChange={(e) => onChange({ ...field.goal!, direction: e.target.value as 'at-least' | 'at-most' })}
            className="w-36 [&_select]:h-9 [&_select]:text-sm"
          >
            <option value="at-least">At least</option>
            <option value="at-most">At most</option>
          </Select>
          <label htmlFor={id} className="sr-only">
            Goal value
          </label>
          <div className="w-28">
            <input
              id={id}
              value={field.goal.target}
              inputMode={timeLike ? 'text' : 'decimal'}
              placeholder={timeLike ? (field.type === 'pace' ? '5:00' : '0:30:00') : '10'}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(e) => onChange({ ...field.goal!, target: e.target.value })}
              className={inputClass(error, 'h-9 text-sm')}
            />
          </div>
          {suffix && <span className="text-sm text-text-muted">{suffix}</span>}
          {error && (
            <p id={`${id}-error`} className="w-full px-4 text-xs text-danger">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
