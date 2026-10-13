import type { CustomField } from './fieldTypes'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Repeat = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
export type ReminderLead = 'at-time' | '15m' | '1h' | '1d'

export type ProjectImage = { id: string; name: string; src: string }

export type ProjectDraft = {
  mode: 'individual' | 'team'
  name: string
  description: string
  color: string
  tags: string[]
  link: string
  startDate: string // yyyy-mm-dd, '' when unset
  dueDate: string
  time: string // HH:mm, '' when all day
  repeat: Repeat
  priority: Priority
  notifications: {
    push: boolean
    email: boolean
    whatsapp: boolean
    whatsappNumber: string
    lead: ReminderLead
  }
  images: ProjectImage[]
  fields: CustomField[]
}

export type Project = ProjectDraft & { id: string; createdAt: string; updatedAt: string }

export const projectColors = [
  { name: 'Coral', value: '#e5534b' },
  { name: 'Tangerine', value: '#ec7a1c' },
  { name: 'Mustard', value: '#c99413' },
  { name: 'Green', value: '#2f9e6b' },
  { name: 'Teal', value: '#12968e' },
  { name: 'Blue', value: '#3b7ddd' },
  { name: 'Indigo', value: '#5b5bd6' },
  { name: 'Berry', value: '#c8457f' },
]

export const emptyDraft = (): ProjectDraft => ({
  mode: 'individual',
  name: '',
  description: '',
  color: projectColors[0].value,
  tags: [],
  link: '',
  startDate: '',
  dueDate: '',
  time: '',
  repeat: 'none',
  priority: 'medium',
  notifications: { push: false, email: false, whatsapp: false, whatsappNumber: '', lead: 'at-time' },
  images: [],
  fields: [],
})
