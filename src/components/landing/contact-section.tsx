'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { CalendarDays, ChevronLeft, ChevronRight, Mail } from 'lucide-react'

import { formatSlotLocal, isManilaClock, manilaDateKey, MAX_BOOKING_DAYS, slotInstant } from '@/lib/booking-policy'

import { PROFILE } from '@/lib/portfolio'
import { SectionIntro } from '@/components/landing/section-intro'

import { DISPLAY_FONT, ICON_STROKE } from '@/components/landing/motion'

const CONTAINER = 'max-w-[1400px] 2xl:max-w-[1600px] mx-auto'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/**
 * The times row reserves its height rather than filling with placeholder
 * times. Fake times rendered struck through said "everything is taken" before
 * a date had even been chosen — a state the data could not support. The real
 * list always comes from /api/availability, which reads Ramon's calendar;
 * hard-coding offered times here is what once made the site advertise 10:30
 * and 14:30, which the booking endpoint then rejected as outside bookable
 * hours.
 */
const TIMES_ROW_MIN_H = 'min-h-[2.75rem]'

type Slot = { time: string; available: boolean }

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current

    if (!el) return

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true)
      },
      { threshold }
    )

    obs.observe(el)

    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** The first weekday on or after `from`: the earliest day a call can be booked. */
const firstWeekday = (from: Date) => {
  const day = new Date(from)

  while (day.getDay() === 0 || day.getDay() === 6) day.setDate(day.getDate() + 1)

  return day
}

export function ContactSection() {
  const { ref, inView } = useInView(0.06)

  // `today` is resolved on the client only. Deriving it during render would
  // make the server and client markup disagree on which dates are selectable.
  const [today, setToday] = useState<Date | null>(null)
  const [cursor, setCursor] = useState<{ y: number; m: number } | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)

  /**
   * The first open slot on the next bookable weekday, so the section can say
   * "Next opening: Tue 10:00" before anyone touches the calendar. One request,
   * made once the section is on screen; if that day is full or the calendar is
   * unreachable, the section states the standing hours instead of guessing.
   */
  const [nextOpening, setNextOpening] = useState<{ date: string; time: string } | null>(null)

  const [slots, setSlots] = useState<Slot[] | null>(null)

  /**
   * The visitor's time zone, read on the client. Slots are Manila times, which
   * left a visitor in New York converting 13:00 UTC+8 in their head; every
   * slot is shown in their own time instead, and booked as the Manila slot it
   * is. Null until mounted, and for visitors already on Manila time.
   */
  const [zone, setZone] = useState<string | null>(null)

  useEffect(() => {
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isManilaClock(new Date())) setZone(local || 'your time zone')
  }, [])

  /**
   * A Manila slot in the visitor's own time, always with their weekday: the
   * same Manila day can span two of theirs, and a bare "1:00 AM" after a run
   * of evening slots hides that the day has changed.
   */
  const localTime = (date: string, slot: string) => {
    if (!zone) return slot

    const at = slotInstant(date, slot)

    return `${at.toLocaleDateString(undefined, { weekday: 'short' })} ${formatSlotLocal(date, slot, false)}`
  }

  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState(false)

  // `today` must resolve on the client — deriving it during render would make
  // the server and client disagree on which dates are selectable.
  useEffect(() => {
    const [year, month, day] = manilaDateKey().split('-').map(Number)
    const now = new Date(year, month - 1, day)

    now.setHours(0, 0, 0, 0)

    // Open on the month of the first bookable day, not today's: on the last
    // weekend of a month, today's month has nothing left to pick, and the
    // calendar opened on a grid of greyed-out days.
    const first = firstWeekday(now)

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(now)
    setCursor({ y: first.getFullYear(), m: first.getMonth() })
  }, [])

  // Choosing a date owns the reset. Doing it here rather than in the effect
  // keeps the effect body free of synchronous setState, which cascades renders
  // and is what `react-hooks/set-state-in-effect` exists to catch.
  const pickDate = (key: string) => {
    setPicked(key)
    setTime(null)
    setSlots(null)
    setSlotsError(false)
    setLoadingSlots(true)
  }

  // Real availability for the chosen day, straight from Ramon's calendar.
  useEffect(() => {
    if (!picked) return

    // A slow response for a date the visitor has already moved on from must
    // not overwrite the current one, so a stale reply is discarded on cleanup.
    let live = true

    fetch(`/api/availability?date=${encodeURIComponent(picked)}`)
      .then(r => r.json())
      .then((d: { ok?: boolean; slots?: Slot[] }) => {
        if (!live) return
        if (d?.ok && Array.isArray(d.slots)) setSlots(d.slots)
        else setSlotsError(true)
      })
      .catch(() => {
        if (live) setSlotsError(true)
      })
      .finally(() => {
        if (live) setLoadingSlots(false)
      })

    return () => {
      live = false
    }
  }, [picked])

  useEffect(() => {
    if (!inView || !today) return

    const key = iso(firstWeekday(today))
    let live = true

    fetch(`/api/availability?date=${encodeURIComponent(key)}`)
      .then(r => r.json())
      .then((d: { ok?: boolean; slots?: Slot[] }) => {
        const open = d?.ok && Array.isArray(d.slots) ? d.slots.find(slot => slot.available) : undefined

        if (live && open) setNextOpening({ date: key, time: open.time })
      })
      .catch(() => undefined)

    return () => {
      live = false
    }
  }, [inView, today])

  const cells = useMemo(() => {
    if (!cursor) return []
    const first = new Date(cursor.y, cursor.m, 1)
    const days = new Date(cursor.y, cursor.m + 1, 0).getDate()
    const lead = first.getDay()

    const grid: (Date | null)[] = [
      ...Array.from({ length: lead }, () => null),
      ...Array.from({ length: days }, (_, i) => new Date(cursor.y, cursor.m, i + 1))
    ]

    // Padded to whole weeks so the weekend wash reads as two continuous
    // columns rather than stopping partway down the last row.
    while (grid.length % 7 !== 0) grid.push(null)

    return grid
  }, [cursor])

  const selectable = (d: Date) => {
    if (!today) return false
    const dow = d.getDay()
    const latest = new Date(today)

    latest.setDate(latest.getDate() + MAX_BOOKING_DAYS)

    return d >= today && d <= latest && dow !== 0 && dow !== 6
  }

  const shift = (by: number) => {
    if (!cursor) return
    const d = new Date(cursor.y, cursor.m + by, 1)

    setCursor({ y: d.getFullYear(), m: d.getMonth() })
  }

  const atEarliestMonth = !!today && !!cursor && cursor.y === today.getFullYear() && cursor.m === today.getMonth()
  const latest = today ? new Date(today) : null

  latest?.setDate(latest.getDate() + MAX_BOOKING_DAYS)

  const atLatestMonth = !!latest && !!cursor && cursor.y === latest.getFullYear() && cursor.m === latest.getMonth()

  const ready = picked && time

  // Naming the slot on the button means the confirmation step is never a
  // surprise. Safe during render because both values start null and are only
  // ever set by a click.
  const slotLabel =
    picked && time
      ? zone
        ? formatSlotLocal(picked, time)
        : `${new Date(`${picked}T00:00:00`).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          })}, ${time}`
      : ''

  const bookHref = ready
    ? `/contact?date=${encodeURIComponent(picked)}&time=${encodeURIComponent(time)}&topic=${encodeURIComponent('Free 30-minute call')}`
    : '/contact'

  return (
    <section id='contact' className='contact-scene saas-section relative px-6 py-16 md:px-12 md:py-24 lg:px-20'>
      <div className={CONTAINER}>
        {/* One panel, booking first: the pitch, what happens next and the
            other ways to reach me on the left, the calendar on the right and
            always open. The profile card that sat beside it repeated the nav
            and footer (email, location, socials), so it is folded into the
            links here. */}
        <div ref={ref} className='contact-panel'>
          <div className='contact-pitch'>
            <SectionIntro
              title={<>Book a free 30‑minute call.</>}
              blurb='No charge, no deck. Bring the process that eats your week and I will tell you whether it is worth automating, and on which platform.'
              margin=''
            />

            {/* What happens after the click, so the booking is not a leap. */}
            <ol className='contact-steps'>
              {[
                ['Pick a time', 'Any open weekday slot, shown in your own time zone.'],
                ['30-minute call', 'Walk me through the process that eats your week.'],
                [
                  'Summary and quote in 48 hours',
                  'Whether it is worth automating, on which platform, and a fixed quote, or the audit first if it needs mapping.'
                ]
              ].map(([title, copy], index) => (
                <li key={title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </li>
              ))}
            </ol>

            <div className='contact-reach'>
              <p className='contact-next' aria-live='polite'>
                <i aria-hidden='true' />
                {nextOpening ? (
                  <>
                    Next opening:{' '}
                    <button
                      type='button'
                      onClick={() => {
                        pickDate(nextOpening.date)
                        setTime(nextOpening.time)
                      }}
                    >
                      {zone
                        ? formatSlotLocal(nextOpening.date, nextOpening.time)
                        : `${new Date(`${nextOpening.date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short' })} ${nextOpening.time}`}
                    </button>{' '}
                    {zone ? '(your time)' : '(Manila time)'}
                  </>
                ) : (
                  <>Calls run Monday to Friday, 9:00-11:00 and 13:00-17:00 Manila time.</>
                )}
              </p>

              <ul className='contact-links'>
                <li>
                  <a href={`mailto:${PROFILE.email}`}>
                    <Mail size={14} strokeWidth={ICON_STROKE} aria-hidden='true' />
                    {PROFILE.email}
                  </a>
                </li>
                {PROFILE.socials.map(s => (
                  <li key={s.label}>
                    <a href={s.href} target='_blank' rel='noopener noreferrer'>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className='contact-response'>Replies usually within one business day.</p>
            </div>
          </div>

          {/* ── Booking panel ───────────────────────────────────────────── */}
          <div
            className='contact-booking'
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(20px)',
              transition:
                'opacity 0.7s cubic-bezier(0.16,1,0.3,1) 120ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) 120ms'
            }}
          >
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h3 className='text-ink text-2xl font-light tracking-tight' style={{ fontFamily: DISPLAY_FONT }}>
                  Book a slot
                </h3>
                <p className='text-ink-2 mt-1.5 text-[14px]'>
                  Thirty minutes, free.{' '}
                  {zone
                    ? `Times shown in your time zone (${zone}); dates follow the Manila calendar.`
                    : 'All times Philippine time (UTC+8).'}
                </p>
              </div>
              <span className='border-rule text-ink-2 hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border sm:flex'>
                <CalendarDays size={16} strokeWidth={ICON_STROKE} aria-hidden='true' />
              </span>
            </div>

            {/* Calendar */}
            <div className='border-rule bg-ink/1.5 mt-7 rounded-xl border p-4 sm:p-5'>
              <div className='mb-4 flex items-center justify-between'>
                <button
                  type='button'
                  onClick={() => shift(-1)}
                  disabled={atEarliestMonth}
                  aria-label='Previous month'
                  className='border-rule text-ink-2 hover:text-ink hover:border-rule-strong flex h-8 w-8 items-center justify-center rounded-lg border transition-all disabled:pointer-events-none disabled:opacity-30'
                >
                  <ChevronLeft size={16} strokeWidth={ICON_STROKE} aria-hidden='true' />
                </button>
                <p className='text-ink text-[15px]' style={{ fontFamily: DISPLAY_FONT }}>
                  {cursor ? `${MONTHS[cursor.m]} ${cursor.y}` : ' '}
                </p>
                <button
                  type='button'
                  onClick={() => shift(1)}
                  disabled={atLatestMonth}
                  aria-label='Next month'
                  className='border-rule text-ink-2 hover:text-ink hover:border-rule-strong flex h-8 w-8 items-center justify-center rounded-lg border transition-all disabled:pointer-events-none disabled:opacity-30'
                >
                  <ChevronRight size={16} strokeWidth={ICON_STROKE} aria-hidden='true' />
                </button>
              </div>

              <div className='mb-2 grid grid-cols-7 gap-1'>
                {DAY_LABELS.map((d, i) => (
                  <span
                    key={i}
                    className={`py-1 text-center font-mono text-[12px] ${
                      i === 0 || i === 6 ? 'text-ink-4 bg-ink/2 rounded-lg' : 'text-ink-2'
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>

              <div className='grid grid-cols-7 gap-1'>
                {cells.map((d, i) => {
                  // Saturday and Sunday carry a wash so the grid states the
                  // working week, rather than leaving a visitor to discover it
                  // by clicking a dead square.
                  const weekend = i % 7 === 0 || i % 7 === 6

                  if (!d) return <span key={`pad-${i}`} className={weekend ? 'bg-ink/2 rounded-lg' : undefined} />

                  const key = iso(d)
                  const ok = selectable(d)
                  const isPicked = picked === key
                  const isToday = !!today && key === iso(today)

                  // A chosen date is a selection, not an action, so it takes a
                  // ring. The solid ink fill belongs to the one thing worth
                  // pressing next, at the foot of the panel.
                  return (
                    <button
                      key={key}
                      type='button'
                      disabled={!ok}
                      aria-pressed={isPicked}
                      onClick={() => {
                        pickDate(key)
                      }}
                      className={`relative h-9 rounded-lg text-[14px] tabular-nums transition-all ${
                        weekend ? 'bg-ink/2' : ''
                      } ${
                        isPicked
                          ? 'ring-ink text-ink bg-ink/6 font-medium ring-1'
                          : ok
                            ? 'text-ink-2 hover:bg-ink/6'
                            : 'text-ink-4 cursor-default'
                      }`}
                    >
                      {d.getDate()}
                      {isToday && !isPicked && (
                        <span className='bg-ink-4 absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full' />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Times */}
            <p className='label-quiet mt-7'>Available times</p>
            <div className={`mt-3 flex flex-wrap gap-2 ${TIMES_ROW_MIN_H}`}>
              {!picked ? (
                <p className='text-ink-3 self-center text-[14px]'>Pick a weekday to see what is open.</p>
              ) : loadingSlots ? (
                Array.from({ length: 4 }, (_, i) => (
                  <span
                    key={`loading-${i}`}
                    className='border-rule bg-ink/4 h-[42px] w-[76px] animate-pulse rounded-lg border'
                  />
                ))
              ) : (
                (slots ?? []).map(s => {
                  // "Unavailable" rather than "already booked": the endpoint
                  // reports a single flag, and a slot can be closed because it
                  // is booked, past, or a weekend. Naming one of those would be
                  // wrong two times out of three.
                  return (
                    <button
                      key={s.time}
                      type='button'
                      disabled={!s.available}
                      aria-pressed={time === s.time}
                      aria-label={`${localTime(picked, s.time)}${zone ? ` your time (${s.time} Manila)` : ''}${s.available ? '' : ', unavailable'}`}
                      onClick={() => setTime(s.time)}
                      className={`rounded-lg border px-4 py-2.5 text-[14px] tabular-nums transition-all ${
                        time === s.time
                          ? 'border-ink bg-ink/6 text-ink font-medium'
                          : s.available
                            ? 'border-rule text-ink-2 hover:border-rule-strong hover:bg-ink/3'
                            : 'border-rule text-ink-4 decoration-ink/25 cursor-default line-through'
                      }`}
                    >
                      {localTime(picked, s.time)}
                    </button>
                  )
                })
              )}
            </div>
            {/* On a failed load this points to email, not "send a message
                below": the form goes through the same service that just
                failed. Email does not. */}
            <p className='text-ink-3 mt-3 min-h-[1.25rem] text-[13px]' aria-live='polite'>
              {!picked ? (
                ''
              ) : loadingSlots ? (
                'Checking my calendar…'
              ) : slotsError ? (
                <>
                  Could not load times just now. Email{' '}
                  <a
                    href={`mailto:${PROFILE.email}?subject=${encodeURIComponent('Free 30-minute call')}`}
                    className='text-ink underline underline-offset-2'
                  >
                    {PROFILE.email}
                  </a>{' '}
                  and I&apos;ll reply with times.
                </>
              ) : slots && slots.every(s => !s.available) ? (
                'Nothing free that day. Try another date.'
              ) : !time ? (
                'Now pick a time.'
              ) : (
                'Confirm on the next step.'
              )}
            </p>

            <a
              href={bookHref}
              aria-disabled={!ready}
              className={`mt-7 flex w-full items-center justify-center gap-2.5 rounded-full px-5 py-3.5 text-[14px] tracking-wide transition-colors ${
                ready ? 'bg-ink text-ground hover:bg-ink/90' : 'bg-ink/5 text-ink-2 pointer-events-none'
              }`}
            >
              <CalendarDays size={16} strokeWidth={ICON_STROKE} aria-hidden='true' />
              {ready ? `Continue with ${slotLabel}` : 'Select a date and time'}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
