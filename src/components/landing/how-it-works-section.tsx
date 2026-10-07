'use client'

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

import { MotionConfig, motion, type Variants } from 'motion/react'

import { CONTAINER, DISPLAY_FONT, SECTION, usePrefersReducedMotion } from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'
import { ENGAGEMENTS, PROCESS } from '@/lib/portfolio'

/**
 * How it works, as a step explorer that fits in one screen.
 *
 * It replaced a list of six tall steps beside a sticky stage, which ran to
 * about 2,400px on desktop and twice that on phones. Now the step titles sit
 * in one column, grouped by the Working Together engagement they belong to,
 * and the chosen step's illustration and detail sit beside them.
 *
 * Hovering, clicking, tapping or arrowing to a title chooses it: the title's
 * letters roll up into full ink and the illustration wipes in over the last
 * one. Until someone does, it plays through the steps once on its own, with a
 * line under the current title filling for as long as it holds; it pauses
 * while the pointer is over it or it is off screen, and never plays under
 * reduced motion.
 */

function DiscoveryVisual() {
  return (
    <div className='process-conversation' aria-hidden='true'>
      <span className='process-message process-message-muted'>Approvals take three follow-ups.</span>
      <span className='process-message process-message-strong'>Show me what happens after a request comes in.</span>
      <span className='process-typing'>
        <i />
        <i />
        <i />
      </span>
    </div>
  )
}

export function AuditVisual() {
  return (
    <div className='process-audit' aria-hidden='true'>
      <div className='process-audit-head'>
        <span>Current workflow</span>
        <b>3 opportunities found</b>
      </div>
      {[
        ['01', 'Manual data entry', '4.2 hrs/wk'],
        ['02', 'Approval waiting', '1.8 days'],
        ['03', 'Repeat follow-up', '26 / mo']
      ].map(([number, label, metric], index) => (
        <div key={number} className='process-audit-row' style={{ '--audit-index': index } as CSSProperties}>
          <span>{number}</span>
          <strong>{label}</strong>
          <i>{metric}</i>
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
      <span className='process-map-status'>
        rules mapped <b>✓</b>
      </span>
    </div>
  )
}

export function BuildVisual() {
  return (
    <div className='process-terminal' aria-hidden='true'>
      <div className='process-terminal-top'>
        <i />
        <i />
        <i />
        <span>workflow.build</span>
      </div>
      <div className='process-terminal-body'>
        <p>
          <b>$</b> assembling your system…
        </p>
        <p>
          <span>✓</span> apps connected
        </p>
        <p>
          <span>✓</span> rules configured
        </p>
        <p>
          <span>✓</span> unusual cases tested
        </p>
        <div className='process-terminal-progress'>
          <i />
        </div>
      </div>
    </div>
  )
}

function TestVisual() {
  return (
    <div className='process-tests' aria-hidden='true'>
      <div className='process-tests-head'>
        <span>TEST RUN</span>
        <b>12 / 12 passed</b>
      </div>
      <div className='process-tests-grid'>
        {['Standard case', 'Missing field', 'Duplicate entry', 'App not responding'].map((label, index) => (
          <span key={label} style={{ '--test-index': index } as CSSProperties}>
            <i>✓</i>
            {label}
          </span>
        ))}
      </div>
      <div className='process-handover'>
        <span>Documentation</span>
        <span>Team walkthrough</span>
        <b>READY</b>
      </div>
    </div>
  )
}

export function LaunchVisual() {
  return (
    <div className='process-monitor' aria-hidden='true'>
      <div className='process-monitor-status'>
        <i /> LIVE <span>· 14 days monitored</span>
      </div>
      <div className='process-monitor-metric'>
        <strong>99.9%</strong>
        <span>successful runs</span>
      </div>
      <svg viewBox='0 0 520 150' preserveAspectRatio='none'>
        <path
          className='process-monitor-area'
          d='M8 128 C65 124 82 114 124 116 S190 91 236 98 S302 71 346 76 S416 44 512 26 L512 150 L8 150 Z'
        />
        <path
          className='process-monitor-line'
          d='M8 128 C65 124 82 114 124 116 S190 91 236 98 S302 71 346 76 S416 44 512 26'
        />
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

/** The steps grouped by engagement, with that engagement's duration. Phases
 *  are in ENGAGEMENTS order: audit, build, retainer. */
const PHASES = (['Audit', 'Build', 'Retainer'] as const).map((name, index) => ({
  name,
  duration: ENGAGEMENTS[index]?.duration,
  steps: PROCESS.flatMap((step, stepIndex) => (step.phase === name ? [stepIndex] : []))
}))

const TOTAL = String(PROCESS.length).padStart(2, '0')

/**
 * The chosen illustration wipes down from its top edge. The one it replaces
 * fades out first rather than wiping away under it: the stage is see-through
 * so the page's leaves show, and two half-drawn illustrations would overlap.
 */
const WIPE: Variants = {
  shown: {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    opacity: 1,
    transition: { clipPath: { ease: [0.33, 1, 0.68, 1] as const, duration: 0.8 }, opacity: { duration: 0 } }
  },
  hidden: {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
    opacity: 0,
    transition: { opacity: { duration: 0.2 }, clipPath: { delay: 0.2, duration: 0 } }
  }
}

/**
 * Under reduced motion the illustration simply swaps. MotionConfig's
 * reducedMotion only stills transforms, and this wipe is clip-path and
 * opacity, so it is turned off here instead.
 */
const SWAP: Variants = {
  shown: { clipPath: 'none', opacity: 1, transition: { duration: 0 } },
  hidden: { clipPath: 'none', opacity: 0, transition: { duration: 0 } }
}

/**
 * A step title whose letters roll: the faint copy lifts out as the inked copy
 * rises in behind it, one letter after another. Screen readers get the plain
 * title from the button; the letters are hidden from them.
 */
function RollingTitle({ text, active }: { text: string; active: boolean }) {
  return (
    <span className='process-explorer-roll' aria-hidden='true'>
      {[...text].map((char, index) => (
        <span key={index} className='process-explorer-roll-char'>
          <MotionConfig transition={{ delay: index * 0.022, duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <motion.span initial={false} animate={{ y: active ? '-110%' : '0%' }}>
              {char === ' ' ? '\u00a0' : char}
            </motion.span>
            <motion.span className='process-explorer-roll-ink' initial={false} animate={{ y: active ? '0%' : '110%' }}>
              {char === ' ' ? '\u00a0' : char}
            </motion.span>
          </MotionConfig>
        </span>
      ))}
    </span>
  )
}

export function HowItWorksSection() {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const [active, setActive] = useState(0)

  // Autoplay runs once through until anyone chooses a step themselves.
  const [autoplay, setAutoplay] = useState(true)
  const [visible, setVisible] = useState(false)

  // Held while a pointer is over the explorer or keyboard focus is inside it,
  // so nobody has the step change under them while reading.
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const playing = autoplay && !reduced && visible && !hovered && !focused

  useEffect(() => {
    const root = rootRef.current

    if (!root) return

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 })

    observer.observe(root)

    return () => observer.disconnect()
  }, [])

  // On phones the titles scroll sideways; keep the current one in view
  // without moving the page.
  useEffect(() => {
    const nav = navRef.current
    const tab = tabRefs.current[active]

    if (!nav || !tab || nav.scrollWidth <= nav.clientWidth) return

    nav.scrollTo({
      left: tab.offsetLeft - (nav.clientWidth - tab.offsetWidth) / 2,
      behavior: reduced ? 'auto' : 'smooth'
    })
  }, [active, reduced])

  // Hover chooses only in the titles column. In the sideways row, centring
  // the chosen chip slides another under a still pointer, which would
  // choose that one in turn.
  const navScrolls = () => {
    const nav = navRef.current

    return !!nav && nav.scrollWidth > nav.clientWidth
  }

  const choose = (index: number, focus = false) => {
    setAutoplay(false)
    setActive(index)

    if (focus) tabRefs.current[index]?.focus()
  }

  const advance = () => {
    if (active === PROCESS.length - 1) {
      setAutoplay(false)
      setActive(0)
    } else {
      setActive(active + 1)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = PROCESS.length - 1

    const next = {
      ArrowDown: Math.min(active + 1, last),
      ArrowRight: Math.min(active + 1, last),
      ArrowUp: Math.max(active - 1, 0),
      ArrowLeft: Math.max(active - 1, 0),
      Home: 0,
      End: last
    }[event.key]

    if (next === undefined) return

    event.preventDefault()
    choose(next, true)
  }

  const step = PROCESS[active]

  return (
    <section id='process' className={SECTION}>
      <div className={CONTAINER}>
        <SectionIntro
          tag='HOW IT WORKS'
          title='A clear path from problem to reliable system.'
          blurb='You will always know what is happening, what comes next and what I need from you.'
          margin='mb-12 lg:mb-16'
          titleClassName='mt-6 max-w-[18ch] text-[clamp(2.5rem,5vw,5.2rem)]'
        />

        <MotionConfig reducedMotion='user'>
          <div
            ref={rootRef}
            className='process-explorer'
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={event => {
              if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
            }}
          >
            <div ref={navRef} className='process-explorer-nav' role='tablist' aria-label='Steps'>
              {PHASES.map(phase => (
                <div key={phase.name} className='process-explorer-phase' role='presentation'>
                  <p className='process-explorer-phase-label' aria-hidden='true'>
                    {phase.name} <span>· {phase.duration}</span>
                  </p>

                  <div className='process-explorer-phase-steps' role='presentation'>
                    {phase.steps.map(index => {
                      const item = PROCESS[index]
                      const isActive = index === active

                      return (
                        <button
                          key={item.step}
                          ref={el => {
                            tabRefs.current[index] = el
                          }}
                          type='button'
                          role='tab'
                          id={`process-tab-${index}`}
                          aria-selected={isActive}
                          aria-controls='process-panel'
                          tabIndex={isActive ? 0 : -1}
                          className='process-explorer-tab'
                          data-active={isActive}
                          onPointerEnter={event =>
                            event.pointerType === 'mouse' && !isActive && !navScrolls() && choose(index)
                          }
                          onClick={() => choose(index)}
                          onKeyDown={onKeyDown}
                        >
                          <span className='process-explorer-tab-number'>{item.step}</span>
                          <span className='process-explorer-tab-title' style={{ fontFamily: DISPLAY_FONT }}>
                            <span className='sr-only'>{item.label}</span>
                            <RollingTitle text={item.label} active={isActive} />
                          </span>
                          {isActive && autoplay && !reduced && (
                            <i
                              className='process-explorer-timer'
                              data-playing={playing}
                              onAnimationEnd={advance}
                              aria-hidden='true'
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div
              id='process-panel'
              role='tabpanel'
              aria-labelledby={`process-tab-${active}`}
              className='process-explorer-panel'
            >
              {/* Every illustration is mounted and stacked in one cell. */}
              <div className='process-explorer-stage' aria-hidden='true'>
                {VISUALS.map((visual, index) => (
                  <motion.div
                    key={index}
                    className='process-explorer-visual'
                    initial={false}
                    variants={reduced ? SWAP : WIPE}
                    animate={index === active ? 'shown' : 'hidden'}
                  >
                    {visual}
                  </motion.div>
                ))}
              </div>

              <div key={active} className='process-explorer-detail'>
                <p className='process-explorer-kicker'>
                  {step.step} / {TOTAL}{' '}
                  <span>
                    · {step.phase} · {step.timing}
                  </span>
                </p>
                <p className='process-explorer-summary' style={{ fontFamily: DISPLAY_FONT }}>
                  {step.summary}
                </p>
                <p className='process-explorer-desc'>{step.desc}</p>
                <dl className='process-explorer-terms'>
                  <div>
                    <dt>From you</dt>
                    <dd>{step.fromYou}</dd>
                  </div>
                  <div>
                    <dt>You get</dt>
                    <dd>{step.youGet}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </MotionConfig>
      </div>
    </section>
  )
}
