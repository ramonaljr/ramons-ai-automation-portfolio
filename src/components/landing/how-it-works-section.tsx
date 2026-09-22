'use client'

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

import { CONTAINER, DISPLAY_FONT, SECTION, usePrefersReducedMotion } from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'
import { PROCESS } from '@/lib/portfolio'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText)
}

/**
 * Inline stand-in for `@gsap/react`'s `useGSAP`, so the horizontal timeline
 * does not pull a second package in for one hook. Mirrors its default
 * `revertOnUpdate: false`: one `gsap.context` lives for the component's
 * lifetime, the callback is re-added when dependencies change, and the context
 * reverts only on unmount. A callback may return its own cleanup, which runs
 * before the next re-add and on unmount.
 */
function useGSAP(
  callback: () => void | (() => void),
  options?: { dependencies?: unknown[]; scope?: { current: Element | null } }
) {
  const deps = options?.dependencies ?? []
  const scope = options?.scope
  const ctxRef = useRef<gsap.Context | null>(null)
  const cleanupRef = useRef<(() => void) | undefined>(undefined)

  useLayoutEffect(() => {
    ctxRef.current = gsap.context(() => {}, scope?.current ?? undefined)

    return () => {
      cleanupRef.current?.()
      cleanupRef.current = undefined
      ctxRef.current?.revert()
      ctxRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    if (!ctxRef.current) return

    cleanupRef.current?.()

    const ret = ctxRef.current.add(callback)

    cleanupRef.current = typeof ret === 'function' ? ret : undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

function DiscoveryVisual() {
  return (
    <div className='process-conversation' aria-hidden='true'>
      <span className='process-message process-message-muted'>Approvals take three follow-ups.</span>
      <span className='process-message process-message-strong'>Show me what happens after a request comes in.</span>
      <span className='process-typing'><i /><i /><i /></span>
    </div>
  )
}

function AuditVisual() {
  return (
    <div className='process-audit' aria-hidden='true'>
      <div className='process-audit-head'><span>Current workflow</span><b>3 opportunities found</b></div>
      {[
        ['01', 'Manual data entry', '4.2 hrs/wk'],
        ['02', 'Approval waiting', '1.8 days'],
        ['03', 'Repeat follow-up', '26 / mo']
      ].map(([number, label, metric], index) => (
        <div key={number} className='process-audit-row' style={{ '--audit-index': index } as CSSProperties}>
          <span>{number}</span><strong>{label}</strong><i>{metric}</i>
        </div>
      ))}
    </div>
  )
}

function DesignVisual() {
  return (
    <div className='process-map' aria-hidden='true'>
      <svg viewBox='0 0 520 220' preserveAspectRatio='none'>
        <path d='M126 48 C180 48 170 106 225 106' />
        <path d='M300 106 C355 106 350 42 408 42' />
        <path d='M300 106 C355 106 350 172 408 172' />
      </svg>
      <span className='process-map-node process-map-input'>Request form</span>
      <span className='process-map-node process-map-core'>Workflow</span>
      <span className='process-map-node process-map-top'>Team alert</span>
      <span className='process-map-node process-map-bottom'>Approved record</span>
      <span className='process-map-status'>logic mapped <b>✓</b></span>
    </div>
  )
}

function BuildVisual() {
  return (
    <div className='process-terminal' aria-hidden='true'>
      <div className='process-terminal-top'><i /><i /><i /><span>workflow.build</span></div>
      <div className='process-terminal-body'>
        <p><b>$</b> assembling your system…</p>
        <p><span>✓</span> apps connected</p>
        <p><span>✓</span> rules configured</p>
        <p><span>✓</span> edge cases tested</p>
        <div className='process-terminal-progress'><i /></div>
      </div>
    </div>
  )
}

function TestVisual() {
  return (
    <div className='process-tests' aria-hidden='true'>
      <div className='process-tests-head'><span>VALIDATION RUN</span><b>12 / 12 passed</b></div>
      <div className='process-tests-grid'>
        {['Standard case', 'Missing field', 'Duplicate entry', 'API timeout'].map((label, index) => (
          <span key={label} style={{ '--test-index': index } as CSSProperties}><i>✓</i>{label}</span>
        ))}
      </div>
      <div className='process-handover'><span>Documentation</span><span>Team walkthrough</span><b>READY</b></div>
    </div>
  )
}

function LaunchVisual() {
  return (
    <div className='process-monitor' aria-hidden='true'>
      <div className='process-monitor-status'><i /> LIVE <span>· 14 days monitored</span></div>
      <div className='process-monitor-metric'><strong>99.9%</strong><span>successful runs</span></div>
      <svg viewBox='0 0 520 150' preserveAspectRatio='none'>
        <path className='process-monitor-area' d='M8 128 C65 124 82 114 124 116 S190 91 236 98 S302 71 346 76 S416 44 512 26 L512 150 L8 150 Z' />
        <path className='process-monitor-line' d='M8 128 C65 124 82 114 124 116 S190 91 236 98 S302 71 346 76 S416 44 512 26' />
      </svg>
    </div>
  )
}

const VISUALS: ReactNode[] = [
  <DiscoveryVisual key='discovery' />,
  <AuditVisual key='audit' />,
  <DesignVisual key='design' />,
  <BuildVisual key='build' />,
  <TestVisual key='test' />,
  <LaunchVisual key='launch' />
]

/**
 * Steps alternate above and below the rule, which is what gives the timeline
 * its rhythm. Derived from PROCESS rather than kept as two lists, so adding a
 * stage cannot leave one row stale.
 */
const TOP_STEPS = PROCESS.filter((_, index) => index % 2 === 0)
const BOTTOM_STEPS = PROCESS.filter((_, index) => index % 2 === 1)

/**
 * Where each step's reveal begins and ends, as a percentage of the section's
 * scroll. Computed from the step count: the reference this came from hardcoded
 * seven pairs, so a seventh stage would have read `positions[6]` as
 * `undefined` and thrown on destructure.
 */
function stepPositions(count: number, mobile: boolean) {
  const step = mobile ? 8 : 10
  const first = mobile ? 22 : 6
  const span = mobile ? 10 : 20

  return Array.from({ length: count }, (_, index) => {
    const start = first + index * step

    return [start, start + span] as const
  })
}

const stepClass = (step: string) => step.replace(/[^a-z0-9]/gi, '')

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const reduced = usePrefersReducedMotion()

  // The horizontal slide, the rule that draws itself, and the active visual.
  useGSAP(
    () => {
      const section = sectionRef.current

      if (!section) return

      const slider = sliderRef.current
      const viewport = viewportRef.current

      if (!slider || !viewport) return

      /**
       * Phones do not get the rail.
       *
       * Six steps across a 390px frame needs about 3,000px of sideways travel,
       * which bought a taller section than the vertical sequence this replaced
       * — 6,043px against roughly 3,700px. Below this width the CSS unpins the
       * track into an ordinary two-row grid, so there is nothing to drive.
       */
      const mobile = window.innerWidth < 600

      if (mobile) {
        gsap.set('.process-tl-line', { width: '100%' })

        return
      }

      /**
       * Measured, not a magic percentage.
       *
       * The reference translated a fixed -65% of a fixed-width row, which only
       * holds while that row's width and its contents are both hardcoded. This
       * row is built from PROCESS and sized by `max-content`, so the distance
       * is exactly how much of it overflows the frame — right for six steps and
       * still right for seven.
       */
      const distance = Math.max(0, slider.scrollWidth - viewport.clientWidth)
      const lineWidth = mobile ? '92%' : '98%'

      /**
       * The track is sized from the travel, not from the viewport's width.
       *
       * The reference used `200vw`, which at 1920px is 3840px of scrolling to
       * move a rail 972px — four screens to travel less than one — and which
       * gets *longer* on a wider monitor, the opposite of what a height problem
       * needs. One screen to hold the frame plus the travel itself makes a
       * pixel of scroll worth roughly a pixel of movement.
       */
      if (pinRef.current) {
        pinRef.current.style.setProperty(
          '--process-track',
          `${Math.round(viewport.clientHeight + distance * (mobile ? 1.6 : 1.1))}px`
        )
        ScrollTrigger.refresh()
      }

      gsap
        .timeline({
          scrollTrigger: {
            // The pin, not the section: the section also holds the intro, and
            // measuring across it made the stage pane run ahead of the rail.
            trigger: pinRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,

            /**
             * Which step the stage pane shows, and which one the rail marks.
             *
             * Taken from scroll progress rather than from where the columns
             * happen to sit. Position was tried first and cannot work here: at
             * full travel the last column's centre only reaches 78% of the
             * frame, so a reading line early enough to catch the first step can
             * never catch the last two — and every step owns a visual, so all
             * six have to be reachable. The rail marks the same index, so the
             * pane and the rail agree by emphasis instead of by coincidence.
             */
            onUpdate: self => {
              const next = Math.min(PROCESS.length - 1, Math.floor(self.progress * PROCESS.length))

              if (next !== activeRef.current) {
                activeRef.current = next
                setActiveIndex(next)
              }
            }
          },
          defaults: { ease: 'none' }
        })
        .fromTo(slider, { x: 0 }, { x: -distance })

      if (reduced) {
        gsap.set('.process-tl-line', { width: lineWidth })

        return
      }

      gsap.to('.process-tl-line', {
        width: lineWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: pinRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true
        }
      })
    },
    { dependencies: [reduced], scope: sectionRef }
  )

  // Per-step reveals: the stalk grows, the dot pops, the words rise.
  useGSAP(
    () => {
      const section = sectionRef.current

      if (!section) return

      if (reduced || window.innerWidth < 600) {
        PROCESS.forEach(step => {
          const id = stepClass(step.step)

          gsap.set(`.process-tl-stalk-${id}`, { scaleY: 1 })
          gsap.set(`.process-tl-dot-${id}`, { scale: 1 })
          gsap.set(`.process-tl-title-${id}`, { opacity: 1, clearProps: 'transform' })
          gsap.set(`.process-tl-copy-${id}`, { opacity: 1, clearProps: 'transform' })
        })

        return
      }

      const splits: InstanceType<typeof SplitText>[] = []
      const positions = stepPositions(PROCESS.length, window.innerWidth < 600)

      PROCESS.forEach((step, index) => {
        const id = stepClass(step.step)
        const onTop = index % 2 === 0

        gsap.set(`.process-tl-stalk-${id}`, {
          scaleY: 0,
          transformOrigin: onTop ? 'bottom bottom' : 'top top'
        })
        gsap.set(`.process-tl-dot-${id}`, { scale: 0 })

        const title = new SplitText(`.process-tl-title-${id}`, { type: 'chars, words, lines', mask: 'lines' })
        const copy = new SplitText(`.process-tl-copy-${id}`, { type: 'chars, words, lines', mask: 'lines' })

        splits.push(title, copy)

        const [start, end] = positions[index]

        gsap
          .timeline({
            scrollTrigger: {
              trigger: pinRef.current,
              start: `${start}% bottom`,
              end: `${end}% bottom`,
              scrub: true
            }
          })
          .to(`.process-tl-stalk-${id}`, { scaleY: 1, duration: 0.48 })
          .to(`.process-tl-dot-${id}`, { scale: 1, duration: 0.48 }, '<')
          .fromTo(title.lines, { y: 100 }, { y: 0, delay: -0.96, duration: 1.2, stagger: 0.02, ease: 'power2.out' })
          .fromTo(copy.lines, { y: 100 }, { y: 0, duration: 1.2, stagger: 0.02, ease: 'power2.out' }, '<')
      })

      const onResize = () => ScrollTrigger.refresh()

      window.addEventListener('resize', onResize)

      return () => {
        splits.forEach(split => split.revert?.())
        window.removeEventListener('resize', onResize)
      }
    },
    { dependencies: [reduced], scope: sectionRef }
  )

  const marker = (step: (typeof PROCESS)[number], index: number) => {
    const id = stepClass(step.step)
    const onTop = index % 2 === 0
    const dot = <span className={`process-tl-dot process-tl-dot-${id}`} aria-hidden='true' />
    const stalk = <span className={`process-tl-stalk process-tl-stalk-${id}`} aria-hidden='true' />

    return (
      <span className='process-tl-marker' aria-hidden='true'>
        {onTop ? dot : stalk}
        {onTop ? stalk : dot}
      </span>
    )
  }

  const copyFor = (step: (typeof PROCESS)[number]) => {
    const id = stepClass(step.step)

    return (
      <div className='process-tl-copy-block'>
        <h3 className={`process-tl-title process-tl-title-${id}`} style={{ fontFamily: DISPLAY_FONT }}>
          {step.step} {step.label}
        </h3>
        <p className={`process-tl-text process-tl-copy-${id}`}>{step.summary}</p>
      </div>
    )
  }

  return (
    <section ref={sectionRef} id='process' className={`${SECTION} process-timeline-section`}>
      <div className={`${CONTAINER} process-timeline-head`}>
        <SectionIntro
          tag='HOW IT WORKS'
          title='A clear path from problem to reliable system.'
          blurb='You will always know what is happening, what comes next and what I need from you.'
          margin='mb-14 lg:mb-20'
          titleClassName='mt-6 max-w-[18ch] text-[clamp(2.5rem,5vw,5.2rem)]'
        />

        {/* The animated track is `aria-hidden`; this is the readable copy of
            the same six stages, and the only version a screen reader meets. */}
        <ol className='sr-only'>
          {PROCESS.map(step => (
            <li key={step.step}>
              {step.label}: {step.summary} {step.desc}
            </li>
          ))}
        </ol>
      </div>

      {/* The tall track buys the scroll; the sticky layer holds the viewport
          still while the slider translates across it. */}
      <div ref={pinRef} className='process-timeline-pin'>
        <div className='process-timeline-stick'>
          {/* Held outside the slider on purpose. The reference put its image in
              the translating row, which is fine for a photograph you only need
              once — but this pane shows the step currently being read, so it
              has to stay on screen for the swap to mean anything. */}
          <div className='process-timeline-stage' aria-hidden='true'>
            <span className='process-timeline-stage-number'>{PROCESS[activeIndex]?.step}</span>
            <div className='process-timeline-stage-card'>{VISUALS[activeIndex]}</div>
            <span className='process-timeline-stage-caption'>FROM IDEA TO WORKING SYSTEM</span>
          </div>

          <div ref={viewportRef} className='process-timeline-viewport'>
            <div ref={sliderRef} className='process-timeline-slider'>
              <div className='process-timeline-track'>
                <div className='process-tl-rule' aria-hidden='true'>
                  <span className='process-tl-cap' />
                  <span className='process-tl-line' />
                  <span className='process-tl-cap' />
                </div>

                <div className='process-tl-row process-tl-row-top'>
                  <div className='process-tl-rowhead'>
                    <span>THE DELIVERY PATH</span>
                  </div>
                  <div className='process-tl-items'>
                    {TOP_STEPS.map(step => {
                      const index = PROCESS.indexOf(step)

                      return (
                        <div
                        key={step.step}
                        className='process-tl-item'
                        data-step-index={index}
                        data-active={index === activeIndex ? 'true' : 'false'}
                      >
                          {marker(step, index)}
                          {copyFor(step)}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className='process-tl-row process-tl-row-bottom'>
                  <div className='process-tl-rowhead'>
                    <span>
                      {String(activeIndex + 1).padStart(2, '0')} / {String(PROCESS.length).padStart(2, '0')}
                    </span>
                  </div>
                  <div className='process-tl-items'>
                    {BOTTOM_STEPS.map(step => {
                      const index = PROCESS.indexOf(step)

                      return (
                        <div
                        key={step.step}
                        className='process-tl-item process-tl-item-bottom'
                        data-step-index={index}
                        data-active={index === activeIndex ? 'true' : 'false'}
                      >
                          {marker(step, index)}
                          {copyFor(step)}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
