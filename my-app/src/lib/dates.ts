// Dates travel as local "yyyy-mm-dd" strings so they never shift with time zones.
export const parseDay = (value: string) => {
  if (!value) return undefined
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const formatDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export const displayDay = (value: string, style: 'long' | 'short' = 'long') =>
  parseDay(value)?.toLocaleDateString('en-US', style === 'long'
    ? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
    : { month: 'short', day: 'numeric' }) ?? ''
