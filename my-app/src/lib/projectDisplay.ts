import type { Priority } from './projectModel'

export const priorities: { value: Priority; label: string; hint: string }[] = [
  { value: 'low', label: 'Low', hint: 'Whenever there’s time' },
  { value: 'medium', label: 'Medium', hint: 'Should get done' },
  { value: 'high', label: 'High', hint: 'Important this week' },
  { value: 'urgent', label: 'Urgent', hint: 'Drop everything' },
]

// Fixed colors — they carry meaning, so they stay the same in both ambients.
export const priorityStyles: Record<Priority, { chip: string; dot: string }> = {
  low: { chip: 'bg-[#d9f4f1] text-[#0d6159]', dot: 'bg-[#12968e]' },
  medium: { chip: 'bg-[#fff0c9] text-[#7a5000]', dot: 'bg-[#d9a21b]' },
  high: { chip: 'bg-[#ffe2d6] text-[#a8360f]', dot: 'bg-[#ec7a1c]' },
  urgent: { chip: 'bg-[#fbd5dd] text-[#9c1238]', dot: 'bg-[#d62f5a]' },
}

/** Soft tint of the project color over the surface, for headers and cards. */
export const tint = (color: string, amount = 14) => ({ backgroundColor: `color-mix(in srgb, ${color} ${amount}%, var(--surface))` })
