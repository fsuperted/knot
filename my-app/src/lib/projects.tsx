export type { Priority, Project, ProjectDraft, ProjectImage, Repeat, ReminderLead } from './projectModel'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './auth'
import type { Project, ProjectDraft } from './projectModel'
import { readJSON, writeJSON } from './storage'

/*
 * Projects are kept per user in sessionStorage — no backend yet.
 * Phase 1 of the study plan swaps this provider for REST calls
 * (/projects) keeping the same hook interface.
 */

type ProjectsContextValue = {
  projects: Project[]
  getProject: (id: string | undefined) => Project | undefined
  createProject: (draft: ProjectDraft) => Promise<Project>
  updateProject: (id: string, draft: ProjectDraft) => Promise<Project>
  deleteProject: (id: string) => void
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null)

const storageKey = (email: string) => `knot.projects.${email}`
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const email = user?.email ?? ''
  // Keyed by owner so switching accounts never shows someone else's projects.
  const [state, setState] = useState(() => ({
    owner: email,
    projects: email ? (readJSON<Project[]>('session', storageKey(email)) ?? []) : [],
  }))

  // Reload when a different account signs in (derived during render, not in an effect).
  let projects = state.projects
  if (state.owner !== email) {
    projects = email ? (readJSON<Project[]>('session', storageKey(email)) ?? []) : []
    setState({ owner: email, projects })
  }

  useEffect(() => {
    // Images can exceed the storage quota; writeJSON fails quietly and the
    // prototype keeps working in memory.
    if (state.owner) writeJSON('session', storageKey(state.owner), state.projects)
  }, [state])

  const getProject = useCallback((id: string | undefined) => projects.find((p) => p.id === id), [projects])

  const createProject = useCallback(async (draft: ProjectDraft) => {
    await delay()
    const now = new Date().toISOString()
    const project: Project = { ...draft, id: Math.random().toString(36).slice(2, 10), createdAt: now, updatedAt: now }
    setState((s) => ({ ...s, projects: [...s.projects, project] }))
    return project
  }, [])

  const updateProject = useCallback(
    async (id: string, draft: ProjectDraft) => {
      await delay()
      const existing = projects.find((p) => p.id === id)
      const now = new Date().toISOString()
      const updated: Project = { ...draft, id, createdAt: existing?.createdAt ?? now, updatedAt: now }
      setState((s) => ({ ...s, projects: s.projects.map((p) => (p.id === id ? updated : p)) }))
      return updated
    },
    [projects],
  )

  const deleteProject = useCallback((id: string) => {
    setState((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== id) }))
  }, [])

  const value = useMemo(
    () => ({ projects, getProject, createProject, updateProject, deleteProject }),
    [projects, getProject, createProject, updateProject, deleteProject],
  )
  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useProjects() {
  const ctx = useContext(ProjectsContext)
  if (!ctx) throw new Error('useProjects must be used inside <ProjectsProvider>')
  return ctx
}
