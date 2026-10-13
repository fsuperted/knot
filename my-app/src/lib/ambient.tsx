import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { readJSON, writeJSON } from './storage'

/*
 * Ambient = visual theme tied to the kind of use:
 *  - personal: everyday habits, warmer palette
 *  - work: team projects, cooler palette
 * Applied as data-ambient on <html>; tokens live in index.css.
 */

export type Ambient = 'personal' | 'work'

const KEY = 'knot.ambient'

const AmbientContext = createContext<{ ambient: Ambient; setAmbient: (a: Ambient) => void } | null>(null)

export function AmbientProvider({ children }: { children: ReactNode }) {
  const [ambient, setAmbient] = useState<Ambient>(() => readJSON<Ambient>('local', KEY) ?? 'personal')

  useEffect(() => {
    document.documentElement.dataset.ambient = ambient
    writeJSON('local', KEY, ambient)
  }, [ambient])

  const value = useMemo(() => ({ ambient, setAmbient }), [ambient])
  return <AmbientContext.Provider value={value}>{children}</AmbientContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAmbient() {
  const ctx = useContext(AmbientContext)
  if (!ctx) throw new Error('useAmbient must be used inside <AmbientProvider>')
  return ctx
}
