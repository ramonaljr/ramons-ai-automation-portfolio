'use client'

import { useRef, useState } from 'react'

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'

import { EXPERIENCE, type Role } from '@/lib/portfolio'

const DISPLAY_FONT = 'var(--font-editorial), Georgia, serif'

/** Oldest first, so the year runs forward as the reader scrolls. */
const ROLES = [...EXPERIENCE].reverse()

const startYear = (role: Role) => Number(role.period.split(' - ')[0])
const endLabel = (role: Role) => role.period.split(' - ').at(-1)?.trim() ?? ''

/** The axis: 2015 to now, one tick a year. */
const FIRST_YEAR = startYear(ROLES[0])
const NOW_YEAR = new Date().getFullYear()
const TICKS = Array.from({ length: NOW_YEAR - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i)

/**
 * Where the axis stands for a given scroll progress. Each role owns an equal
 * share of the scroll, and across its share the year runs from its own start
 * to the next role's start (or to now), so the marker lands on each role's
 * first year as that role comes into view.
 */
function yearAt(progress: number) {
  const span = progress * ROLES.length
  const index = Math.min(ROLES.length - 1, Math.floor(span))
  const from = startYear(ROLES[index])
  const to = index + 1 < ROLES.length ? startYear(ROLES[index + 1]) : NOW_YEAR

  return from + (to - from) * Math.min(1, span - index)
}

/**
 * How the work is run, stated once. Every line repeats a commitment made
 * elsewhere on the page (process, services, contact), so nothing here is a
 * new claim; it is the same promise gathered where a reader weighing the
 * person behind it will look.
 */
const HOW_I_WORK = [
  { label: 'Business case first', copy: 'Start with the work and the hours it costs, not the software.' },
  {
    label: 'Ready for when things fail',
    copy: 'Every build checks for errors and alerts you when something goes wrong.'
  },
  { label: 'Human control retained', copy: 'A person reviews anything where a mistake would be expensive.' },
  { label: 'Documented handover', copy: 'Your team can run and extend it without me.' }
] as const

const HEADING = 'Four roles. One habit: map the work first.'

const BLURB =
  'Each role handed me a process to run by hand: invoices and supplier payments, project cost records, month-end accounts, then forecasting.'

/**
 * The career, closing About. It keeps the `experience` id so existing links
 * still land on it.
 *
 * On wide, tall-enough screens it is a pinned timeline like the Story section:
 * the year runs forward from 2015 as the reader scrolls, the role card swaps
 * to the job held then, and an axis along the foot fills toward now. Everywhere
 * else (phones, short screens, reduced motion) the same roles are a plain
 * list. Only one of the two is ever displayed, so screen readers meet the
 * roles once.
 */
export function ExperienceJourney() {
  return (
    <div id='experience' className='about-journey'>
      <PinnedTimeline />
      <RoleList />

      <div className='mx-auto max-w-[1240px]'>
        <div className='experience-after'>
          <div className='experience-how'>
            <p className='experience-how-label'>How I work</p>
            <ul>
              {HOW_I_WORK.map(item => (
                <li key={item.label}>
                  <strong>{item.label}</strong>
                  <span>{item.copy}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className='experience-thesis'>
            Every system on this page began as something on that list. <a href='#portfolio'>See examples</a>
          </p>
        </div>
      </div>
    </div>
  )
}

function PinnedTimeline() {
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)

  // State changes only when the reader crosses into another role's share.
  useMotionValueEvent(scrollYProgress, 'change', latest => {
    const next = Math.min(ROLES.length - 1, Math.max(0, Math.floor(latest * ROLES.length)))

    if (next !== active) setActive(next)
  })

  const fill = useTransform(
    scrollYProgress,
    p => (yearAt(Math.min(0.9999, Math.max(0, p))) - FIRST_YEAR) / (NOW_YEAR - FIRST_YEAR)
  )

  const marker = useTransform(fill, f => `${(f * 100).toFixed(3)}%`)

  // Jumps the scroll to the middle of a role's share, so the tabs work as
  // navigation as well as a legend.
  const goTo = (index: number) => {
    const track = trackRef.current

    if (!track) return

    const top = track.getBoundingClientRect().top + window.scrollY
    const run = track.offsetHeight - window.innerHeight

    window.scrollTo({ top: top + run * ((index + 0.5) / ROLES.length), behavior: 'smooth' })
  }

  const role = ROLES[active]

  return (
    <div ref={trackRef} className='experience-track'>
      <div className='experience-stage'>
        <div className='experience-screen'>
          <div className='experience-side'>
            {/* A <p>, not an <h2>: the list version below carries the heading,
                and only one of the two is ever displayed. */}
            <p className='experience-heading' style={{ fontFamily: DISPLAY_FONT }}>
              {HEADING}
            </p>
            <p className='experience-blurb'>{BLURB}</p>

            <div className='experience-year' style={{ fontFamily: DISPLAY_FONT }} aria-hidden='true'>
              <AnimatePresence mode='popLayout' initial={false}>
                <motion.span
                  key={startYear(role)}
                  initial={{ y: '60%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-60%', opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  {startYear(role)}
                </motion.span>
              </AnimatePresence>
            </div>
            <p className='experience-year-to'>
              to {endLabel(role)} · {role.company}
            </p>
          </div>

          <div className='experience-main'>
            {/* Every role is laid out invisibly in the same grid cell, so the
                card is as tall as the longest role and no taller. It used to
                stretch to fill the screen, which left the shorter roles
                sitting on a mostly empty card, and a card sized to the role
                on show would make the tabs jump on every change. */}
            <div className='experience-card-frame'>
              {ROLES.map(item => (
                <div key={item.index} className='experience-card experience-card-sizer' aria-hidden='true'>
                  <RoleBody role={item} position={1} />
                </div>
              ))}
              <AnimatePresence mode='wait' initial={false}>
                <motion.article
                  key={role.index}
                  className='experience-card'
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <RoleBody role={role} position={active + 1} />
                </motion.article>
              </AnimatePresence>
            </div>

            <ol className='experience-tabs'>
              {ROLES.map((item, index) => (
                <li key={item.index}>
                  <button
                    type='button'
                    data-active={index === active}
                    aria-current={index === active ? 'step' : undefined}
                    onClick={() => goTo(index)}
                  >
                    <span>{item.period}</span>
                    {item.short}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className='experience-axis' aria-hidden='true'>
            <div className='experience-axis-line'>
              <motion.i style={{ scaleX: fill }} />
              <motion.b style={{ left: marker }} />
            </div>
            <ol>
              {TICKS.map(year => (
                <li key={year} data-start={ROLES.some(r => startYear(r) === year) || undefined}>
                  {year === NOW_YEAR ? 'Now' : year}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

/** One role: title, employer, the headline claim, what the job involved, skills. */
function RoleBody({ role, position }: { role: Role; position?: number }) {
  return (
    <>
      {/* The pinned card drops the period: its tabs, axis and big year
          already say when, and a "Role 1 of 4" kicker was a numbered label. */}
      {(!position || role.arrangement) && (
        <p className='experience-card-kicker'>
          {!position && role.period}
          {role.arrangement && <span>{role.arrangement}</span>}
        </p>
      )}
      <h3 className='experience-card-title' style={{ fontFamily: DISPLAY_FONT }}>
        {role.role}
      </h3>
      <p className='experience-card-employer'>
        {role.company} · {role.employer}
      </p>
      <p className='experience-card-achievement'>{role.achievement}</p>
      <ul className='experience-card-highlights'>
        {role.highlights.map(line => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <ul className='experience-card-stack'>
        {role.stack.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  )
}

/** The same roles as a list, newest first, for phones, short screens and reduced motion. */
function RoleList() {
  return (
    <div className='experience-list mx-auto max-w-[1240px]'>
      <div className='experience-list-intro'>
        <h2 className='experience-heading' style={{ fontFamily: DISPLAY_FONT }}>
          {HEADING}
        </h2>
        <p className='experience-blurb'>{BLURB}</p>
      </div>

      <ol>
        {EXPERIENCE.map(role => (
          <li key={role.index} className='experience-card'>
            <RoleBody role={role} />
          </li>
        ))}
      </ol>
    </div>
  )
}
