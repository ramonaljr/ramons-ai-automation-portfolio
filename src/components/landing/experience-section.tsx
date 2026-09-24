'use client'

import { useRef, useState } from 'react'

import { motion, useMotionValueEvent, useScroll } from 'motion/react'

import { TENURES } from '@/lib/portfolio'
import { useInView, usePrefersReducedMotion } from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'

const DISPLAY_FONT = 'var(--font-editorial), Georgia, serif'

/**
 * How many roles precede each tenure, so the reveal cascade is staggered across
 * the flat list rather than restarting inside every group — the markup is
 * nested but it should read as one sequence. Derived at module scope: `TENURES`
 * is static, and a counter mutated during render is not.
 */
const TENURE_OFFSETS = TENURES.reduce<number[]>(
  (offsets, tenure) => [...offsets, offsets[offsets.length - 1] + tenure.roles.length],
  [0]
)

const ROLE_COUNT = TENURE_OFFSETS[TENURE_OFFSETS.length - 1]

/** Every role in reading order, for the counter in the left panel. */
const ROLES = TENURES.flatMap(tenure => tenure.roles)

/** A role is "in focus" once its top passes this line of the viewport. */
const FOCUS_LINE = 0.5

/** …and starts its entrance once its top passes this one. */
const REVEAL_LINE = 0.9

const pad = (value: number) => String(value).padStart(2, '0')

/**
 * How the work is run, stated once. Every line repeats a commitment made
 * elsewhere on the page (process, services, contact), so nothing here is a
 * new claim; it is the same promise gathered where a reader weighing the
 * person behind it will look.
 */
const HOW_I_WORK = [
  { label: 'Business case first', copy: 'Start with the work and the hours it costs, not the software.' },
  { label: 'Failure paths mapped', copy: 'Error branches and failure alerts are part of every build.' },
  { label: 'Human control retained', copy: 'A person reviews anything where a mistake would be expensive.' },
  { label: 'Documented handover', copy: 'Your team can run and extend it without me.' }
] as const

/**
 * The career behind the practice. This used to be its own Experience section
 * several screens after About; it now closes About, so the person and the
 * decade that shaped the work are read together. It keeps the `experience`
 * id so existing links still land on it.
 */
export function ExperienceJourney() {
  const { ref, inView } = useInView<HTMLDivElement>(0.06)

  /**
   * Which roles are expanded on phones. Below 768px each role shows its title,
   * dates and headline achievement, with the description and skills behind a
   * toggle: four full roles ran to five screens there. The toggle and the
   * collapse are CSS-only above that width, so desktop is unchanged, and the
   * text stays in the page for search either way.
   */
  const [open, setOpen] = useState<Record<string, boolean>>({})

  /**
   * The scroll story on wide screens. The left panel holds still (sticky in
   * CSS) while the roles scroll past it: a rail beside them fills with the
   * reader's progress, the role under the middle of the screen is in focus
   * while the rest dim, each role rises in as it arrives, and a counter in the
   * panel names the role being read. One scroll listener, via Motion, and
   * state only changes when a role actually crosses a line.
   */
  const reduced = usePrefersReducedMotion()
  const tenuresRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [revealed, setRevealed] = useState(-1)
  const { scrollY } = useScroll()

  const { scrollYProgress: railProgress } = useScroll({
    target: tenuresRef,
    offset: [`start ${FOCUS_LINE * 100}%`, `end ${FOCUS_LINE * 100}%`]
  })

  useMotionValueEvent(scrollY, 'change', () => {
    const roles = tenuresRef.current?.querySelectorAll<HTMLElement>('.experience-role')

    if (!roles) return

    let focus = 0
    let shown = -1

    roles.forEach((role, index) => {
      const top = role.getBoundingClientRect().top

      if (top <= window.innerHeight * FOCUS_LINE) focus = index
      if (top <= window.innerHeight * REVEAL_LINE) shown = index
    })

    if (focus !== active) setActive(focus)
    if (shown > revealed) setRevealed(shown)
  })

  return (
    <div id='experience' className='about-journey'>
      {/* Same measure as the About panel above, so the two edges line up. */}
      <div className='mx-auto max-w-[1240px]'>
        <div className='experience-layout'>
          <div className='experience-intro'>
            <SectionIntro
              tag='THE PATH HERE'
              title='Four roles. One habit: map the work first.'
              blurb='Each role handed me a process to run by hand: invoices and vendor controls, project cost ledgers, month-end close, then forecasting. That is why the workflows I build match how a business actually runs, rather than how a process diagram says it should.'
              margin=''
              titleClassName='mt-5 text-[clamp(1.9rem,3.2vw,3.4rem)]'
            />

            {/* Follows the roles on the right. Decorative: the roles
                themselves are the readable record. */}
            <p className='experience-counter' aria-hidden='true'>
              <span className='experience-counter-index'>
                {pad(active + 1)} <i>/ {pad(ROLE_COUNT)}</i>
              </span>
              <span className='experience-counter-role'>{ROLES[active]?.role}</span>
            </p>

            <div className='about-how'>
              <p className='about-how-label'>HOW I WORK</p>
              <ul>
                {HOW_I_WORK.map(item => (
                  <li key={item.label}>
                    <strong>{item.label}</strong>
                    <span>{item.copy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div ref={ref} className='experience-history relative'>
            <p className='experience-history-label'>
              ROLE HISTORY <span>01 — {String(ROLE_COUNT).padStart(2, '0')}</span>
            </p>

            <div ref={tenuresRef} className='experience-tenures' data-tracking={!reduced || undefined}>
              <span className='experience-rail' aria-hidden='true'>
                <motion.i style={reduced ? { scaleY: 1 } : { scaleY: railProgress }} />
              </span>

              {TENURES.map((tenure, tenureIndex) => (
                <section key={tenure.company} className='experience-tenure' aria-label={tenure.company}>
                  <header className='experience-tenure-head'>
                    <span
                      aria-hidden='true'
                      className='experience-tenure-rule'
                      style={{
                        transform: inView ? 'scaleX(1)' : 'scaleX(0)',
                        transition: 'transform 1s cubic-bezier(0.16,1,0.3,1) 120ms'
                      }}
                    />
                    <h3 className='experience-tenure-company'>{tenure.company}</h3>
                    <span className='experience-tenure-span'>{tenure.span}</span>
                  </header>

                  <ol className='experience-roles'>
                    {tenure.roles.map((role, roleIndex) => {
                      const flat = TENURE_OFFSETS[tenureIndex] + roleIndex

                      return (
                        <li
                          key={role.index}
                          className='experience-role'
                          data-revealed={reduced || flat <= revealed}
                          data-active={flat === active}
                        >
                          <div className='experience-role-meta'>
                            <span className='experience-role-index'>{role.index}</span>
                            <span className='experience-role-period'>{role.period}</span>
                            {role.arrangement && (
                              <span className='experience-role-arrangement'>{role.arrangement}</span>
                            )}
                          </div>

                          <div className='experience-role-body'>
                            <h4 className='experience-role-title' style={{ fontFamily: DISPLAY_FONT }}>
                              {role.role}
                            </h4>

                            <p className='experience-role-achievement'>{role.achievement}</p>

                            <div
                              id={`role-more-${role.index}`}
                              className='experience-role-more'
                              data-open={Boolean(open[role.index])}
                            >
                              <p className='experience-role-description'>{role.description}</p>

                              <ul className='experience-role-stack'>
                                {role.stack.map(item => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </div>

                            <button
                              type='button'
                              className='experience-role-toggle'
                              aria-expanded={Boolean(open[role.index])}
                              aria-controls={`role-more-${role.index}`}
                              onClick={() => setOpen(current => ({ ...current, [role.index]: !current[role.index] }))}
                            >
                              {open[role.index] ? 'Less' : 'More about this role'}
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                </section>
              ))}

              {/* The chronology is only half the argument. This turns four
                  finance roles into the reason the rest of the page exists,
                  and hands the reader back to the work. */}
              <p
                className='experience-thesis'
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'none' : 'translateY(14px)',
                  transition: 'opacity .9s cubic-bezier(0.16,1,0.3,1) 200ms, transform .9s cubic-bezier(0.16,1,0.3,1) 200ms'
                }}
              >
                Every system on this page began as something on that list. <a href='#portfolio'>See what they became</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
