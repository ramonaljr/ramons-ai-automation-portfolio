'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

import { CONTAINER, DISPLAY_FONT, SECTION } from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'
import { PROCESS } from '@/lib/portfolio'

/**
 * How it works, as a list that scrolls normally.
 *
 * This used to be a pinned horizontal rail driven by GSAP, three screens long,
 * directly after the pinned problem-to-outcome story. Two pinned sequences in
 * a row was scroll fatigue, so the story keeps the cinematic moment and this
 * section reads at the pace of the page: six steps on the right, and on wide
 * screens a sticky stage on the left showing the step being read. Dropping
 * GSAP also removed it, ScrollTrigger and SplitText from the landing bundle.
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

function AuditVisual() {
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
        logic mapped <b>✓</b>
      </span>
    </div>
  )
}

function BuildVisual() {
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
          <span>✓</span> edge cases tested
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
        <span>VALIDATION RUN</span>
        <b>12 / 12 passed</b>
      </div>
      <div className='process-tests-grid'>
        {['Standard case', 'Missing field', 'Duplicate entry', 'API timeout'].map((label, index) => (
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

function LaunchVisual() {
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

/** The step whose top has passed this line of the viewport is the one shown. */
const READING_LINE = 0.45

export function HowItWorksSection() {
  const listRef = useRef<HTMLOListElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const list = listRef.current

    if (!list) return

    const steps = [...list.querySelectorAll<HTMLElement>('[data-step-index]')]

    // The observer is only a trigger: the answer is re-read from geometry, so
    // a fast flick past several steps still lands on the right one.
    const update = () => {
      const line = window.innerHeight * READING_LINE
      let next = 0

      steps.forEach((step, index) => {
        if (step.getBoundingClientRect().top <= line) next = index
      })

      setActive(next)
    }

    const observer = new IntersectionObserver(update, {
      rootMargin: `-${READING_LINE * 100}% 0px -${100 - READING_LINE * 100 - 1}% 0px`
    })

    steps.forEach(step => observer.observe(step))
    update()

    return () => observer.disconnect()
  }, [])

  return (
    <section id='process' className={`${SECTION} process-flow-section`}>
      <div className={CONTAINER}>
        <SectionIntro
          tag='HOW IT WORKS'
          title='A clear path from problem to reliable system.'
          blurb='You will always know what is happening, what comes next and what I need from you.'
          margin='mb-14 lg:mb-20'
          titleClassName='mt-6 max-w-[18ch] text-[clamp(2.5rem,5vw,5.2rem)]'
        />

        <div className='process-flow'>
          {/* Decorative: the step list carries the content. Re-keyed on each
              change so the visual's own entrance animation plays again. */}
          <div className='process-flow-stage' aria-hidden='true'>
            <span className='process-flow-stage-number'>{PROCESS[active]?.step}</span>
            <div key={active} className='process-flow-stage-card'>
              {VISUALS[active]}
            </div>
            <span className='process-flow-stage-caption'>FROM IDEA TO WORKING SYSTEM</span>
          </div>

          <ol ref={listRef} className='process-flow-steps'>
            {PROCESS.map((step, index) => (
              <li
                key={step.step}
                data-step-index={index}
                data-active={index === active}
                className='process-flow-step'
                style={{ '--step-index': index } as CSSProperties}
              >
                <span className='process-flow-step-number' style={{ fontFamily: DISPLAY_FONT }}>
                  {step.step}
                </span>
                <div>
                  <h3 className='process-flow-step-title' style={{ fontFamily: DISPLAY_FONT }}>
                    {step.label}
                  </h3>
                  <p className='process-flow-step-summary'>{step.summary}</p>
                  <p className='process-flow-step-desc'>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
