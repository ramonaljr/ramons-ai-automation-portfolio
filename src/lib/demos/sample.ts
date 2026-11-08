/**
 * Dates for sample data. Every build here runs on US Central time, and a demo's
 * dates are worked out from the moment a visitor presses Execute, so a booking
 * is always ahead and an overdue invoice is always overdue.
 */

export const CENTRAL = 'America/Chicago'

/** UTC offset of Central time on a date, as n8n prints it: "-06:00". */
export function centralOffset(date: Date) {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: CENTRAL, timeZoneName: 'shortOffset' })
    .formatToParts(date)
    .find(part => part.type === 'timeZoneName')?.value

  const hours = Number(name?.replace('GMT', '') || -6)

  return `${hours < 0 ? '-' : '+'}${String(Math.abs(hours)).padStart(2, '0')}:00`
}

/** The calendar date in Central time, `days` from now: "2026-11-09". */
export function dayFrom(now: Date, days = 0) {
  return new Date(now.getTime() + days * 86_400_000).toLocaleDateString('en-CA', { timeZone: CENTRAL })
}

/** The weekday `ahead` working days from now, in Central time. */
export function workday(now: Date, ahead = 1) {
  let date = dayFrom(now)
  let left = ahead

  while (left > 0) {
    date = shift(date, 1)
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay()

    if (weekday !== 0 && weekday !== 6) left--
  }

  return date
}

/** A calendar date moved by whole days. */
export const shift = (date: string, days: number) =>
  new Date(new Date(`${date}T12:00:00Z`).getTime() + days * 86_400_000).toISOString().slice(0, 10)

/** A local Central time on a date, with its offset: "2026-11-09T10:00:00-06:00". */
export const at = (date: string, time: string) => `${date}T${time}:00${centralOffset(new Date(`${date}T12:00:00Z`))}`

/** "Monday, November 9". */
export const longDay = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  })

/** "Nov 9, 2026". */
export const shortDay = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })

/** "7:51 PM", Central time. */
export const clock = (moment: Date) =>
  moment.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: CENTRAL })

/** A moment `minutes` from now, as ISO. */
export const minutesFrom = (now: Date, minutes: number) => new Date(now.getTime() + minutes * 60_000).toISOString()

/** "$4,250.00". */
export const usd = (amount: number) =>
  amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
