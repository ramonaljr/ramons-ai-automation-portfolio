'use client'

import type { CSSProperties } from 'react'

import {
  Calendar,
  CalendarPlus,
  CalendarSync,
  CalendarX,
  Check,
  CircleCheck,
  ClipboardList,
  Clock,
  FileText,
  Filter,
  Inbox,
  Mail,
  MessageSquare,
  Pen,
  Search,
  Send,
  Settings,
  Shield,
  Shuffle,
  Target,
  Timer,
  TriangleAlert,
  Upload,
  UserPlus,
  Zap,
  type LucideIcon
} from 'lucide-react'

import type { Lane } from '@/components/landing/film/lanes'

/** The concept icon each lane names in diagrams.json, as build.cjs draws it. */
const CONCEPTS: Record<string, LucideIcon> = {
  alert: TriangleAlert,
  calendar: Calendar,
  calendarPlus: CalendarPlus,
  calendarRefresh: CalendarSync,
  calendarX: CalendarX,
  chat: MessageSquare,
  checkCircle: CircleCheck,
  clipboard: ClipboardList,
  clock: Clock,
  file: FileText,
  filter: Filter,
  gear: Settings,
  inbox: Inbox,
  mail: Mail,
  pen: Pen,
  search: Search,
  send: Send,
  shield: Shield,
  shuffle: Shuffle,
  target: Target,
  timer: Timer,
  upload: Upload,
  userPlus: UserPlus,
  zap: Zap
}

/**
 * The process map in the case study's design: a box per lane in the map's
 * own colours, numbered as the map numbers them, with its steps listed in
 * order. One lane can be lit: the others dim, the steps it has passed take a
 * check and the step it is on stands out, with a dot for running. `wide` draws every lane in a row
 * (each a `data-target` for the camera to move in on); `compact` shows only
 * the lit lane, under a strip of the lanes' numbers.
 */
export function LaneMap({
  lanes,
  lit,
  step,
  layout
}: {
  lanes: Lane[]
  lit: number
  step: number
  layout: 'wide' | 'compact'
}) {
  if (layout === 'compact') {
    return (
      <div className='fl fl--compact'>
        <ol className='fl-strip' aria-hidden='true'>
          {lanes.map(l => (
            <li key={l.n} className='fl-strip__n' data-on={l.n === lit || undefined} style={toneOf(l)}>
              {l.n}
            </li>
          ))}
        </ol>
        {/* Every lane in one place, the lit one showing: a change of lane crossfades */}
        <div className='fl-deck'>
          {lanes.map(l => (
            <LaneBox key={l.n} lane={l} lit={l.n === lit} step={l.n === lit ? step : -1} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='fl fl--wide' data-lit={lit > 0 || undefined}>
      {lanes.map(l => (
        <LaneBox key={l.n} lane={l} lit={l.n === lit} step={l.n === lit ? step : -1} />
      ))}
    </div>
  )
}

const toneOf = (lane: Lane) =>
  ({ '--bg': lane.tone.bg, '--border': lane.tone.border, '--tone': lane.tone.accent }) as CSSProperties

function LaneBox({ lane, lit, step }: { lane: Lane; lit: boolean; step: number }) {
  const Concept = CONCEPTS[lane.concept] ?? CircleCheck

  return (
    <section className='fl-lane' data-target={`lane-${lane.n}`} data-lit={lit || undefined} style={toneOf(lane)}>
      <header className='fl-lane__head'>
        <span className='fl-lane__n'>{lane.n}</span>
        <span className='fl-lane__title'>{lane.title}</span>
        <Concept size={14} absoluteStrokeWidth strokeWidth={1.75} className='fl-lane__concept' aria-hidden='true' />
      </header>
      <ol className='fl-steps'>
        {lane.steps.map((s, i) => (
          <li
            key={`${s.name}-${i}`}
            className='fl-step'
            data-state={!lit || step < 0 ? undefined : i < step ? 'done' : i === step ? 'now' : undefined}
          >
            {/* The step's icon from diagrams.json: our own drawing, as the map shows it */}
            <span className='fl-step__icon' aria-hidden='true' dangerouslySetInnerHTML={{ __html: s.icon }} />
            <span className='fl-step__name'>{s.name}</span>
            <span className='fl-step__mark' aria-hidden='true'>
              <Check size={10} strokeWidth={2.5} className='fl-step__check' />
              <span className='fl-step__run' />
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
