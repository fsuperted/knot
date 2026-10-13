import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { readJSON, writeJSON } from './storage'

/*
 * Demo authentication — no backend yet.
 * Accounts live in sessionStorage so the flow survives a refresh but
 * disappears with the tab. Phase 2 of the study plan replaces this with
 * the Express API (JWT + bcrypt) while keeping the same hook interface.
 */

export type User = {
  name: string
  email: string
}

type StoredAccount = User & { password: string }

type AuthResult = { ok: true } | { ok: false; error: string }

type AuthContextValue = {
  user: User | null
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>
  signInWithGoogle: () => Promise<AuthResult>
  signOut: () => void
}

const SESSION_KEY = 'knot.session'
const ACCOUNTS_KEY = 'knot.accounts'

const AuthContext = createContext<AuthContextValue | null>(null)

// Simulates network latency so loading states are visible.
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))

function nameFromEmail(email: string) {
  const local = email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  return local.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Friend'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readJSON<User>('session', SESSION_KEY))

  const startSession = useCallback((next: User) => {
    setUser(next)
    writeJSON('session', SESSION_KEY, next)
  }, [])

  const signIn = useCallback<AuthContextValue['signIn']>(
    async (email, password) => {
      await delay()
      const accounts = readJSON<StoredAccount[]>('session', ACCOUNTS_KEY) ?? []
      const account = accounts.find((a) => a.email === email.toLowerCase())
      if (account && account.password !== password) {
        return { ok: false, error: 'That password doesn’t match this account.' }
      }
      // Unknown emails are accepted so the prototype can be explored freely.
      startSession({ name: account?.name ?? nameFromEmail(email), email: email.toLowerCase() })
      return { ok: true }
    },
    [startSession],
  )

  const signUp = useCallback<AuthContextValue['signUp']>(
    async (name, email, password) => {
      await delay()
      const accounts = readJSON<StoredAccount[]>('session', ACCOUNTS_KEY) ?? []
      const normalized = email.toLowerCase()
      if (accounts.some((a) => a.email === normalized)) {
        return { ok: false, error: 'An account with this email already exists.' }
      }
      writeJSON('session', ACCOUNTS_KEY, [...accounts, { name, email: normalized, password }])
      startSession({ name, email: normalized })
      return { ok: true }
    },
    [startSession],
  )

  const signInWithGoogle = useCallback(async () => {
    await delay()
    startSession({ name: 'Alex Morgan', email: 'alex@gmail.com' })
    return { ok: true } as const
  }, [startSession])

  const signOut = useCallback(() => {
    setUser(null)
    writeJSON('session', SESSION_KEY, null)
  }, [])

  const value = useMemo(
    () => ({ user, signIn, signUp, signInWithGoogle, signOut }),
    [user, signIn, signUp, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
