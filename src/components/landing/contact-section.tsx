"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { PROFILE } from "@/lib/portfolio"

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'
const CONTAINER = "max-w-[1400px] 2xl:max-w-[1600px] mx-auto"

const SLOTS = ["09:00", "10:30", "13:00", "14:30", "16:00"]
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/55 bg-black/[0.04]">
      {children}
    </span>
  )
}

function Icon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const PATHS = {
  mail: "M3 7l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z",
  pin: "M12 21s7-5.686 7-11a7 7 0 10-14 0c0 5.314 7 11 7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  cal: "M8 3v3M16 3v3M4 8h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z",
  chevL: "M15 18l-6-6 6-6",
  chevR: "M9 6l6 6-6 6",
  arrow: "M4 12h14M13 6l6 6-6 6",
}

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current

    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })

    obs.observe(el)

    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

export function ContactSection() {
  const { ref, inView } = useInView(0.06)

  // `today` is resolved on the client only. Deriving it during render would
  // make the server and client markup disagree on which dates are selectable.
  const [today, setToday] = useState<Date | null>(null)
  const [cursor, setCursor] = useState<{ y: number; m: number } | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const now = new Date()

    now.setHours(0, 0, 0, 0)
    setToday(now)
    setCursor({ y: now.getFullYear(), m: now.getMonth() })
  }, [])

  const cells = useMemo(() => {
    if (!cursor) return []
    const first = new Date(cursor.y, cursor.m, 1)
    const days = new Date(cursor.y, cursor.m + 1, 0).getDate()
    const lead = first.getDay()

    return [
      ...Array.from({ length: lead }, () => null),
      ...Array.from({ length: days }, (_, i) => new Date(cursor.y, cursor.m, i + 1)),
    ]
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

  const atEarliestMonth =
    !!today && !!cursor && cursor.y === today.getFullYear() && cursor.m === today.getMonth()

  const ready = picked && time

  const bookHref = ready
    ? `/contact?date=${encodeURIComponent(picked)}&time=${encodeURIComponent(time)}&topic=${encodeURIComponent("Workflow Audit")}`
    : "/contact"

  return (
    <section id="contact" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
      <div className={CONTAINER}>

        <div className="mb-16">
          <Tag>CONTACT</Tag>
          <h2
            className="mt-6 text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.05] tracking-tight text-[#111]"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Book a workflow audit.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-black/62 max-w-xl">
            Thirty minutes, no charge. Bring the process that eats your week and I will tell you
            whether it is worth automating, and on which platform.
          </p>
        </div>

        <div ref={ref} className="grid lg:grid-cols-2 gap-5 items-start">

          {/* ── Profile card ────────────────────────────────────────────── */}
          <div
            className="rounded-2xl border border-black/[0.07] bg-white/60 p-8 lg:p-10"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <h3
              className="text-2xl lg:text-3xl font-light tracking-tight text-[#111]"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              {PROFILE.name}
            </h3>
            <p className="mt-1.5 text-[14px] text-black/60">
              {PROFILE.title} · {PROFILE.credential}
            </p>

            <div className="mt-9 grid sm:grid-cols-2 gap-x-6 gap-y-7">
              <div className="flex gap-3">
                <span className="mt-0.5 text-black/55"><Icon d={PATHS.mail} /></span>
                <div className="min-w-0">
                  <p className="text-[10px] tracking-widest font-mono text-black/55">EMAIL</p>
                  <a
                    href={`mailto:${PROFILE.email}`}
                    className="mt-1 block text-[14px] text-black/70 hover:text-black transition-colors break-all"
                  >
                    {PROFILE.email}
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-0.5 text-black/55"><Icon d={PATHS.pin} /></span>
                <div>
                  <p className="text-[10px] tracking-widest font-mono text-black/55">LOCATION</p>
                  <p className="mt-1 text-[14px] text-black/70">{PROFILE.location}</p>
                  <p className="text-[12px] text-black/55">Working across time zones</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-0.5 text-black/55"><Icon d={PATHS.cal} /></span>
                <div>
                  <p className="text-[10px] tracking-widest font-mono text-black/55">AVAILABILITY</p>
                  <p className="mt-1 text-[14px] text-black/70">
                    Open for workflow audits &amp; custom builds
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-0.5 text-black/55"><Icon d={PATHS.arrow} /></span>
                <div>
                  <p className="text-[10px] tracking-widest font-mono text-black/55">RESPONSE</p>
                  <p className="mt-1 text-[14px] text-black/70">Usually within one business day</p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-black/[0.07] flex flex-wrap gap-2">
              {PROFILE.socials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-full border border-black/10 text-[11px] tracking-wide text-black/55 hover:text-black hover:border-black/25 hover:bg-black/[0.03] transition-all"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* ── Booking panel ───────────────────────────────────────────── */}
          <div
            className="rounded-2xl border border-black/[0.07] bg-white p-8 lg:p-10"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1) 120ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) 120ms",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-widest font-mono text-black/55">
                  WORKFLOW AUDIT · 30 MIN · FREE
                </p>
                <h3
                  className="mt-2 text-2xl font-light tracking-tight text-[#111]"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  Book a slot
                </h3>
                <p className="mt-1.5 text-[13px] text-black/60">
                  Pick a weekday, then a time (PH time, UTC+8).
                </p>
              </div>
              <span className="hidden sm:flex w-10 h-10 shrink-0 rounded-xl border border-black/10 items-center justify-center text-black/55">
                <Icon d={PATHS.cal} />
              </span>
            </div>

            {/* Calendar */}
            <div className="mt-7 rounded-xl border border-black/[0.07] bg-black/[0.015] p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => shift(-1)}
                  disabled={atEarliestMonth}
                  aria-label="Previous month"
                  className="w-8 h-8 rounded-lg border border-black/10 flex items-center justify-center text-black/62 hover:text-black hover:border-black/25 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <Icon d={PATHS.chevL} />
                </button>
                <p className="text-[12px] tracking-widest font-mono text-black/60">
                  {cursor ? `${MONTHS[cursor.m].toUpperCase()} ${cursor.y}` : " "}
                </p>
                <button
                  type="button"
                  onClick={() => shift(1)}
                  aria-label="Next month"
                  className="w-8 h-8 rounded-lg border border-black/10 flex items-center justify-center text-black/62 hover:text-black hover:border-black/25 transition-all"
                >
                  <Icon d={PATHS.chevR} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_LABELS.map((d, i) => (
                  <span key={i} className="text-center text-[11px] font-mono text-black/62 py-1">
                    {d}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {cells.map((d, i) => {
                  if (!d) return <span key={`pad-${i}`} />
                  const key = iso(d)
                  const ok = selectable(d)
                  const isPicked = picked === key

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!ok}
                      onClick={() => { setPicked(key); setTime(null) }}
                      className={`h-9 rounded-lg text-[13px] transition-all ${
                        isPicked
                          ? "bg-[#111] text-white"
                          : ok
                            ? "text-black/70 hover:bg-black/[0.06]"
                            : "text-black/20 cursor-default"
                      }`}
                    >
                      {d.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Times */}
            <p className="mt-7 text-[10px] tracking-widest font-mono text-black/55">AVAILABLE TIMES</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SLOTS.map(t => (
                <button
                  key={t}
                  type="button"
                  disabled={!picked}
                  onClick={() => setTime(t)}
                  className={`px-4 py-2.5 rounded-lg border text-[13px] transition-all ${
                    time === t
                      ? "bg-[#111] text-white border-[#111]"
                      : picked
                        ? "border-black/12 text-black/65 hover:border-black/30 hover:bg-black/[0.03]"
                        : "border-black/[0.07] text-black/62 cursor-default"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-black/55">
              {!picked ? "Pick a date first." : !time ? "Now pick a time." : "Confirm on the next step."}
            </p>

            <a
              href={bookHref}
              aria-disabled={!ready}
              className={`mt-7 flex items-center justify-center gap-2.5 w-full px-5 py-3.5 rounded-full text-[13px] tracking-wide transition-colors ${
                ready
                  ? "bg-[#111] text-white hover:bg-black"
                  : "bg-black/[0.05] text-black/55 pointer-events-none"
              }`}
            >
              <Icon d={PATHS.cal} />
              {ready ? "Continue with this slot" : "Select a date and time"}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
