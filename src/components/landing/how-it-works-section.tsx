'use client'

import { useRef, useState, type CSSProperties, type ReactNode } from 'react'

import { useMotionValueEvent, useScroll } from 'motion/react'

import { CONTAINER, DISPLAY_FONT, SECTION } from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'
import { PROCESS } from '@/lib/portfolio'

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

function ProcessStep({ index, activeIndex }: { index: number; activeIndex: number }) {
  const step = PROCESS[index]
  const textFirst = index % 2 === 0
  const position = index < activeIndex ? 'before' : index > activeIndex ? 'after' : 'active'

  const copy = (
    <div className='process-story-copy'>
      <span className='process-story-kicker'>STEP {step.step} / {String(PROCESS.length).padStart(2, '0')}</span>
      <h3 style={{ fontFamily: DISPLAY_FONT }}>{step.label}</h3>
      <p className='process-step-summary'>{step.summary}</p>
      <p>{step.desc}</p>
    </div>
  )

  const visual = (
    <div className='process-story-visual'>
      <span className='process-story-visual-number' aria-hidden='true'>{step.step}</span>
      <div className='process-story-visual-card'>{VISUALS[index]}</div>
      <span className='process-story-visual-caption'>FROM IDEA TO WORKING SYSTEM</span>
    </div>
  )

  return (
    <article className='process-story-page' data-position={position} aria-hidden='true'>
      <div className={`process-story-half process-story-half-left ${textFirst ? 'process-story-half-copy' : 'process-story-half-visual'}`}>
        {textFirst ? copy : visual}
      </div>
      <div className={`process-story-half process-story-half-right ${textFirst ? 'process-story-half-visual' : 'process-story-half-copy'}`}>
        {textFirst ? visual : copy}
      </div>
    </article>
  )
}

export function HowItWorksSection() {
  const storyRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ['start start', 'end end']
  })

  useMotionValueEvent(scrollYProgress, 'change', progress => {
    setActiveIndex(Math.min(PROCESS.length - 1, Math.floor(progress * PROCESS.length)))
  })

  return (
    <section id='process' className={`${SECTION} process-section`}>
      <div className={`${CONTAINER} process-section-head`}>
        <SectionIntro
          tag='HOW IT WORKS'
          title='A clear path from problem to reliable system.'
          blurb='You will always know what is happening, what comes next and what I need from you.'
          align='center'
          margin='mb-20 lg:mb-28'
          titleClassName='mx-auto mt-6 max-w-[18ch] text-[clamp(2.5rem,5vw,5.2rem)]'
        />

        <ol className='sr-only'>
          {PROCESS.map(step => <li key={step.step}>{step.label}: {step.summary} {step.desc}</li>)}
        </ol>
      </div>

      <div ref={storyRef} className='process-story' style={{ '--process-pages': PROCESS.length } as CSSProperties}>
        <div className='process-story-sticky'>
          <div className='process-story-topline' aria-hidden='true'>
            <span>THE DELIVERY PATH</span>
            <span>{String(activeIndex + 1).padStart(2, '0')} / {String(PROCESS.length).padStart(2, '0')}</span>
          </div>
          {PROCESS.map((step, index) => <ProcessStep key={step.step} index={index} activeIndex={activeIndex} />)}
          <div className='process-story-progress' aria-hidden='true'>
            {PROCESS.map((step, index) => <span key={step.step} data-active={index === activeIndex ? 'true' : 'false'} />)}
          </div>
          <span className='process-story-scroll-hint' aria-hidden='true'>SCROLL TO EXPLORE ↓</span>
        </div>
      </div>
    </section>
  )
}
