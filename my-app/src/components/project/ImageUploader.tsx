import { useRef, useState, type DragEvent } from 'react'
import { ImagePlus, LoaderCircle, Star, X } from 'lucide-react'
import { cx } from '../../lib/cx'
import type { ProjectImage } from '../../lib/projectModel'

export const MAX_IMAGES = 5
const MAX_BYTES = 10 * 1024 * 1024 // matches Cloudinary's free-tier per-image limit
const MAX_EDGE = 1280

// Resize + re-encode before "upload", as the study plan suggests.
async function compress(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.78)
}

type Props = {
  id: string
  value: ProjectImage[]
  onChange: (images: ProjectImage[]) => void
}

export function ImageUploader({ id, value, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [problem, setProblem] = useState<string>()
  const remaining = MAX_IMAGES - value.length

  async function addFiles(list: FileList | null) {
    if (!list?.length) return
    const files = Array.from(list)
    const images = files.filter((f) => f.type.startsWith('image/'))
    const tooBig = images.filter((f) => f.size > MAX_BYTES)
    const accepted = images.filter((f) => f.size <= MAX_BYTES).slice(0, remaining)

    const notes: string[] = []
    if (images.length < files.length) notes.push('Only image files can be added.')
    if (tooBig.length) notes.push(`${tooBig.length} image${tooBig.length > 1 ? 's are' : ' is'} over 10 MB.`)
    if (images.length - tooBig.length > remaining) notes.push(`You can add up to ${MAX_IMAGES} images.`)
    setProblem(notes.join(' ') || undefined)

    if (!accepted.length) return
    setBusy(true)
    try {
      const added = await Promise.all(
        accepted.map(async (file) => ({ id: Math.random().toString(36).slice(2, 10), name: file.name, src: await compress(file) })),
      )
      onChange([...value, ...added])
    } catch {
      setProblem('One of the images could not be read.')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (remaining > 0) addFiles(e.dataTransfer.files)
  }

  function makeCover(imageId: string) {
    const image = value.find((i) => i.id === imageId)!
    onChange([image, ...value.filter((i) => i.id !== imageId)])
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((image, index) => (
          <figure key={image.id} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-muted">
            <img src={image.src} alt={image.name} className="size-full object-cover" />
            {index === 0 ? (
              <figcaption className="absolute left-2 top-2 rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-medium text-text">
                Cover
              </figcaption>
            ) : (
              <button
                type="button"
                onClick={() => makeCover(image.id)}
                className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-medium text-text opacity-100 hover:bg-surface focus-visible:outline-2 focus-visible:outline-ring sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              >
                <Star className="size-3" aria-hidden />
                Make cover
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange(value.filter((i) => i.id !== image.id))}
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-surface/90 text-text hover:bg-surface focus-visible:outline-2 focus-visible:outline-ring"
              aria-label={`Remove ${image.name}`}
            >
              <X className="size-4" aria-hidden />
            </button>
          </figure>
        ))}

        {remaining > 0 && (
          <label
            htmlFor={id}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cx(
              'flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed p-3 text-center transition-colors',
              'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring',
              dragging ? 'border-primary bg-primary-soft' : 'border-border hover:border-primary/50 hover:bg-surface-muted',
            )}
          >
            {busy ? (
              <LoaderCircle className="size-6 animate-spin text-primary-text" aria-hidden />
            ) : (
              <ImagePlus className="size-6 text-primary-text" aria-hidden />
            )}
            <span className="text-sm font-medium text-text">{busy ? 'Preparing…' : 'Add images'}</span>
            <span className="text-xs text-text-muted">
              {value.length ? `${remaining} more` : `Drop or browse · up to ${MAX_IMAGES}`}
            </span>
            <input
              ref={input}
              id={id}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={busy}
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      <p className={cx('text-xs', problem ? 'text-danger' : 'text-text-muted')} role={problem ? 'alert' : undefined}>
        {problem ?? `${value.length} of ${MAX_IMAGES} · JPG, PNG, HEIC or WebP up to 10 MB. The first image is the cover.`}
      </p>
    </div>
  )
}
