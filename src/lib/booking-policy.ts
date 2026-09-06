export const BOOKING_TIMEZONE = 'Asia/Manila'
export const BOOKING_UTC_OFFSET = '+08:00'
export const BOOKABLE_TIMES = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'] as const
export const BOOKING_DURATION_MINUTES = 30
export const MIN_BOOKING_LEAD_MINUTES = 30
export const MAX_BOOKING_DAYS = 90

const DAY_MS = 86_400_000
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

type DateParts = { year: number; month: number; day: number }
type BookingDateValidation =
  | { valid: false; error: 'date' | 'past' | 'horizon' }
  | { valid: true; parts: DateParts; dayStart: number }

function parseDateParts(value: string): DateParts | null {
  if (!DATE_RE.test(value)) return null

  const [year, month, day] = value.split('-').map(Number)
  const canonical = new Date(Date.UTC(year, month - 1, day))

  if (
    canonical.getUTCFullYear() !== year ||
    canonical.getUTCMonth() !== month - 1 ||
    canonical.getUTCDate() !== day
  ) {
    return null
  }

  return { year, month, day }
}

export function manilaDateKey(now = Date.now()) {
  return new Date(now + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function manilaTodayStart(now: number) {
  const date = manilaDateKey(now)

  return Date.parse(`${date}T00:00:00${BOOKING_UTC_OFFSET}`)
}

export function validateBookingDate(value: string, now = Date.now()): BookingDateValidation {
  const parts = parseDateParts(value)

  if (!parts) return { valid: false, error: 'date' as const }

  const dayStart = Date.parse(`${value}T00:00:00${BOOKING_UTC_OFFSET}`)
  const todayStart = manilaTodayStart(now)

  if (dayStart < todayStart) return { valid: false, error: 'past' as const }
  if (dayStart > todayStart + MAX_BOOKING_DAYS * DAY_MS) return { valid: false, error: 'horizon' as const }

  return { valid: true, parts, dayStart }
}

export function validateBookingSlot(date: string, time: string, now = Date.now()) {
  const dateResult = validateBookingDate(date, now)
  const errors: string[] = []

  if (!dateResult.valid) errors.push(dateResult.error)
  if (!TIME_RE.test(time)) errors.push('time')

  if (!errors.length && dateResult.valid) {
    const weekday = new Date(Date.UTC(dateResult.parts.year, dateResult.parts.month - 1, dateResult.parts.day)).getUTCDay()

    if (weekday === 0 || weekday === 6 || !BOOKABLE_TIMES.includes(time as (typeof BOOKABLE_TIMES)[number])) {
      errors.push('not_offered')
    }

    const startsAt = Date.parse(`${date}T${time}:00${BOOKING_UTC_OFFSET}`)

    if (startsAt < now + MIN_BOOKING_LEAD_MINUTES * 60_000) errors.push('lead_time')
  }

  return { valid: errors.length === 0, errors }
}
