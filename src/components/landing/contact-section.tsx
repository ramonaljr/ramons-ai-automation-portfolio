'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { PROFILE } from '@/lib/portfolio'
import { SectionIntro } from '@/components/landing/section-intro'

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'
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

function Icon({ d }: { d: string }) {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.7'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d={d} />
    </svg>
  )
}

const PATHS = {
  mail: 'M3 7l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z',
  pin: 'M12 21s7-5.686 7-11a7 7 0 10-14 0c0 5.314 7 11 7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  cal: 'M8 3v3M16 3v3M4 8h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
  chevL: 'M15 18l-6-6 6-6',
  chevR: 'M9 6l6 6-6 6',
  arrow: 'M4 12h14M13 6l6 6-6 6'
}

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

export function ContactSection() {
  const { ref, inView } = useInView(0.06)

  // `today` is resolved on the client only. Deriving it during render would
  // make the server and client markup disagree on which dates are selectable.
  const [today, setToday] = useState<Date | null>(null)
  const [cursor, setCursor] = useState<{ y: number; m: number } | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)

  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState(false)

  // `today` must resolve on the client — deriving it during render would make
  // the server and client disagree on which dates are selectable.
  useEffect(() => {
    const now = new Date()

    now.setHours(0, 0, 0, 0)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(now)
    setCursor({ y: now.getFullYear(), m: now.getMonth() })
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

    return d >= today && dow !== 0 && dow !== 6 // weekdays, today onward
  }

  const shift = (by: number) => {
    if (!cursor) return
    const d = new Date(cursor.y, cursor.m + by, 1)

    setCursor({ y: d.getFullYear(), m: d.getMonth() })
  }

  const atEarliestMonth = !!today && !!cursor && cursor.y === today.getFullYear() && cursor.m === today.getMonth()

  const ready = picked && time

  // Naming the slot on the button means the confirmation step is never a
  // surprise. Safe during render because both values start null and are only
  // ever set by a click.
  const slotLabel =
    picked && time
      ? `${new Date(`${picked}T00:00:00`).toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        })}, ${time}`
      : ''

  const bookHref = ready
    ? `/contact?date=${encodeURIComponent(picked)}&time=${encodeURIComponent(time)}&topic=${encodeURIComponent('Workflow Audit')}`
    : '/contact'

  return (
    <section id='contact' className='border-rule border-t px-6 py-32 md:px-12 lg:px-20'>
      <div className={CONTAINER}>
        <SectionIntro
          tag='CONTACT'
          title={<>Book a workflow audit.</>}
          blurb='Thirty minutes, no charge. Bring the process that eats your week and I will tell you whether it is worth automating, and on which platform.'
        />

        <div ref={ref} className='grid items-start gap-5 lg:grid-cols-2'>
          {/* ── Profile card ────────────────────────────────────────────── */}
          <div
            className='border-rule bg-surface rounded-2xl border p-8 lg:p-10'
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)'
            }}
          >
            <h3
              className='text-ink text-2xl font-light tracking-tight lg:text-3xl'
              style={{ fontFamily: DISPLAY_FONT }}
            >
              {PROFILE.name}
            </h3>
            <p className='text-ink-2 mt-1.5 text-[14px]'>
              {PROFILE.title} · {PROFILE.credential}
            </p>

            <div className='mt-9 grid gap-x-6 gap-y-7 sm:grid-cols-2'>
              <div className='flex gap-3'>
                <span className='text-ink-2 mt-0.5'>
                  <Icon d={PATHS.mail} />
                </span>
                <div className='min-w-0'>
                  <p className='eyebrow'>EMAIL</p>
                  <a
                    href={`mailto:${PROFILE.email}`}
                    className='text-ink-2 hover:text-ink mt-1 block text-[14px] break-all transition-colors'
                  >
                    {PROFILE.email}
                  </a>
                </div>
              </div>

              <div className='flex gap-3'>
                <span className='text-ink-2 mt-0.5'>
                  <Icon d={PATHS.pin} />
                </span>
                <div>
                  <p className='eyebrow'>LOCATION</p>
                  <p className='text-ink-2 mt-1 text-[14px]'>{PROFILE.location}</p>
                  <p className='text-ink-2 text-[13px]'>Working across time zones</p>
                </div>
              </div>

              <div className='flex gap-3'>
                <span className='text-ink-2 mt-0.5'>
                  <Icon d={PATHS.cal} />
                </span>
                <div>
                  <p className='eyebrow'>AVAILABILITY</p>
                  <p className='text-ink-2 mt-1 text-[14px]'>Open for workflow audits &amp; custom builds</p>
                </div>
              </div>

              <div className='flex gap-3'>
                <span className='text-ink-2 mt-0.5'>
                  <Icon d={PATHS.arrow} />
                </span>
                <div>
                  <p className='eyebrow'>RESPONSE</p>
                  <p className='text-ink-2 mt-1 text-[14px]'>Usually within one business day</p>
                </div>
              </div>
            </div>

            <div className='border-rule mt-10 flex flex-wrap gap-2 border-t pt-8'>
              {PROFILE.socials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='border-rule text-ink-2 hover:text-ink hover:border-rule-strong hover:bg-ink/3 rounded-full border px-4 py-2.5 text-[12px] tracking-wide transition-all'
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* ── Booking panel ───────────────────────────────────────────── */}
          <div
            className='border-rule bg-surface-raised rounded-2xl border p-8 lg:p-10'
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
                  Thirty minutes, free. All times Philippine time (UTC+8).
                </p>
              </div>
              <span className='border-rule text-ink-2 hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border sm:flex'>
                <Icon d={PATHS.cal} />
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
                  <Icon d={PATHS.chevL} />
                </button>
                <p className='text-ink text-[15px]' style={{ fontFamily: DISPLAY_FONT }}>
                  {cursor ? `${MONTHS[cursor.m]} ${cursor.y}` : ' '}
                </p>
                <button
                  type='button'
                  onClick={() => shift(1)}
                  aria-label='Next month'
                  className='border-rule text-ink-2 hover:text-ink hover:border-rule-strong flex h-8 w-8 items-center justify-center rounded-lg border transition-all'
                >
                  <Icon d={PATHS.chevR} />
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
            <p className='eyebrow mt-7'>Available times</p>
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
                      aria-label={s.available ? s.time : `${s.time} — unavailable`}
                      onClick={() => setTime(s.time)}
                      className={`rounded-lg border px-4 py-2.5 text-[14px] tabular-nums transition-all ${
                        time === s.time
                          ? 'border-ink bg-ink/6 text-ink font-medium'
                          : s.available
                            ? 'border-rule text-ink-2 hover:border-rule-strong hover:bg-ink/3'
                            : 'border-rule text-ink-4 decoration-ink/25 cursor-default line-through'
                      }`}
                    >
                      {s.time}
                    </button>
                  )
                })
              )}
            </div>
            <p className='text-ink-3 mt-3 min-h-[1.25rem] text-[13px]' aria-live='polite'>
              {!picked
                ? ''
                : loadingSlots
                  ? 'Checking my calendar…'
                  : slotsError
                    ? "Could not load times just now — send a message below and I'll confirm by email."
                    : slots && slots.every(s => !s.available)
                      ? 'Nothing free that day. Try another date.'
                      : !time
                        ? 'Now pick a time.'
                        : 'Confirm on the next step.'}
            </p>

            <a
              href={bookHref}
              aria-disabled={!ready}
              className={`mt-7 flex w-full items-center justify-center gap-2.5 rounded-full px-5 py-3.5 text-[14px] tracking-wide transition-colors ${
                ready ? 'bg-ink text-ground hover:bg-ink/90' : 'bg-ink/5 text-ink-2 pointer-events-none'
              }`}
            >
              <Icon d={PATHS.cal} />
              {ready ? `Continue with ${slotLabel}` : 'Select a date and time'}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
