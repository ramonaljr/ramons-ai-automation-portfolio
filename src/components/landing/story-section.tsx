'use client'

import { useRef } from 'react'

import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'

import { DISPLAY_FONT } from '@/components/landing/motion'

/**
 * Problem → system → outcome, told as one scene the reader scrolls through.
 *
 * The desk is the constant. It starts at night, grey and buried in paper,
 * while the backlog counters climb; the tools light up one by one and the
 * counters drain; then the frame cuts to the same kind of desk, cleared, at
 * golden hour. The scroll is the playhead, so the story moves at the reader's
 * pace rather than a video's.
 *
 * Phones and reduced motion get the same three beats as stacked panels: a
 * pinned three-screen scene is too much scroll on a phone, and it is exactly
 * the kind of motion reduced-motion readers opted out of. Only one layout is
 * ever displayed (the other is `display: none`), so screen readers meet the
 * copy once.
 */

const NIGHT_DESK = '/images/landing/work-scenes/invoice-processing-gl-reconciliation.webp'
const GOLDEN_DESK = '/images/landing/work-scenes/zero-touch-client-onboarding.webp'

const BACKLOG = [
  { value: 47, label: 'unread emails' },
  { value: 23, label: 'invoices to key in' },
  { value: 6, label: 'leads not called back' }
] as const

const TOOLS = ['Gmail', 'n8n', 'Claude', 'QuickBooks', 'Slack'] as const

const ACTS = [
  {
    tag: '01 · The problem',
    title: 'It’s 9:14 PM. The work is still waiting.',
    copy: 'Invoices to key in, leads to call back, a report due in the morning. The business grew; the admin grew faster.'
  },
  {
    tag: '02 · The system',
    title: 'Then the work starts moving on its own.',
    copy: 'Email, AI, accounting and team chat connected into one workflow. Every step checked, every exception handed to a person.'
  },
  {
    tag: '03 · The outcome',
    title: 'Home by five.',
    copy: 'The same work still gets done, without the late nights. That is the job: time back for the people running the business.'
  }
] as const

/**
 * Where each act holds full opacity, as fractions of the pinned scroll.
 *
 * Every scroll-linked range here spans 0 to 1 explicitly. Motion hands
 * opacity to the browser's native scroll timeline, and a keyframe list that
 * stops short of 1 is left to drift back toward the element's resting value:
 * act one, faded out at 0.34, crept back to 85% by the end of the scroll and
 * sat on top of the outcome.
 */
const ACT_WINDOWS: { input: number[]; output: number[] }[] = [
  { input: [0, 0.27, 0.34, 1], output: [1, 1, 0, 0] },
  { input: [0, 0.3, 0.38, 0.6, 0.67, 1], output: [0, 0, 1, 1, 0, 0] },
  { input: [0, 0.63, 0.71, 1], output: [0, 0, 1, 1] }
]

/** Where along act two each tool switches on. */
const toolThreshold = (index: number) => 0.4 + index * 0.045

export function StorySection() {
  return (
    <section id='story' aria-label='How automation changes the working day' className='story-section'>
      <PinnedStory />
      <StackedStory />
    </section>
  )
}

function PinnedStory() {
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: progress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })

  const imageScale = useTransform(progress, [0, 1], [1.14, 1])

  const nightFilter = useTransform(
    progress,
    [0, 0.34, 0.62, 1],
    [
      'grayscale(0.85) brightness(0.42) contrast(1.1)',
      'grayscale(0.35) brightness(0.55) contrast(1.06)',
      'grayscale(0) brightness(0.68) contrast(1)',
      'grayscale(0) brightness(0.68) contrast(1)'
    ]
  )

  const goldenOpacity = useTransform(progress, [0, 0.6, 0.72, 1], [0, 0, 1, 1])

  const backlogOpacity = useTransform(progress, [0, 0.02, 0.08, 0.6, 0.67, 1], [0, 0, 1, 1, 0, 0])
  const flowOpacity = useTransform(progress, [0, 0.33, 0.4, 0.6, 0.67, 1], [0, 0, 1, 1, 0, 0])
  const flowLine = useTransform(progress, [0, 0.38, 0.6, 1], [0, 0, 1, 1])
  const railFill = useTransform(progress, [0, 1], [0, 1])

  return (
    <div ref={trackRef} className='story-track'>
      <div className='story-stage'>
        <div className='story-screen'>
          <motion.img
            src={NIGHT_DESK}
            alt=''
            width={1400}
            height={875}
            loading='lazy'
            className='story-image'
            style={{ scale: imageScale, filter: nightFilter }}
          />
          <motion.img
            src={GOLDEN_DESK}
            alt=''
            width={1400}
            height={875}
            loading='lazy'
            className='story-image story-image-golden'
            style={{ scale: imageScale, opacity: goldenOpacity }}
          />
          <div className='story-shade' />

          {/* The counters, tool chain and progress rail are the animation, not
              the story: the copy below carries it for screen readers. */}
          <motion.ul className='story-backlog' style={{ opacity: backlogOpacity }} aria-hidden='true'>
            {BACKLOG.map(item => (
              <li key={item.label}>
                <Counter progress={progress} target={item.value} />
                <span>{item.label}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div className='story-flow' style={{ opacity: flowOpacity }} aria-hidden='true'>
            <div className='story-flow-line'>
              <motion.i style={{ scaleX: flowLine }} />
            </div>
            <ol>
              {TOOLS.map((tool, index) => (
                <ToolNode key={tool} name={tool} progress={progress} threshold={toolThreshold(index)} />
              ))}
            </ol>
          </motion.div>

          {ACTS.map((act, index) => (
            <ActCopy key={act.tag} act={act} index={index} progress={progress} />
          ))}

          <div className='story-rail' aria-hidden='true'>
            <div className='story-rail-labels'>
              <span>Problem</span>
              <span>System</span>
              <span>Outcome</span>
            </div>
            <div className='story-rail-track'>
              <motion.i style={{ scaleX: railFill }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Climbs while the problem builds, then drains to zero while the system runs. */
function Counter({ progress, target }: { progress: MotionValue<number>; target: number }) {
  const value = useTransform(progress, [0.04, 0.24, 0.42, 0.6], [0, target, target, 0])
  const text = useTransform(value, latest => String(Math.round(latest)))

  return <motion.strong style={{ fontFamily: DISPLAY_FONT }}>{text}</motion.strong>
}

function ToolNode({ name, progress, threshold }: { name: string; progress: MotionValue<number>; threshold: number }) {
  const lit = useTransform(progress, [0, threshold - 0.015, threshold, 1], [0, 0, 1, 1])
  const opacity = useTransform(lit, [0, 1], [0.4, 1])
  const glow = useTransform(lit, [0, 1], ['0 0 0 0 oklch(0.75 0.14 60 / 0)', '0 0 28px 2px oklch(0.75 0.14 60 / 0.55)'])

  return (
    <motion.li style={{ opacity }}>
      <motion.span className='story-flow-node' style={{ boxShadow: glow }} />
      {name}
    </motion.li>
  )
}

function ActCopy({
  act,
  index,
  progress
}: {
  act: (typeof ACTS)[number]
  index: number
  progress: MotionValue<number>
}) {
  const timing = ACT_WINDOWS[index]
  const opacity = useTransform(progress, timing.input, timing.output)
  const y = useTransform(opacity, [0, 1], [24, 0])

  // The acts are stacked in one spot, so a faded act must not catch clicks
  // meant for the one showing.
  const pointerEvents = useTransform(opacity, latest => (latest > 0.5 ? 'auto' : 'none'))
  const outcome = index === ACTS.length - 1
  const stat = useTransform(progress, [0.7, 0.86], [0, 25])
  const statText = useTransform(stat, latest => `${Math.round(latest)}+ hrs`)

  return (
    <motion.div className='story-copy' style={{ opacity, y, pointerEvents }}>
      <p className='story-copy-tag'>{act.tag}</p>
      <h2 className='story-copy-title' style={{ fontFamily: DISPLAY_FONT }}>
        {act.title}
      </h2>
      <p className='story-copy-body'>{act.copy}</p>

      {outcome && (
        <div className='story-outcome'>
          <p>
            <motion.strong style={{ fontFamily: DISPLAY_FONT }}>{statText}</motion.strong>
            <span>of manual work back each week</span>
          </p>
          <a href='#portfolio' className='story-outcome-link'>
            See the systems behind it
          </a>
        </div>
      )}
    </motion.div>
  )
}

/** The same three beats, stacked, for phones and reduced motion. */
function StackedStory() {
  const images = [NIGHT_DESK, NIGHT_DESK, GOLDEN_DESK]

  return (
    <ol className='story-stacked'>
      {ACTS.map((act, index) => (
        <li key={act.tag} className='story-panel' data-act={index}>
          <img src={images[index]} alt='' width={1400} height={875} loading='lazy' className='story-panel-image' />
          <div className='story-panel-shade' />
          <div className='story-panel-copy'>
            <p className='story-copy-tag'>{act.tag}</p>
            <h2 className='story-panel-title' style={{ fontFamily: DISPLAY_FONT }}>
              {act.title}
            </h2>
            <p className='story-copy-body'>{act.copy}</p>

            {index === 0 && (
              <ul className='story-panel-list'>
                {BACKLOG.map(item => (
                  <li key={item.label}>
                    <strong>{item.value}</strong> {item.label}
                  </li>
                ))}
              </ul>
            )}

            {index === 1 && <p className='story-panel-tools'>{TOOLS.join(' → ')}</p>}

            {index === 2 && (
              <>
                <p className='story-panel-stat'>
                  <strong style={{ fontFamily: DISPLAY_FONT }}>25+ hrs</strong> of manual work back each week
                </p>
                <a href='#portfolio' className='story-outcome-link'>
                  See the systems behind it
                </a>
              </>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
