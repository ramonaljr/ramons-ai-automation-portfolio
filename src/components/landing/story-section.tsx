'use client'

import { useRef, useState, type ReactNode } from 'react'

import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'

import { DISPLAY_FONT } from '@/components/landing/motion'
import { SceneFrame } from '@/components/landing/scenes/scene-frame'
import { STORY, STORY_SCENES } from '@/components/landing/scenes/story-scenes'

/**
 * Problem → system → outcome, told as three acts the reader scrolls through.
 *
 * Beside the copy, each act has a scene in the same look as the Process and
 * Services scenes (story-scenes.tsx): the inbox at 9:14 PM with the work
 * still arriving, the workflow taking it through with one case handed to a
 * person, and the same inbox clear at five. The scroll picks the act; each
 * scene plays as its act arrives and holds its last frame.
 *
 * Phones and reduced motion get the same three beats as stacked panels, each
 * with its scene (a still under reduced motion): a pinned three-screen scene
 * is too much scroll on a phone, and it is exactly the kind of motion
 * reduced-motion readers opted out of. Only one layout is ever displayed (the
 * other is `display: none`), so screen readers meet the copy once.
 */

const BACKLOG = [
  { value: 47, label: 'unread emails' },
  { value: 23, label: 'invoices to key in' },
  { value: 6, label: 'leads not called back' }
] as const

/** The tool chain in words, for the stacked panels. */
const TOOL_CHAIN = ['Gmail', 'n8n', 'Claude', 'QuickBooks', 'Slack']

const ACTS = [
  {
    tag: 'The problem',
    title: 'It’s 9:14 PM. The work is still waiting.',
    copy: 'Invoices to key in, leads to call back, a report due in the morning. The business grew; the admin grew faster.'
  },
  {
    tag: 'The system',
    title: 'Then the work starts moving on its own.',
    copy: 'Email, AI, accounting and team chat connected into one workflow. Every step checked, every unusual case handed to a person.'
  },
  {
    tag: 'The outcome',
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

/** Where the outcome's system count runs, inside act three's fade-in (0.63 to 0.71). */
const OUTCOME_COUNT = [0.6, 0.68] as const

/** An act's opacity at `p`, read off its window the way useTransform reads it. */
const opacityAt = ({ input, output }: (typeof ACT_WINDOWS)[number], p: number) => {
  const i = Math.max(
    0,
    input.findIndex((stop, k) => p <= (input[k + 1] ?? Infinity) && p >= stop)
  )

  const [from, to] = [input[i]!, input[i + 1] ?? input[i]!]
  const t = to === from ? 0 : Math.min(1, Math.max(0, (p - from) / (to - from)))

  return output[i]! + ((output[i + 1] ?? output[i]!) - output[i]!) * t
}

/** Each act's scene is mounted only while its act shows at all, so it plays as the act arrives. */
const showing = (p: number) => ACT_WINDOWS.map(window => opacityAt(window, p) > 0.001)

const sameShowing = (a: boolean[], b: boolean[]) => a.every((v, i) => v === b[i])

const RATIO = STORY.width / STORY.height
const PANEL_RATIO = STORY.compact ? STORY.compact.width / STORY.compact.height : RATIO

export function StorySection({ systemCount }: { systemCount: number }) {
  return (
    <section id='story' aria-label='How automation changes the working day' className='story-section'>
      <PinnedStory systemCount={systemCount} />
      <StackedStory systemCount={systemCount} />
    </section>
  )
}

function PinnedStory({ systemCount }: { systemCount: number }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })

  // Slow on purpose. The track is long, so each act takes real scrolling, and
  // the copy follows the scroll through a soft spring rather than locking to
  // it: a hard flick of the wheel still plays out as a slow camera move.
  const progress = useSpring(scrollYProgress, { stiffness: 38, damping: 18, mass: 0.9, restDelta: 0.0005 })

  const railFill = useTransform(progress, [0, 1], [0, 1])

  return (
    <div ref={trackRef} className='story-track'>
      <div className='story-stage'>
        <div className='story-screen'>
          {ACTS.map((act, index) => (
            <ActCopy key={act.tag} act={act} index={index} progress={progress} systemCount={systemCount} />
          ))}

          {/* The scenes and rail are the animation, not the story: the copy
              carries it for screen readers. */}
          <div className='story-board-wrap' aria-hidden='true'>
            <ActScenes progress={progress} />
          </div>

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

/** The three scenes, stacked, each fading with its act's copy. */
function ActScenes({ progress }: { progress: MotionValue<number> }) {
  const [shown, setShown] = useState(() => showing(progress.get()))

  useMotionValueEvent(progress, 'change', latest => {
    const next = showing(latest)

    setShown(current => (sameShowing(current, next) ? current : next))
  })

  return (
    <div className='story-scenes'>
      {STORY_SCENES.map((Scene, index) => (
        <ActScene key={index} index={index} progress={progress}>
          <SceneFrame ratio={RATIO} on={shown[index]}>
            <Scene mode='once' />
          </SceneFrame>
        </ActScene>
      ))}
    </div>
  )
}

function ActScene({
  index,
  progress,
  children
}: {
  index: number
  progress: MotionValue<number>
  children: ReactNode
}) {
  const timing = ACT_WINDOWS[index]!
  const opacity = useTransform(progress, timing.input, timing.output)
  const y = useTransform(opacity, [0, 1], ['1.5rem', '0rem'])

  return (
    <motion.div className='story-scene' style={{ opacity, y }}>
      {children}
    </motion.div>
  )
}

function ActCopy({
  act,
  index,
  progress,
  systemCount
}: {
  act: (typeof ACTS)[number]
  index: number
  systemCount: number
  progress: MotionValue<number>
}) {
  const timing = ACT_WINDOWS[index]
  const opacity = useTransform(progress, timing.input, timing.output)
  const y = useTransform(opacity, [0, 1], [24, 0])

  // The acts are stacked in one spot, so a faded act must not catch clicks
  // meant for the one showing.
  const pointerEvents = useTransform(opacity, latest => (latest > 0.5 ? 'auto' : 'none'))
  const outcome = index === ACTS.length - 1

  // The count climbs while the outcome fades in, so the number has landed by
  // the time the act is fully on screen; counting after that left "0 systems"
  // sitting at full opacity. Before the count starts the act is invisible, so
  // the real number is shown there for screen readers and the server render.
  const stat = useTransform(progress, latest =>
    latest <= OUTCOME_COUNT[0]
      ? systemCount
      : systemCount * Math.min(1, (latest - OUTCOME_COUNT[0]) / (OUTCOME_COUNT[1] - OUTCOME_COUNT[0]))
  )

  const statText = useTransform(stat, latest => `${Math.round(latest)} systems`)

  return (
    <motion.div className='story-copy' style={{ opacity, y, pointerEvents }}>
      {/* A <p>, not an <h2>: StackedStory below carries the same three
          headings, and the page was shipping each of them twice. Only one
          variant is ever on screen, and the stacked one keeps the heading. */}
      <p className='story-copy-title' style={{ fontFamily: DISPLAY_FONT }}>
        {act.title}
      </p>
      <p className='story-copy-body'>{act.copy}</p>

      {outcome && (
        <div className='story-outcome'>
          <p>
            <motion.strong style={{ fontFamily: DISPLAY_FONT }}>{statText}</motion.strong>
            <span>built to hand that time back</span>
          </p>
          <a href='#portfolio' className='story-outcome-link'>
            See examples
          </a>
        </div>
      )}
    </motion.div>
  )
}

/** A panel's scene, in its narrow design on a phone. It plays when it scrolls into view. */
function PanelScene({ index }: { index: number }) {
  const Scene = STORY_SCENES[index]

  if (!Scene) return null

  return (
    <div className='story-panel-scene' aria-hidden='true'>
      <SceneFrame ratio={PANEL_RATIO}>
        <Scene mode='once' />
      </SceneFrame>
    </div>
  )
}

/** The same three beats, stacked, for phones and reduced motion. */
function StackedStory({ systemCount }: { systemCount: number }) {
  return (
    <ol className='story-stacked'>
      {ACTS.map((act, index) => (
        <li key={act.tag} className='story-panel' data-act={index}>
          <h2 className='story-panel-title' style={{ fontFamily: DISPLAY_FONT }}>
            {act.title}
          </h2>
          <p className='story-copy-body'>{act.copy}</p>

          <PanelScene index={index} />

          {index === 0 && (
            <ul className='story-panel-list sr-only'>
              {BACKLOG.map(item => (
                <li key={item.label}>
                  <strong>{item.value}</strong> {item.label}
                </li>
              ))}
            </ul>
          )}

          {index === 1 && <p className='story-panel-tools sr-only'>{TOOL_CHAIN.join(' → ')}</p>}

          {index === 2 && (
            <>
              <p className='story-panel-stat'>
                <strong style={{ fontFamily: DISPLAY_FONT }}>{systemCount} systems</strong> built to hand that time back
              </p>
              <a href='#portfolio' className='story-outcome-link'>
                See examples
              </a>
            </>
          )}
        </li>
      ))}
    </ol>
  )
}
