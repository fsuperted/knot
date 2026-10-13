// Prototype-only persistence. Storage can be unavailable (private mode,
// blocked site data), so every access is guarded and falls back to nothing.

export function readJSON<T>(storage: 'local' | 'session', key: string): T | null {
  try {
    const raw = (storage === 'local' ? localStorage : sessionStorage).getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJSON(storage: 'local' | 'session', key: string, value: unknown) {
  try {
    const target = storage === 'local' ? localStorage : sessionStorage
    if (value === null) target.removeItem(key)
    else target.setItem(key, JSON.stringify(value))
  } catch {
    // ignore — the prototype keeps working in memory
  }
}
