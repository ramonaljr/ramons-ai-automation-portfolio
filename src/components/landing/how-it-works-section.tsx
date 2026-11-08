'use client'

import { useRef, useState, type CSSProperties } from 'react'

import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'

import { CONTAINER, SECTION } from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'
import { PROCESS_FIGURES } from '@/components/landing/process-figures'
import { pad, SheetHeader } from '@/components/landing/sheet'
import { ENGAGEMENTS, PROCESS } from '@/lib/portfolio'

/**
 * How it works, as a pinned drawing sheet (benchmarked on Studio Okafor's
 * featured project, 2026-11-08).
 *
 * The sheet holds still while the page scrolls past it, and each half-screen
 * of scroll turns to the next of the six steps: its number, title, summary
 * and a spec of what the step takes from the client and hands back, beside
 * the deliverable that step hands over, drawn as a document in a captioned
 * frame (process-figures.tsx). A rail along the top groups the
 * steps by engagement and jumps to any of them.
 *
 * It replaced a tab explorer that played through the steps on a timer. Scroll
 * drives this one, so it never changes under a reader who has stopped.
 *
 * The drafting details follow the benchmark's featured sheet: a dimension
 * line over the frame giving the step's timing, an accent rule along the
 * frame's top edge tagged with the document it holds, a scale ruler down the
 * page's right margin whose marker travels with the scroll, and a ticked
 * "02 / 06" counter under the step.
 *
 * Phones, short screens and reduced motion get the same steps as a ruled
 * list; CSS shows one or the other, never both.
 */

const STEPS = PROCESS.length

/** The steps grouped by engagement, with that engagement's duration. Phases
 *  are in ENGAGEMENTS order: audit, build, retainer. */
const PHASES = (['Audit', 'Build', 'Retainer'] as const).map((name, index) => ({
  name,
  duration: ENGAGEMENTS[index]?.duration,
  steps: PROCESS.flatMap((step, stepIndex) => (step.phase === name ? [stepIndex] : []))
}))

/** The document each step hands over, as the figures title it. */
const DELIVERABLES = ['Problem statement', 'Opportunity list', 'System map', 'Build log', 'Test report', 'Run monitor']

/** Where each step begins along the counter's track, plus its far end. */
const TICKS = Array.from({ length: STEPS + 1 }, (_, index) => index / STEPS)

const durationOf = (phase: string) => PHASES.find(item => item.name === phase)?.duration

/** What a step takes and gives, as the rows of a drawing's title block. */
function StepSpec({ step }: { step: (typeof PROCESS)[number] }) {
  return (
    <dl className='proc-spec'>
      <div>
        <dt>Phase</dt>
        <dd>
          {step.phase} · {durationOf(step.phase)}
        </dd>
      </div>
      <div>
        <dt>When</dt>
        <dd>{step.timing}</dd>
      </div>
      <div>
        <dt>From you</dt>
        <dd>{step.fromYou}</dd>
      </div>
      <div>
        <dt>You get</dt>
        <dd>{step.youGet}</dd>
      </div>
    </dl>
  )
}

export function HowItWorksSection({ sheet = false }: { sheet?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null)

  // 0 as the sheet pins, 1 as it lets go; each step holds a sixth of the run.
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)

  // The ruler's marker rides the whole run, top to bottom.
  const markTop = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  useMotionValueEvent(scrollYProgress, 'change', progress => {
    setActive(Math.min(STEPS - 1, Math.max(0, Math.floor(progress * STEPS))))
  })

  /** Scroll to the middle of a step's stretch, so it is not on a boundary. */
  const goTo = (index: number) => {
    const track = trackRef.current

    if (!track) return

    const top = track.getBoundingClientRect().top + window.scrollY
    const run = track.offsetHeight - window.innerHeight

    window.scrollTo({ top: top + (run * (index + 0.5)) / STEPS, behavior: 'smooth' })
  }

  const step = PROCESS[active]

  return (
    <section id='process' className={SECTION}>
      <div className={CONTAINER}>
        {sheet && <SheetHeader number={3} title='Process · Audit, build, retainer' />}

        <SectionIntro
          title='A clear path from problem to reliable system.'
          blurb='You will always know what is happening, what comes next and what I need from you.'
          margin='mb-12 lg:mb-4'
          titleClassName='mt-6 max-w-[18ch] text-[clamp(2.5rem,5vw,5.2rem)]'
        />

        <div ref={trackRef} className='proc-sheet' style={{ '--steps': STEPS } as CSSProperties}>
          <div className='proc-stage'>
            <nav className='proc-rail' aria-label='Process steps'>
              {PHASES.map(phase => (
                <div key={phase.name} className='proc-rail-phase'>
                  <p className='proc-rail-label'>
                    <b>{phase.name}</b> · {phase.duration}
                  </p>
                  <div className='proc-rail-steps'>
                    {phase.steps.map(index => (
                      <button
                        key={PROCESS[index].step}
                        type='button'
                        className='proc-rail-step'
                        data-state={index === active ? 'on' : index < active ? 'past' : undefined}
                        aria-current={index === active ? 'step' : undefined}
                        onClick={() => goTo(index)}
                      >
                        {PROCESS[index].step} {PROCESS[index].label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* A scale down the right margin; its marker travels with the
                scroll and names the step in hand. */}
            <div className='proc-ruler' aria-hidden='true'>
              <motion.span className='proc-ruler-mark' style={{ y: markTop }}>
                <span>{step.step}</span>
              </motion.span>
            </div>

            <div className='proc-body'>
              <div className='proc-steps'>
                {PROCESS.map((item, index) => (
                  <article key={item.step} className='proc-step' data-on={index === active || undefined}>
                    {/* As on the benchmark sheet: the name and its facts at the
                        top, level with the frame; the account and the counter
                        at the foot. */}
                    <h3 className='proc-title'>{item.label}</h3>
                    <p className='proc-summary'>{item.summary}</p>
                    <StepSpec step={item} />
                    <p className='proc-desc'>{item.desc}</p>
                    <p className='proc-count'>
                      <span>
                        <b>{item.step}</b> / {pad(STEPS)}
                      </span>
                      <span className='proc-bar' aria-hidden='true'>
                        <motion.i style={{ scaleX: scrollYProgress }} />
                        {TICKS.map(at => (
                          <em key={at} style={{ '--at': at } as CSSProperties} />
                        ))}
                      </span>
                    </p>
                  </article>
                ))}
              </div>

              <figure className='proc-figure' aria-hidden='true'>
                {/* A dimension line, as over a drawing: what this step spans. */}
                <p className='proc-dim'>
                  <span>{step.timing}</span>
                </p>
                <div className='proc-frame'>
                  {/* The accent rule along the frame's top edge, tagged with
                      the document the step hands over. */}
                  <p className='proc-level'>
                    <span key={active}>{DELIVERABLES[active]}</span>
                  </p>
                  {PROCESS_FIGURES.map((visual, index) => (
                    <div key={index} className='proc-visual' data-on={index === active || undefined}>
                      {visual}
                    </div>
                  ))}
                </div>
                <figcaption className='proc-caption'>
                  <span>
                    Fig. {step.step} · <b>{step.label}</b>
                  </span>
                  <span>
                    {step.phase} · {step.timing}
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        <ol className='proc-list'>
          {PROCESS.map((item, index) => (
            <li key={item.step}>
              <span className='sheet-mono'>{item.step}</span>
              <div>
                <h3 className='proc-title'>{item.label}</h3>
                <p className='proc-summary'>{item.summary}</p>
                <p className='proc-desc'>{item.desc}</p>
              </div>
              <StepSpec step={item} />
              <div className='proc-list-fig'>{PROCESS_FIGURES[index]}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
