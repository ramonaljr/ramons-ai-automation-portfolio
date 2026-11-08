'use client'

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react'

import { rise, useInView } from '@/components/landing/motion'
import { SheetPlus } from '@/components/landing/sheet'
import { EXPERIENCE } from '@/lib/portfolio'

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

/** Where a row opens on hover: a mouse, and room for the full row. */
const HOVER = '(hover: hover) and (pointer: fine) and (min-width: 768px)'

/** How long the pointer rests on a row before it opens, and how long the
 *  index ignores the pointer while a row is opening and another closing. */
const INTENT = 140
const SETTLE = 650

/** "2015 - 2018" reads as "2015 to 2018": the page keeps dashes out of its copy. */
const years = (period: string) => period.replace(' - ', ' to ')

/**
 * The career, closing About, as an index in the drafting-sheet language the
 * three middle sections share (benchmarked on Studio Okafor, 2026-11-08):
 * four ruled rows, newest first, each with its number, role, employer and
 * years. Opening a row shows the headline result, what the job involved and
 * its particulars in mono.
 *
 * With a mouse, a row opens as the pointer rests on it and the one before
 * closes; the last one opened stays open when the pointer leaves, so the
 * page does not jump under a reader scrolling on. Touch and keyboard open
 * and close rows by tapping or pressing Enter.
 *
 * It replaced a pinned timeline that took four screens of scroll and showed
 * one role at a time; the index shows the whole career at a glance and opens
 * any role in place. It keeps the `experience` id so existing links still
 * land on it.
 */
export function ExperienceJourney() {
  const { ref: headRef, inView: headInView } = useInView<HTMLDivElement>(0.2)
  const { ref, inView } = useInView<HTMLDivElement>(0.15)

  // The newest role starts open, so the index never reads as a bare list.
  const [open, setOpen] = useState<number | null>(0)
  const [active, setActive] = useState<number | null>(null)

  // Hover opening is driven by pointer *movement*, not pointerenter: as one
  // row grows and another shrinks, rows slide under a still pointer, and
  // enter events would then open them in a chain. A row also gets a moment
  // to finish opening before the pointer can open another.
  const openRef = useRef<number | null>(0)
  const pointerRow = useRef<number | null>(null)
  const quietUntil = useRef(0)
  const timer = useRef(0)
  const hovering = useRef(false)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const show = (index: number | null) => {
    openRef.current = index
    setOpen(index)
  }

  const track = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || !window.matchMedia(HOVER).matches) return

    hovering.current = true

    const row = (event.target as Element).closest<HTMLElement>('[data-row]')
    const index = row ? Number(row.dataset.row) : null

    setActive(index)

    if (index === pointerRow.current) return

    pointerRow.current = index
    window.clearTimeout(timer.current)

    if (index === null) return

    timer.current = window.setTimeout(
      () => {
        const target = pointerRow.current

        if (target === null || target === openRef.current) return

        quietUntil.current = performance.now() + SETTLE
        show(target)
      },
      Math.max(INTENT, quietUntil.current - event.timeStamp)
    )
  }

  const leave = () => {
    pointerRow.current = null
    window.clearTimeout(timer.current)
    setActive(null)
  }

  // A mouse click opens the row under it but never closes it: with hover
  // opening, a click to close would reopen the moment the pointer moved.
  // Taps and Enter toggle.
  const press = (index: number) => (event: MouseEvent<HTMLButtonElement>) => {
    if (hovering.current && event.detail > 0) show(index)
    else show(openRef.current === index ? null : index)
  }

  return (
    <div id='experience' className='about-journey'>
      <div className='mx-auto max-w-[1240px]'>
        <div className='career-index'>
          <div ref={headRef} className='career-head' style={rise(headInView)}>
            <h2>{HEADING}</h2>
            <p>{BLURB}</p>
          </div>

          <div
            ref={ref}
            className='sheet-index'
            data-in={inView || undefined}
            data-has-active={active !== null || undefined}
            onPointerMove={track}
            onPointerLeave={leave}
          >
            <div className='sheet-cols' aria-hidden='true'>
              <span>No.</span>
              <span>Role</span>
              <span className='sheet-wide'>Employer</span>
              <span className='sheet-wide'>Years</span>
              <span />
            </div>

            <ol className='sheet-rows'>
              {EXPERIENCE.map((role, index) => {
                const isOpen = open === index

                return (
                  <li
                    key={role.index}
                    className='sheet-row'
                    data-active={active === index || undefined}
                    data-open={isOpen || undefined}
                    data-row={index}
                    style={{ '--i': index + 1 } as CSSProperties}
                  >
                    <h3>
                      <button
                        type='button'
                        id={`role-row-${role.index}`}
                        className='sheet-row-head'
                        aria-expanded={isOpen}
                        aria-controls={`role-body-${role.index}`}
                        onClick={press(index)}
                      >
                        <span className='sheet-mono sheet-no'>{role.index}</span>
                        <span>
                          <span className='sheet-name'>{role.role}</span>
                          <span className='sheet-mono sheet-meta'>
                            {role.company} · {years(role.period)}
                          </span>
                        </span>
                        <span className='sheet-mono sheet-wide'>{role.company}</span>
                        <span className='sheet-mono sheet-wide'>{years(role.period)}</span>
                        <SheetPlus />
                      </button>
                    </h3>

                    <div
                      id={`role-body-${role.index}`}
                      role='region'
                      aria-labelledby={`role-row-${role.index}`}
                      className='sheet-row-body'
                    >
                      <div>
                        <div className='sheet-row-grid'>
                          <div>
                            <p className='career-achievement'>{role.achievement}</p>
                            <ul className='career-highlights'>
                              {role.highlights.map(line => (
                                <li key={line}>{line}</li>
                              ))}
                            </ul>
                          </div>

                          <dl className='sheet-spec'>
                            <dt>Employer</dt>
                            <dd>{role.employer}</dd>
                            <dt>Tools</dt>
                            <dd>{role.stack.join(' · ')}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>

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
