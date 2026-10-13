import {
  AlignLeft,
  Banknote,
  BookOpen,
  Calendar,
  Camera,
  CircleDot,
  Clock,
  Dumbbell,
  Flame,
  Footprints,
  Gauge,
  Hash,
  HeartPulse,
  Leaf,
  Link,
  ListChecks,
  MapPin,
  Package,
  Paperclip,
  Percent,
  Ruler,
  ShoppingCart,
  Signature,
  Star,
  Thermometer,
  Timer,
  ToggleLeft,
  Type,
  Weight,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/*
 * Custom fields are the "metrics" of a project: the user decides what gets
 * recorded each time they log an entry (distance of a run, price of an item,
 * date of the last service…). Each type may unfold extra settings: a unit,
 * a list of options, a goal, or an automatic calculation.
 */

export type FieldTypeId =
  | 'text'
  | 'long-text'
  | 'number'
  | 'yes-no'
  | 'choice'
  | 'checklist'
  | 'date'
  | 'time'
  | 'link'
  | 'quantity'
  | 'percentage'
  | 'rating'
  | 'distance'
  | 'duration'
  | 'weight'
  | 'temperature'
  | 'pace'
  | 'heart-rate'
  | 'calories'
  | 'sets-reps'
  | 'money'
  | 'photo'
  | 'file'
  | 'signature'
  | 'location'

export type GoalDirection = 'at-least' | 'at-most'

export type CustomField = {
  id: string
  type: FieldTypeId
  label: string
  unit?: string
  options?: string[]
  goal?: { target: string; direction: GoalDirection }
  /** pace only: derive from the project's distance and duration fields */
  autoCalculate?: boolean
}

type GroupId = 'basics' | 'measurements' | 'fitness' | 'money' | 'documents'

export const fieldGroups: { id: GroupId; label: string }[] = [
  { id: 'basics', label: 'Basics' },
  { id: 'measurements', label: 'Measurements' },
  { id: 'fitness', label: 'Fitness & health' },
  { id: 'money', label: 'Money & shopping' },
  { id: 'documents', label: 'Media & documents' },
]

export type FieldTypeDef = {
  id: FieldTypeId
  label: string
  group: GroupId
  icon: LucideIcon
  description: string
  /** Fixed list of units the user picks from. */
  units?: string[]
  /** Unit is free text (e.g. "pages", "liters"). */
  freeUnit?: boolean
  /** Needs a list of options. */
  options?: boolean
  /** Can hold a goal; value is the default direction. */
  goal?: GoalDirection
  /** Example of a logged value, shown as a preview. */
  example: (field: CustomField) => string
}

const withUnit = (value: string, unit?: string) => (unit ? `${value} ${unit}` : value)

export const fieldTypes: FieldTypeDef[] = [
  // Basics
  { id: 'text', label: 'Short text', group: 'basics', icon: Type, description: 'A word or a short sentence.', example: () => 'Riverside loop' },
  { id: 'long-text', label: 'Long text', group: 'basics', icon: AlignLeft, description: 'Notes, observations, a paragraph.', example: () => 'Felt strong in the second half…' },
  { id: 'number', label: 'Number', group: 'basics', icon: Hash, description: 'Any number, with an optional unit.', freeUnit: true, goal: 'at-least', example: (f) => withUnit('42', f.unit) },
  { id: 'yes-no', label: 'Yes / No', group: 'basics', icon: ToggleLeft, description: 'A simple switch — done or not done.', example: () => 'Yes' },
  { id: 'choice', label: 'Single choice', group: 'basics', icon: CircleDot, description: 'Pick one option from a list you define.', options: true, example: (f) => f.options?.find(Boolean) ?? 'Option A' },
  { id: 'checklist', label: 'Checklist', group: 'basics', icon: ListChecks, description: 'A list of items to tick off.', options: true, example: (f) => `☑ ${f.options?.find(Boolean) ?? 'First item'}` },
  { id: 'date', label: 'Date', group: 'basics', icon: Calendar, description: 'A calendar day.', example: () => 'Sep 30, 2026' },
  { id: 'time', label: 'Time', group: 'basics', icon: Clock, description: 'A time of day.', example: () => '07:30' },
  { id: 'link', label: 'Link', group: 'basics', icon: Link, description: 'A web address.', example: () => 'https://…' },

  // Measurements
  { id: 'quantity', label: 'Quantity', group: 'measurements', icon: Package, description: 'How many — units, packs, pages.', freeUnit: true, goal: 'at-least', example: (f) => withUnit('3', f.unit || 'units') },
  { id: 'percentage', label: 'Percentage', group: 'measurements', icon: Percent, description: 'Progress or a share, from 0 to 100%.', goal: 'at-least', example: () => '75%' },
  { id: 'rating', label: 'Rating', group: 'measurements', icon: Star, description: 'Stars for effort, mood or quality.', units: ['5 stars', '10 points'], example: (f) => (f.unit === '10 points' ? '8 / 10' : '★★★★☆') },
  { id: 'distance', label: 'Distance', group: 'measurements', icon: Ruler, description: 'How far.', units: ['km', 'mi', 'm'], goal: 'at-least', example: (f) => withUnit('5.2', f.unit) },
  { id: 'duration', label: 'Duration', group: 'measurements', icon: Timer, description: 'How long it took.', units: ['h:mm:ss', 'h:mm', 'mm:ss'], goal: 'at-most', example: (f) => (f.unit === 'mm:ss' ? '27:45' : f.unit === 'h:mm' ? '0:28' : '0:27:45') },
  { id: 'weight', label: 'Weight', group: 'measurements', icon: Weight, description: 'Body weight, a load, a package.', units: ['kg', 'lb', 'g'], goal: 'at-most', example: (f) => withUnit('72.4', f.unit) },
  { id: 'temperature', label: 'Temperature', group: 'measurements', icon: Thermometer, description: 'Weather, a fridge, a fever.', units: ['°C', '°F'], example: (f) => `21${f.unit ?? '°C'}` },

  // Fitness & health
  { id: 'pace', label: 'Pace', group: 'fitness', icon: Gauge, description: 'Time per distance. Can be calculated from Distance and Duration.', units: ['min/km', 'min/mi'], goal: 'at-most', example: (f) => withUnit('5:20', f.unit) },
  { id: 'heart-rate', label: 'Heart rate', group: 'fitness', icon: HeartPulse, description: 'Beats per minute.', units: ['bpm'], goal: 'at-most', example: () => '148 bpm' },
  { id: 'calories', label: 'Calories', group: 'fitness', icon: Flame, description: 'Energy burned or eaten.', units: ['kcal'], goal: 'at-least', example: () => '420 kcal' },
  { id: 'sets-reps', label: 'Sets × reps', group: 'fitness', icon: Dumbbell, description: 'Unfolds into sets, reps and load for each exercise.', units: ['kg', 'lb'], example: (f) => `4 sets × 10 reps · 40 ${f.unit ?? 'kg'}` },

  // Money & shopping
  { id: 'money', label: 'Money', group: 'money', icon: Banknote, description: 'A price, a cost, a budget.', units: ['BRL', 'USD', 'EUR', 'GBP'], goal: 'at-most', example: (f) => new Intl.NumberFormat('en-US', { style: 'currency', currency: f.unit ?? 'BRL' }).format(24.9) },

  // Media & documents
  { id: 'photo', label: 'Photo', group: 'documents', icon: Camera, description: 'A picture taken when logging.', example: () => '📷 photo.jpg' },
  { id: 'file', label: 'File / document', group: 'documents', icon: Paperclip, description: 'A PDF, receipt or report.', example: () => '📎 report.pdf' },
  { id: 'signature', label: 'Signature', group: 'documents', icon: Signature, description: 'Someone signs to confirm or approve.', example: () => '✍︎ Signed by you' },
  { id: 'location', label: 'Location', group: 'documents', icon: MapPin, description: 'An address or the place you were.', example: () => 'Ibirapuera Park' },
]

export const fieldTypeById = Object.fromEntries(fieldTypes.map((t) => [t.id, t])) as Record<FieldTypeId, FieldTypeDef>

export const fieldErrorId = (fieldId: string, part: 'label' | 'options' | 'goal') => `field-${fieldId}-${part}`

export const newFieldId = () => Math.random().toString(36).slice(2, 10)

/** Fields a new type starts with — the first unit, two empty options, etc. */
export function defaultsFor(type: FieldTypeId): Omit<CustomField, 'id' | 'label' | 'type'> {
  const def = fieldTypeById[type]
  return {
    unit: def.units?.[0],
    options: def.options ? ['', ''] : undefined,
    autoCalculate: type === 'pace' ? true : undefined,
  }
}

type TemplateField = Omit<CustomField, 'id'>

export type FieldTemplate = { id: string; label: string; icon: LucideIcon; fields: TemplateField[] }

export const fieldTemplates: FieldTemplate[] = [
  {
    id: 'running',
    label: 'Running',
    icon: Footprints,
    fields: [
      { type: 'distance', label: 'Distance', unit: 'km', goal: { target: '10', direction: 'at-least' } },
      { type: 'duration', label: 'Time', unit: 'h:mm:ss' },
      { type: 'pace', label: 'Pace', unit: 'min/km', autoCalculate: true },
      { type: 'heart-rate', label: 'Avg heart rate', unit: 'bpm' },
    ],
  },
  {
    id: 'gym',
    label: 'Gym',
    icon: Dumbbell,
    fields: [
      { type: 'sets-reps', label: 'Exercise', unit: 'kg' },
      { type: 'weight', label: 'Body weight', unit: 'kg' },
      { type: 'rating', label: 'Effort', unit: '5 stars' },
    ],
  },
  {
    id: 'groceries',
    label: 'Groceries',
    icon: ShoppingCart,
    fields: [
      { type: 'checklist', label: 'Items', options: ['Rice', 'Coffee', 'Fruit'] },
      { type: 'money', label: 'Total spent', unit: 'BRL', goal: { target: '600', direction: 'at-most' } },
      { type: 'text', label: 'Store' },
    ],
  },
  {
    id: 'plants',
    label: 'Plant care',
    icon: Leaf,
    fields: [
      { type: 'date', label: 'Last watered' },
      { type: 'choice', label: 'Sunlight', options: ['Full sun', 'Partial shade', 'Shade'] },
      { type: 'photo', label: 'Progress photo' },
    ],
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: Wrench,
    fields: [
      { type: 'text', label: 'Serial number' },
      { type: 'date', label: 'Last service' },
      { type: 'number', label: 'Service interval', unit: 'days' },
      { type: 'file', label: 'Service report' },
      { type: 'signature', label: 'Sign-off' },
    ],
  },
  {
    id: 'study',
    label: 'Study',
    icon: BookOpen,
    fields: [
      { type: 'duration', label: 'Study time', unit: 'h:mm' },
      { type: 'percentage', label: 'Course progress', goal: { target: '100', direction: 'at-least' } },
      { type: 'link', label: 'Material' },
    ],
  },
]
