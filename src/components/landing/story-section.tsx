'use client'

import { useRef, type CSSProperties } from 'react'

import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'

import { DISPLAY_FONT } from '@/components/landing/motion'

/**
 * Problem → system → outcome, told as one board the reader scrolls through.
 *
 * The board is drawn in the same language as the process maps on the Selected
 * Work cards: a dotted canvas, pastel numbered stages, white tool tiles and
 * indigo arrows. First the work piles up while the backlog counters climb and
 * the clock reads 9:14 PM; then the pile is drawn into a workflow, items run
 * through its stages, an unusual one is handed to a person, and the counters
 * drain; then the inbox is clear at five. The scroll is the playhead.
 *
 * Phones and reduced motion get the same three beats as stacked panels: a
 * pinned three-screen scene is too much scroll on a phone, and it is exactly
 * the kind of motion reduced-motion readers opted out of. Only one layout is
 * ever displayed (the other is `display: none`), so screen readers meet the
 * copy once.
 */

const BACKLOG = [
  { value: 47, label: 'unread emails' },
  { value: 23, label: 'invoices to key in' },
  { value: 6, label: 'leads not called back' }
] as const

type ToolLogo = { name: string; slug: string; color: string }

const GMAIL: ToolLogo = { name: 'Gmail', slug: 'gmail', color: '#EA4335' }
const CLAUDE: ToolLogo = { name: 'Claude', slug: 'anthropic', color: '#191919' }
const QUICKBOOKS: ToolLogo = { name: 'QuickBooks', slug: 'quickbooks', color: '#2CA01C' }
const SLACK: ToolLogo = { name: 'Slack', slug: 'slack', color: '#4A154B' }
const N8N: ToolLogo = { name: 'n8n', slug: 'n8n', color: '#EA4B71' }

/** The stages, in the cards' palette (see docs/process-diagrams/build.cjs). */
const STAGES = [
  { title: 'Read the inbox', tool: GMAIL, bg: '#EBF2FD', border: '#AFCBF2', accent: '#2F6FD6' },
  { title: 'Decide with AI', tool: CLAUDE, bg: '#E8F7F3', border: '#A4DACD', accent: '#13917C' },
  { title: 'Post to the books', tool: QUICKBOOKS, bg: '#F2EDFB', border: '#C8B6EE', accent: '#7650D6' },
  { title: 'Tell the team', tool: SLACK, bg: '#FFF4E2', border: '#F3CD8E', accent: '#D9820F' }
] as const

/** The tool chain in words, for the stacked panels. */
const TOOL_CHAIN = ['Gmail', 'n8n', 'Claude', 'QuickBooks', 'Slack']

type Kind = 'mail' | 'invoice' | 'lead'

/**
 * The pile. Each item's resting place in the heap, in board units (em, on a
 * board 64em wide by 50em tall), and the tilt it lands at.
 */
const PILE: { kind: Kind; title: string; meta: string; x: number; y: number; r: number }[] = [
  { kind: 'mail', title: 'Re: Invoice #2041 overdue', meta: 'Gmail · 8:47 PM', x: 9, y: 11, r: -5 },
  { kind: 'invoice', title: 'INV-2041 · $4,820.00', meta: 'Needs keying in', x: 35, y: 10, r: 4 },
  { kind: 'lead', title: 'New lead: solar quote', meta: 'Waiting 3 hrs for a call', x: 22, y: 17, r: -2 },
  { kind: 'mail', title: 'Month-end report?', meta: 'From: Operations', x: 6, y: 24, r: 3 },
  { kind: 'invoice', title: 'INV-2042 · $1,265.40', meta: 'Needs keying in', x: 37, y: 22, r: -4 },
  { kind: 'lead', title: 'Demo request, 14 seats', meta: 'Waiting since lunch', x: 19, y: 29, r: 5 },
  { kind: 'mail', title: 'Updated W-9 attached', meta: 'Gmail · 9:03 PM', x: 8, y: 36, r: -3 },
  { kind: 'invoice', title: 'INV-2043 · $9,310.00', meta: 'PO not matched yet', x: 34, y: 34, r: 2 },
  { kind: 'mail', title: 'Can we move Thursday?', meta: 'Gmail · 9:11 PM', x: 21, y: 40, r: -1 }
]

/** Board geometry, in em. */
const STAGE_Y = 12
const STAGE_W = 13
const STAGE_H = 15
const stageX = (i: number) => 2.5 + i * 15
const LANE_Y = STAGE_Y + STAGE_H / 2
const FLOW_START = stageX(0) + STAGE_W / 2
const FLOW_END = stageX(3) + STAGE_W / 2

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

/** Where along act two each stage switches on. */
const stageThreshold = (index: number) => 0.4 + index * 0.035

/** The unusual item leaves stage two for the person lane over this window. */
const EXCEPTION = [0.5, 0.55] as const

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeOut = (t: number) => 1 - (1 - t) ** 3
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
const em = (v: number) => `${v.toFixed(3)}em`

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
  // the scene follows the scroll through a soft spring rather than locking to
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

          {/* The board and rail are the animation, not the story: the copy
              carries it for screen readers. */}
          <div className='story-board-wrap' aria-hidden='true'>
            <Board progress={progress} />
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

function Board({ progress }: { progress: MotionValue<number> }) {
  const mapOpacity = useTransform(progress, [0, 0.33, 0.41, 1], [0, 0, 1, 1])
  const mapY = useTransform(mapOpacity, [0, 1], ['1.5em', '0em'])
  const nightOpacity = useTransform(progress, [0, 0.62, 0.68, 1], [1, 1, 0, 0])
  const dayOpacity = useTransform(progress, [0, 0.62, 0.68, 1], [0, 0, 1, 1])
  const clearOpacity = useTransform(progress, [0, 0.64, 0.72, 1], [0, 0, 1, 1])
  const clearY = useTransform(clearOpacity, [0, 1], ['1.2em', '0em'])

  return (
    <div className='story-board'>
      <div className='story-board-top'>
        <span className='story-clock'>
          <ClockIcon />
          <motion.span className='story-clock-time' style={{ opacity: nightOpacity }}>
            9:14 PM
          </motion.span>
          <motion.span className='story-clock-time story-clock-day' style={{ opacity: dayOpacity }}>
            5:00 PM
          </motion.span>
        </span>

        <ul className='story-counters'>
          {BACKLOG.map(item => (
            <li key={item.label}>
              <Counter progress={progress} target={item.value} />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <motion.div className='story-map' style={{ opacity: mapOpacity, y: mapY }}>
        {STAGES.slice(0, -1).map((_, i) => (
          <Arrow key={i} index={i} progress={progress} />
        ))}

        {STAGES.map((stage, i) => (
          <Stage key={stage.title} stage={stage} index={i} progress={progress} />
        ))}

        <ExceptionLane progress={progress} />

        {[0, 1, 2].map(i => (
          <Packet key={i} index={i} progress={progress} />
        ))}

        <span className='story-runs-on'>
          <Logo tool={N8N} size='1.3em' />
          Runs on n8n
        </span>
      </motion.div>

      {PILE.map((item, i) => (
        <PileCard key={item.title} item={item} index={i} progress={progress} />
      ))}

      <motion.div className='story-clear' style={{ opacity: clearOpacity, y: clearY }}>
        <span className='story-clear-check'>
          <CheckIcon />
        </span>
        <span>
          <strong>Inbox clear</strong>
          Invoices posted, leads called back, report sent at 4:52 PM.
        </span>
      </motion.div>
    </div>
  )
}

/**
 * One item of the pile. It drops in while the problem builds, then flies into
 * the first stage, shrinking as it goes, once the workflow switches on.
 */
function PileCard({
  item,
  index,
  progress
}: {
  item: (typeof PILE)[number]
  index: number
  progress: MotionValue<number>
}) {
  const arrive = (p: number) => easeOut(clamp01((p - (0.03 + index * 0.022)) / 0.06))
  const leave = (p: number) => easeInOut(clamp01((p - (0.32 + index * 0.011)) / 0.05))

  const targetX = FLOW_START - 9
  const targetY = LANE_Y - 2.75

  const x = useTransform(progress, p => em(item.x + (targetX - item.x) * leave(p)))
  const y = useTransform(progress, p => em(item.y - 5 * (1 - arrive(p)) + (targetY - item.y) * leave(p)))
  const rotate = useTransform(progress, p => item.r * (1 - leave(p)) + (1 - arrive(p)) * item.r * 2)
  const scale = useTransform(progress, p => 1 - 0.7 * leave(p))
  const opacity = useTransform(progress, p => arrive(p) * (1 - clamp01((leave(p) - 0.6) / 0.4)))

  return (
    <motion.div className='story-item' data-kind={item.kind} style={{ x, y, rotate, scale, opacity }}>
      <span className='story-item-icon'>
        {item.kind === 'mail' ? (
          <Logo tool={GMAIL} size='1.4em' />
        ) : item.kind === 'invoice' ? (
          <FileIcon />
        ) : (
          <LeadIcon />
        )}
      </span>
      <span className='story-item-text'>
        <strong>{item.title}</strong>
        <span>{item.meta}</span>
      </span>
    </motion.div>
  )
}

function Stage({
  stage,
  index,
  progress
}: {
  stage: (typeof STAGES)[number]
  index: number
  progress: MotionValue<number>
}) {
  const threshold = stageThreshold(index)
  const lit = useTransform(progress, [0, threshold - 0.02, threshold, 1], [0, 0, 1, 1])
  const filter = useTransform(lit, v => `grayscale(${(1 - v).toFixed(2)})`)
  const opacity = useTransform(lit, [0, 1], [0.5, 1])

  return (
    <motion.div
      className='story-stage-card'
      style={
        {
          left: em(stageX(index)),
          top: em(STAGE_Y),
          width: em(STAGE_W),
          height: em(STAGE_H),
          '--stage-bg': stage.bg,
          '--stage-border': stage.border,
          '--stage-accent': stage.accent,
          filter,
          opacity
        } as unknown as CSSProperties
      }
    >
      <span className='story-stage-head'>
        <span className='story-stage-badge'>{index + 1}</span>
        {stage.title}
      </span>
      <span className='story-stage-tool'>
        <Logo tool={stage.tool} size='2.1em' />
      </span>
      <span className='story-stage-name'>{stage.tool.name}</span>
    </motion.div>
  )
}

function Arrow({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const start = stageThreshold(index)
  const draw = useTransform(progress, [0, start, start + 0.03, 1], [0, 0, 1, 1])

  return (
    <motion.span
      className='story-arrow'
      style={{ left: em(stageX(index) + STAGE_W + 0.4), top: em(LANE_Y), width: em(1.2), scaleX: draw }}
    />
  )
}

/**
 * Work moving through the stages. Each packet loops along the lane while the
 * system runs, offset from the others, and fades out at either end.
 */
function Packet({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const phase = (p: number) => {
    const raw = (p - 0.43) * 7 + index / 3

    return raw - Math.floor(raw)
  }

  const running = (p: number) => clamp01((p - 0.43) / 0.02) * (1 - clamp01((p - 0.6) / 0.03))

  const x = useTransform(progress, p => em(FLOW_START + (FLOW_END - FLOW_START) * phase(p) - 0.55))

  const opacity = useTransform(progress, p => {
    const t = phase(p)

    return running(p) * clamp01(t / 0.08) * clamp01((1 - t) / 0.08)
  })

  return <motion.span className='story-packet' style={{ x, top: em(LANE_Y - 0.55), opacity }} />
}

/** The unusual item: it drops out of stage two to a person, with the context. */
function ExceptionLane({ progress }: { progress: MotionValue<number> }) {
  const fromX = stageX(1) + STAGE_W / 2 - 0.6
  const fromY = STAGE_Y + STAGE_H
  const toY = 31

  const line = useTransform(progress, [0, EXCEPTION[0], EXCEPTION[1], 1], [0, 0, 1, 1])

  const dotY = useTransform(progress, p =>
    em(fromY + (toY - fromY) * easeInOut(clamp01((p - EXCEPTION[0]) / (EXCEPTION[1] - EXCEPTION[0]))))
  )

  const dotOpacity = useTransform(
    progress,
    [0, EXCEPTION[0] - 0.005, EXCEPTION[0], EXCEPTION[1], EXCEPTION[1] + 0.01, 1],
    [0, 0, 1, 1, 0, 0]
  )

  const lit = useTransform(progress, [0, EXCEPTION[1] - 0.01, EXCEPTION[1] + 0.01, 1], [0, 0, 1, 1])
  const cardOpacity = useTransform(lit, [0, 1], [0.45, 1])
  const cardFilter = useTransform(lit, v => `grayscale(${(1 - v).toFixed(2)})`)

  return (
    <>
      <motion.span
        className='story-exception-line'
        style={{ left: em(fromX + 0.5), top: em(fromY), height: em(toY - fromY), scaleY: line }}
      />
      <motion.span
        className='story-packet story-packet-alert'
        style={{ left: em(fromX), y: dotY, opacity: dotOpacity }}
      />
      <motion.div className='story-exception' style={{ top: em(toY), opacity: cardOpacity, filter: cardFilter }}>
        <span className='story-exception-icon'>
          <AlertIcon />
        </span>
        <span>
          <strong>Unusual case</strong>
          Handed to a person, with the context attached.
        </span>
      </motion.div>
    </>
  )
}

/** Climbs while the problem builds, then drains to zero while the system runs. */
function Counter({ progress, target }: { progress: MotionValue<number>; target: number }) {
  const value = useTransform(progress, [0.04, 0.24, 0.42, 0.6], [0, target, target, 0])
  const text = useTransform(value, latest => String(Math.round(latest)))

  return <motion.strong style={{ fontFamily: DISPLAY_FONT }}>{text}</motion.strong>
}

/** A brand mark from public/images/tools, in its own colour. */
function Logo({ tool, size }: { tool: ToolLogo; size: string }) {
  const url = `url(/images/tools/${tool.slug}.svg)`

  return (
    <span
      className='story-logo'
      style={{ width: size, height: size, backgroundColor: tool.color, WebkitMaskImage: url, maskImage: url }}
    />
  )
}

const ICON = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24'
} as const

const ClockIcon = () => (
  <svg {...ICON} className='story-icon'>
    <circle cx='12' cy='12' r='9' />
    <path d='M12 7v5l3 2' />
  </svg>
)

const FileIcon = () => (
  <svg {...ICON} className='story-icon' style={{ color: '#2CA01C' }}>
    <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
    <path d='M14 2v6h6M8 13h8M8 17h5' />
  </svg>
)

const LeadIcon = () => (
  <svg {...ICON} className='story-icon' style={{ color: '#2F6FD6' }}>
    <circle cx='9' cy='8' r='4' />
    <path d='M2 21v-1a6 6 0 0 1 12 0v1M19 8v6M16 11h6' />
  </svg>
)

const AlertIcon = () => (
  <svg {...ICON} className='story-icon'>
    <path d='M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z' />
    <path d='M12 9v4M12 17h.01' />
  </svg>
)

const CheckIcon = () => (
  <svg {...ICON} className='story-icon'>
    <path d='m5 12 4.5 4.5L19 7' />
  </svg>
)

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
      <p className='story-copy-tag'>{act.tag}</p>
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

/** The same three beats, stacked, for phones and reduced motion. */
function StackedStory({ systemCount }: { systemCount: number }) {
  return (
    <ol className='story-stacked'>
      {ACTS.map((act, index) => (
        <li key={act.tag} className='story-panel' data-act={index}>
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

          {index === 1 && <p className='story-panel-tools'>{TOOL_CHAIN.join(' → ')}</p>}

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
