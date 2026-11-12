'use client'

import { ArrowDown } from 'lucide-react'

import { Badge, Camera, Collapse, Roll, type Rect } from '@/components/stageshow/kit'
import { MailCard, RecordCard, SlackCard, type CheckState } from '@/components/landing/film/app-cards'
import type { Mood } from '@/components/landing/film/cast'
import { FilmStage, type FilmDef, type FilmPart } from '@/components/landing/film/film-stage'
import { Ink } from '@/components/landing/film/ink'
import { LaneMap } from '@/components/landing/film/lane-map'
import { laneNamed, lanesOf, stepNamed } from '@/components/landing/film/lanes'
import { Marker } from '@/components/landing/film/marker'
import { ln, rr } from '@/components/landing/film/sketch'
import { LINES } from '@/components/landing/film/films/ai-customer-support-agent-lines'
import { DeskBack, DeskFront, type DeskWords } from '@/components/landing/film/films/ink-desk'
import { MOVE, each, scriptFor } from '@/components/landing/film/films/script'
import { BAND_SPOTS, FLOOR, STAGE, TalkBand, type Actor, type Spot } from '@/components/landing/film/talk-band'
import { ToolMark } from '@/components/landing/scenes/tool-mark'

/**
 * Film 11, AI WhatsApp Customer Support Agent, in two worlds
 * (docs/plans/2026-11-10-two-worlds-films.md). Dennice runs the shop and
 * explains; Leo, a customer, asks what a visitor would ask, and his dented pot
 * is the refund the tour follows; Karan, on the team, steps in to decide it.
 *
 * Before, in ink: Dennice at a desk of support messages answered by hand, the
 * oldest two days unanswered. Then the paper drops to the band and Leo's
 * WhatsApp chat drives the tour: the agent asks for his order number and email, both must
 * match, it searches the policies document and nothing else, and it never
 * promises money. The order is checked again and the refund goes to Slack,
 * where Karan decides; Leo is emailed the decision and the conversation is
 * saved. The marker lands twice: under the reply that promises nothing, and
 * round Karan's decision. Then the other paths (an upset customer handed to a
 * person, the 5 PM summary) and the paper rises for the end.
 *
 * Facts come only from src/content/case-studies/ai-customer-support-agent.mdx
 * and the map's lanes (docs/process-diagrams/diagrams.json). The order
 * number, item, email and chat wording are illustration.
 */

const LANES = lanesOf('ai-customer-support-agent')
const WRITES = laneNamed(LANES, 'Customer messages on WhatsApp')
const ANSWERS = laneNamed(LANES, 'Agent answers from store data')
const ROUTES = laneNamed(LANES, 'Refunds and handovers')
const DECIDES = laneNamed(LANES, 'A person decides')
const LOGS = laneNamed(LANES, 'Logs and daily summary')

const { say, rest, toLane, toApps, wordsOf } = scriptFor<S>(LINES)

/** A support inbox answered by hand: the oldest message two days old. */
const DESK: DeskWords = {
  clock: 'Monday · 9:05 AM',
  card: 'Support inbox',
  sub: 'Answered by hand',
  rows: [
    { title: 'Where is my order?', note: 'No reply for 2 days', at: '2d', wrong: true },
    { title: 'Can I return this jacket?', note: 'Not answered yet', at: '1d' },
    { title: 'Do the boots run small?', note: 'Not answered yet', at: '6h' },
    { title: 'Is the 4P tent in stock?', note: 'Not answered yet', at: '3h' }
  ],
  label: 'SUPPORT',
  folder: 'MESSAGES'
}

/** Leo's WhatsApp chat with the store's agent. */
const CHAT: { who: 'customer' | 'agent'; text: string; target?: string }[] = [
  { who: 'customer', text: 'My pot from FH-1042 arrived dented. Refund please?' },
  { who: 'agent', text: 'Sorry about that. What email is on the order?' },
  { who: 'customer', text: 'leo@example.com' },
  {
    who: 'agent',
    text: 'Found it. I’ve asked the team, and you’ll be emailed their decision.',
    target: 'promise'
  }
]

type Place = 'desk' | 'band' | 'end'

const SPOTS: Record<Place, { dennice: Spot; leo: Spot; karan: Spot }> = {
  desk: {
    dennice: { x: 250, y: 404, w: 250 },
    leo: { x: 790, y: FLOOR - 2, w: 240 },
    karan: { x: 790, y: FLOOR - 2, w: 240 }
  },
  band: { dennice: BAND_SPOTS.left, leo: BAND_SPOTS.right, karan: BAND_SPOTS.right },
  end: {
    dennice: { x: 230, y: FLOOR - 2, w: 220 },
    leo: { x: 480, y: FLOOR - 2, w: 220 },
    karan: { x: 730, y: FLOOR - 2, w: 220 }
  }
}

type S = {
  world: 'ink' | 'build'
  place: Place
  settle: boolean
  dMood: Mood
  lMood: Mood
  kMood: Mood
  leo: boolean
  karan: boolean
  pile: number

  at: number
  view: 'apps' | 'map'
  focus: Rect | null
  chat: number
  looked: boolean
  policy: boolean
  asked: boolean
  approved: boolean
  mailed: boolean
  saved: boolean
  handover: boolean
  summary: boolean
  lane: number
  step: number

  mark: 'none' | 'loop' | 'under'
  markAt: Rect | null
  cta: boolean
}

const BLANK: S = {
  world: 'ink',
  place: 'desk',
  settle: false,
  dMood: 'normal',
  lMood: 'normal',
  kMood: 'normal',
  leo: false,
  karan: false,
  pile: 0,
  at: -1,
  view: 'apps',
  focus: null,
  chat: 0,
  looked: false,
  policy: false,
  asked: false,
  approved: false,
  mailed: false,
  saved: false,
  handover: false,
  summary: false,
  lane: 0,
  step: -1,
  mark: 'none',
  markAt: null,
  cta: false
}

const P2: S = { ...BLANK, dMood: 'puzzled', lMood: 'puzzled', leo: true, pile: DESK.rows.length }

const P3: S = { ...P2, world: 'build', place: 'band', dMood: 'normal', lMood: 'normal' }

const P4: S = {
  ...P3,
  chat: CHAT.length,
  looked: true,
  policy: true,
  asked: true,
  approved: true,
  mailed: true,
  saved: true
}

/* ── The five parts ─────────────────────────────────────────────────────── */

const before: FilmPart<S> = {
  chip: 'Before',
  start: BLANK,
  still: P2,
  words: ['Every support message is answered by hand.', ...wordsOf(0, 1)],
  ms: 9400,
  run: async (a, cue) => {
    await cue.wait(500)
    await each(cue, DESK.rows.length, 380, i => a.put({ pile: i + 1 }))
    await cue.wait(500)
    a.put({ leo: true })
    await cue.wait(1100)
    await say(a, cue, 0, { lMood: 'puzzled' })
    await say(a, cue, 1, { dMood: 'puzzled' })
  }
}

const arrives: FilmPart<S> = {
  chip: 'WhatsApp',
  start: P2,
  still: P3,
  words: wordsOf(2, 2),
  ms: 4800,
  run: async (a, cue) => {
    a.put({ at: -1 })
    a.mark('settle')
    a.put({ settle: true })
    await cue.wait(300)
    a.put({ world: 'build', place: 'band', dMood: 'normal', lMood: 'normal' })
    await cue.wait(1200)
    a.put({ settle: false })
    a.mark('arrives')
    await say(a, cue, 2, { dMood: 'happy' }, 900)
    a.put({ dMood: 'normal' })
    await cue.wait(rest(2, 900))
  }
}

const build: FilmPart<S> = {
  chip: 'Through the build',
  start: P3,
  still: { ...P4, view: 'apps', focus: null, lane: LOGS.n, step: stepNamed(LOGS, 'Log Conversation') },
  words: wordsOf(3, 13),
  ms: 41000,
  run: async (a, cue) => {
    // The view changes only between stretches of the story, never inside a
    // line: the map for a new lane, the apps while the case plays out there.
    // The map's lit step keeps up while it is out of view.

    // Customer writes in: Leo's message reaches the workflow (map)
    a.mark('writes')
    a.put({ at: 3, lMood: 'puzzled' })
    await toLane(a, cue, WRITES.n)
    await each(cue, WRITES.steps.length, 400, i => a.put({ step: i }))
    await cue.wait(rest(3, MOVE + 400))

    // The agent answers in the chat (apps from here to the promise)
    a.mark('asks')
    a.put({ at: 4, lMood: 'normal', lane: ANSWERS.n, step: stepNamed(ANSWERS, 'Support Agent (OpenAI)') })
    await toApps(a, cue, { chat: 3 }, 'chat')
    await cue.wait(rest(4, MOVE))
    a.mark('match')
    a.put({ at: 5, step: stepNamed(ANSWERS, 'Look Up Order') })
    await toApps(a, cue, { looked: true }, 'order')
    await cue.wait(rest(5, MOVE))

    // Only the policies document
    await say(a, cue, 6, { lMood: 'puzzled' })
    a.mark('policies')
    a.put({ at: 7, lMood: 'normal', policy: true, step: stepNamed(ANSWERS, 'Search Store Policies') })
    await cue.wait(rest(7, 0))

    // It never promises money
    await say(a, cue, 8, { lMood: 'puzzled' })
    a.mark('promise')
    a.put({ at: 9, lMood: 'normal', step: stepNamed(ANSWERS, 'Reply On WhatsApp') })
    await toApps(a, cue, { chat: CHAT.length }, 'chat')
    await cue.wait(300)
    a.put({ mark: 'under', markAt: a.rect('promise') })
    await cue.wait(rest(9, MOVE + 300))

    // The order checked again and routed (map)
    a.mark('route')
    a.put({ at: 10, mark: 'none' })
    await toLane(a, cue, ROUTES.n, { step: stepNamed(ROUTES, 'Verify Order') })
    await each(cue, 2, 450, i => a.put({ step: stepNamed(ROUTES, i === 0 ? 'Apply Rules' : 'Route The Request') }))
    await cue.wait(rest(10, MOVE + 450))

    // Karan steps in and decides in Slack (apps to the end of the part)
    a.mark('decide')
    a.put({ at: -1, leo: false, lane: DECIDES.n, step: stepNamed(DECIDES, 'Ask Team To Approve') })
    await toApps(a, cue, { asked: true }, 'slack')
    a.put({ karan: true })
    await cue.wait(900)
    await say(a, cue, 11, { approved: true, kMood: 'happy' }, 500)
    a.put({ mark: 'loop', markAt: a.rect('approved') })
    await cue.wait(rest(11, 500))

    // Leo is emailed the decision
    a.mark('emailed')
    a.put({ at: -1, mark: 'none', karan: false, kMood: 'normal' })
    await cue.wait(700)
    a.put({ leo: true })
    await cue.wait(600)
    a.put({ at: 12, dMood: 'happy', step: stepNamed(DECIDES, 'Email Customer') })
    await toApps(a, cue, { mailed: true }, 'mail')
    await cue.wait(rest(12, MOVE))

    // Every conversation saved
    a.mark('saved')
    a.put({ at: 13, dMood: 'normal', lane: LOGS.n, step: stepNamed(LOGS, 'Log Conversation') })
    await toApps(a, cue, { saved: true }, 'order')
    await cue.wait(rest(13, MOVE))
    await toApps(a, cue, { at: -1 })
  }
}

const others: FilmPart<S> = {
  chip: 'Other paths',
  start: { ...P4, view: 'apps', focus: null },
  still: {
    ...P4,
    handover: true,
    summary: true,
    view: 'apps',
    focus: null,
    lane: LOGS.n,
    step: stepNamed(LOGS, 'Post Daily Summary')
  },
  words: wordsOf(14, 16),
  ms: 11500,
  run: async (a, cue) => {
    a.mark('upset')
    a.put({ at: 14, lMood: 'puzzled' })
    await toLane(a, cue, ROUTES.n, { step: stepNamed(ROUTES, 'Alert Team: Handover') })
    await cue.wait(rest(14, MOVE))
    a.put({ at: 15, lMood: 'normal' })
    await toApps(a, cue, { handover: true }, 'slack')
    await cue.wait(rest(15, MOVE))
    a.mark('summary')
    a.put({ at: 16, summary: true, lane: LOGS.n, step: stepNamed(LOGS, 'Post Daily Summary') })
    await cue.wait(rest(16, 0))
    await toApps(a, cue, { at: -1 })
  }
}

const result: FilmPart<S> = {
  chip: 'The result',
  start: { ...P4, handover: true, summary: true, view: 'apps', focus: null },
  still: {
    ...P4,
    handover: true,
    summary: true,
    world: 'ink',
    place: 'end',
    karan: true,
    dMood: 'happy',
    lMood: 'happy',
    kMood: 'happy',
    focus: null,
    cta: true
  },
  words: wordsOf(17, 18),
  ms: 9600,
  run: async (a, cue) => {
    a.mark('end')
    a.put({ at: -1, world: 'ink', place: 'end', karan: true, focus: null, lane: 0, step: -1 })
    await cue.wait(1300)
    await say(a, cue, 17, { dMood: 'happy', lMood: 'happy', kMood: 'happy' })
    await say(a, cue, 18, { cta: true })
    await cue.wait(1300)
  }
}

/** The case, drawn small: a chat bubble, riding the lit lane. */
const TOKEN = (
  <svg className='fa-token' viewBox='0 0 26 15'>
    <Ink className='fa-token__pill' pts={rr(1, 1, 24, 14, 7)} seed={111} amp={0.5} passes={1} />
    <Ink className='fa-token__doc' pts={rr(7, 3.5, 12, 6.5, 2.5)} seed={113} amp={0.3} passes={1} />
    <Ink className='fa-token__tape' pts={ln(10, 10, 9, 12.5)} seed={114} amp={0.2} closed={false} passes={1} />
  </svg>
)

const tick = (on: boolean): CheckState => (on ? 'ok' : 'wait')

/** The store's WhatsApp thread: Leo on the right, the agent on the left. */
function ChatCard({ shown }: { shown: number }) {
  return (
    <section className='fc-card fc-call fk-chat' data-target='chat'>
      <div className='fc-call__head'>
        <span className='fc-call__disc fk-wa'>
          <ToolMark tool='whatsapp' size={22} />
        </span>
        <span className='fc-strong fc-call__who'>WhatsApp</span>
        <div className='fc-call__status'>
          <Badge tone={shown > 0 ? 'success' : 'neutral'} dot className='fc-call__badge'>
            <Roll variant='fade'>{shown > 0 ? 'Live' : 'Open'}</Roll>
          </Badge>
        </div>
      </div>
      <div className='fc-call__thread'>
        <div className='fc-call__lines'>
          {CHAT.map((l, i) => (
            <Collapse key={l.text} open={shown > i} reveal={l.who === 'customer' ? 'drop' : 'clip'}>
              {l.who === 'agent' ? (
                <div className='fc-agent' data-target={l.target}>
                  {l.text}
                </div>
              ) : (
                <div className='fc-caller'>
                  <span>{l.text}</span>
                </div>
              )}
            </Collapse>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── The scene ──────────────────────────────────────────────────────────── */

function render(s: S) {
  const spots = SPOTS[s.place]

  const actors: Actor[] = [
    { who: 'dennice', spot: spots.dennice, mood: s.dMood },
    { who: 'leo', spot: spots.leo, mood: s.lMood, out: !s.leo },
    { who: 'karan', spot: spots.karan, mood: s.kMood, out: !s.karan }
  ]

  return (
    <div className='fa fa-four fk' data-view={s.view} data-world={s.world}>
      <div className='fa-world'>
        <div className='fa-fit'>
          <Camera focus={s.focus} max={2.2} pad={20} duration={MOVE}>
            <div className='fa-apps'>
              <div className='fa-plate' />
              <ChatCard shown={s.chat} />
              <RecordCard
                target='order'
                mark={<ToolMark tool='airtable' size={18} />}
                title='Order FH-1042'
                status={s.saved ? 'Saved' : s.looked ? 'Found' : 'Waiting'}
                tone={s.looked ? 'ok' : 'neutral'}
                fields={[
                  { label: 'Email', value: 'leo@example.com', shown: s.looked },
                  { label: 'Item', value: 'Titanium cook pot', shown: s.looked },
                  { label: 'Status', value: 'Delivered', shown: s.looked }
                ]}
                checksTitle='Checked'
                checks={[
                  { label: 'Number and email match', state: tick(s.looked) },
                  { label: 'Policy: damaged items', state: tick(s.policy) },
                  { label: 'Saved in Airtable', state: tick(s.saved) }
                ]}
              />
              <SlackCard
                channel='#support'
                posts={[
                  {
                    who: 'Support agent',
                    text: 'Daily summary: what the agent answered, and what is waiting for the team.',
                    shown: s.summary
                  },
                  {
                    who: 'Support agent',
                    text: 'Upset customer handed to a person, with the full conversation.',
                    shown: s.handover
                  },
                  {
                    who: 'Support agent',
                    text: 'Approval needed: refund on FH-1042, pot arrived dented.',
                    shown: s.asked,
                    buttons: [{ label: 'Review and decide', tone: 'go', pressed: s.approved }],
                    reply: 'Karan: Approve',
                    replied: s.approved,
                    target: 'approved'
                  }
                ]}
              />
              <MailCard
                mark={<ToolMark tool='gmail' size={18} />}
                target='mail'
                title='Customer emails'
                status={s.mailed ? '1 sent' : 'Waiting'}
                mails={[
                  {
                    from: 'To Leo',
                    subject: 'Your refund for order FH-1042 is approved',
                    shown: s.mailed,
                    target: 'refund-mail'
                  }
                ]}
              />
            </div>
            <div className='fa-map'>
              <div className='fa-plate' />
              <LaneMap lanes={LANES} lit={s.lane} step={s.step} token={TOKEN} />
            </div>
          </Camera>
        </div>
      </div>

      <TalkBand
        world={s.world}
        actors={actors}
        lines={LINES}
        at={s.at}
        back={
          <div className='fa-desk' data-on={s.place === 'desk' || undefined}>
            <DeskBack words={DESK} rows={s.pile} still={s.settle} />
          </div>
        }
        front={
          <div className='fa-desk' data-on={s.place === 'desk' || undefined}>
            <DeskFront words={DESK} still={s.settle} />
          </div>
        }
      />

      <Marker
        shape={s.mark === 'under' ? 'under' : 'loop'}
        at={s.markAt}
        on={s.mark !== 'none' && s.world === 'build'}
      />

      <p className='fa-cta' data-on={s.cta || undefined}>
        Run it yourself below
        <ArrowDown size={16} absoluteStrokeWidth strokeWidth={1.75} aria-hidden='true' />
      </p>
    </div>
  )
}

export const CUSTOMER_SUPPORT: FilmDef<S> = {
  title: 'AI Customer Support Agent',
  size: { width: STAGE.w, height: STAGE.h },
  parts: [before, arrives, build, others, result],
  render
}

export function CustomerSupportFilm() {
  return <FilmStage def={CUSTOMER_SUPPORT} />
}
