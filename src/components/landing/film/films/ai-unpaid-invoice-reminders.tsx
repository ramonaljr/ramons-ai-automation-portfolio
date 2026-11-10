'use client'

import { ArrowDown } from 'lucide-react'

import { Camera, type Rect } from '@/components/stageshow/kit'
import { MailCard, RecordCard, SlackCard, type CheckState } from '@/components/landing/film/app-cards'
import type { Mood } from '@/components/landing/film/cast'
import { FilmStage, type FilmDef, type FilmPart } from '@/components/landing/film/film-stage'
import { Ink } from '@/components/landing/film/ink'
import { LaneMap } from '@/components/landing/film/lane-map'
import { laneNamed, lanesOf, stepNamed } from '@/components/landing/film/lanes'
import { Marker } from '@/components/landing/film/marker'
import { rr } from '@/components/landing/film/sketch'
import { LINES } from '@/components/landing/film/films/ai-unpaid-invoice-reminders-lines'
import { DeskBack, DeskFront, type DeskWords } from '@/components/landing/film/films/ink-desk'
import { MOVE, each, scriptFor } from '@/components/landing/film/films/script'
import { BAND_SPOTS, FLOOR, STAGE, TalkBand, type Actor, type Spot } from '@/components/landing/film/talk-band'
import { ToolMark } from '@/components/landing/scenes/tool-mark'

/**
 * Film 4, AI Unpaid Invoice Reminders, in two worlds
 * (docs/plans/2026-11-10-two-worlds-films.md). Dennice runs collections and
 * explains; Isa, a customer, asks what a visitor would ask, and disputes the
 * invoice she's being chased for.
 *
 * Before, in ink: Dennice at a desk of overdue invoices chased by hand, one
 * of them disputed and chased again. Then the paper drops to the band and one
 * invoice drives the tour: found by the 8:00 check, given its context, passed
 * by the policy rules, written up by AI and sent from Gmail. Isa replies that
 * she disputes it; AI reads the reply, and the dispute stops every reminder
 * until a person clears it. The marker lands twice: round the policy checks
 * when the dispute flags them, and under "held until cleared" in Slack. Then
 * a promised date, the 30-day owner alert and the error lane, and the paper
 * rises for the end.
 *
 * Facts come only from src/content/case-studies/ai-unpaid-invoice-reminders.mdx
 * and the map's lanes (docs/process-diagrams/diagrams.json). The customer, the
 * numbers and the dispute's reason are illustration.
 */

const LANES = lanesOf('ai-unpaid-invoice-reminders')
const DAILY = laneNamed(LANES, 'Daily check 8:00')
const WRITE = laneNamed(LANES, 'Write & send')
const REPLIES = laneNamed(LANES, 'Read customer replies')
const ACT = laneNamed(LANES, 'Act on the reply')
const BREAKS = laneNamed(LANES, 'If something breaks')

const { say, rest, toLane, toApps, step, wordsOf } = scriptFor<S>(LINES)

const INVOICE = 'INV-4418'
const CUSTOMER = 'Harbor Logistics'

/** The overdue invoices, chased by hand: one of them disputed, and chased again. */
const DESK: DeskWords = {
  clock: 'Monday · 9:10 AM',
  card: 'To chase by hand',
  sub: 'Overdue',
  rows: [
    { title: `${INVOICE} · ${CUSTOMER}`, note: 'Disputed. Chased again.', at: '$7,250', wrong: true },
    { title: 'INV-4390 · Pinecrest Clinic', note: 'Not chased yet', at: '$3,980' },
    { title: 'INV-4402 · Northgate Hotels', note: 'Chased three times', at: '$12,600' },
    { title: 'INV-4411 · Alder Foods', note: 'Reply unread', at: '$2,140' }
  ],
  label: 'COLLECTIONS',
  folder: 'REPLIES'
}

const FIELDS = [
  { label: 'Invoice', value: INVOICE },
  { label: 'Customer', value: CUSTOMER },
  { label: 'Days late', value: '12' },
  { label: 'Reminder', value: 'Firm, by policy' }
]

const RULES = ['Not disputed', 'No promised date', 'Contact is correct', 'One row per invoice']

const READ = [
  { label: 'Reply type', value: 'Dispute' },
  { label: 'Invoice', value: INVOICE },
  { label: 'Reason', value: 'Hours billed twice' },
  { label: 'Next step', value: 'A person clears it' }
]

type Place = 'desk' | 'band' | 'end'

const SPOTS: Record<Place, { dennice: Spot; isa: Spot }> = {
  desk: { dennice: { x: 250, y: 404, w: 250 }, isa: { x: 790, y: FLOOR - 2, w: 240 } },
  band: { dennice: BAND_SPOTS.left, isa: BAND_SPOTS.right },
  end: { dennice: { x: 320, y: FLOOR - 2, w: 240 }, isa: { x: 650, y: FLOOR - 2, w: 240 } }
}

type S = {
  world: 'ink' | 'build'
  place: Place
  settle: boolean
  dMood: Mood
  iMood: Mood
  isa: boolean
  pile: number

  at: number
  view: 'apps' | 'map'
  focus: Rect | null
  inv: number
  rules: number
  sent: 'none' | 'writing' | 'sent'
  reply: 'none' | 'in' | 'read'
  ai: 'idle' | 'reading' | 'dispute'
  aiRead: number
  stopped: boolean
  held: boolean
  logged: boolean
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
  iMood: 'normal',
  isa: false,
  pile: 0,
  at: -1,
  view: 'apps',
  focus: null,
  inv: 0,
  rules: 0,
  sent: 'none',
  reply: 'none',
  ai: 'idle',
  aiRead: 0,
  stopped: false,
  held: false,
  logged: false,
  lane: 0,
  step: -1,
  mark: 'none',
  markAt: null,
  cta: false
}

const P2: S = { ...BLANK, dMood: 'puzzled', iMood: 'puzzled', isa: true, pile: DESK.rows.length }

const P3: S = { ...P2, world: 'build', place: 'band', dMood: 'normal', iMood: 'normal', inv: 1 }

const P4: S = {
  ...P3,
  inv: FIELDS.length,
  rules: RULES.length,
  sent: 'sent',
  reply: 'read',
  ai: 'dispute',
  aiRead: READ.length,
  stopped: true,
  held: true,
  logged: true
}

/* ── The five parts ─────────────────────────────────────────────────────── */

const before: FilmPart<S> = {
  chip: 'Before',
  start: BLANK,
  still: P2,
  words: ['Overdue invoices are chased by hand, and a disputed one is chased again.', ...wordsOf(0, 1)],
  ms: 9600,
  run: async (a, cue) => {
    await cue.wait(500)
    await each(cue, DESK.rows.length, 380, i => a.put({ pile: i + 1 }))
    await cue.wait(500)
    a.put({ isa: true })
    await cue.wait(1100)
    await say(a, cue, 0, { iMood: 'puzzled' })
    await say(a, cue, 1, { dMood: 'puzzled' })
  }
}

const arrives: FilmPart<S> = {
  chip: 'The overdue invoice',
  start: P2,
  still: P3,
  words: wordsOf(2, 2),
  ms: 4700,
  run: async (a, cue) => {
    a.put({ at: -1 })
    a.mark('settle')
    a.put({ settle: true })
    await cue.wait(300)
    a.put({ world: 'build', place: 'band', dMood: 'normal', iMood: 'normal' })
    await cue.wait(1200)
    a.put({ settle: false })
    a.mark('arrives')
    await say(a, cue, 2, { dMood: 'happy', inv: 1 }, 900)
    a.put({ dMood: 'normal' })
    await cue.wait(rest(2, 900))
  }
}

const build: FilmPart<S> = {
  chip: 'Through the build',
  start: P3,
  still: { ...P4, view: 'apps', focus: null, lane: ACT.n, step: stepNamed(ACT, 'Log Reply') },
  words: wordsOf(3, 15),
  ms: 39800,
  run: async (a, cue) => {
    // The 8:00 check: unpaid invoices from QuickBooks, then their context
    a.mark('daily')
    a.put({ at: 3 })
    await toLane(a, cue, DAILY.n)
    await each(cue, 2, 420, i => a.put({ step: i }))
    await cue.wait(rest(3, MOVE + 420))
    a.put({ at: 4 })
    await each(cue, 2, 420, i => a.put({ step: 2 + i }))
    await toApps(a, cue, { inv: 3 }, 'collect')
    await cue.wait(rest(4, MOVE + 420))

    // The policy rules decide who's reminded, and how firmly
    a.mark('rules')
    await say(a, cue, 5, { iMood: 'puzzled' })
    a.put({ at: 6, iMood: 'normal' })
    await each(cue, RULES.length, 280, i => a.put({ rules: i + 1 }))
    a.put({ inv: FIELDS.length })
    await cue.wait(rest(6, RULES.length * 280))

    // AI writes the words; Gmail sends it, and the contact is saved
    a.mark('write')
    a.put({ at: 7 })
    await toLane(a, cue, WRITE.n)
    await step(a, cue, stepNamed(WRITE, 'AI Writes Reminder'), 400)
    await toApps(a, cue, { sent: 'writing' }, 'mail')
    await cue.wait(rest(7, MOVE * 2 + 400))
    a.mark('sent')
    a.put({ at: 8, sent: 'sent' })
    await cue.wait(900)
    await toLane(a, cue, WRITE.n, { step: stepNamed(WRITE, 'Gmail – Send Reminder') })
    await step(a, cue, stepNamed(WRITE, 'Save Contact Made'), rest(8, MOVE + 900))

    // Isa replies that she disputes it, and AI reads the reply
    a.mark('reply')
    await say(a, cue, 9, { iMood: 'puzzled' })
    a.put({ at: 10, iMood: 'normal' })
    await toLane(a, cue, REPLIES.n)
    await each(cue, 3, 320, i => a.put({ step: i }))
    await toApps(a, cue, { reply: 'in', ai: 'reading' }, undefined)
    await each(cue, READ.length, 240, i => a.put({ aiRead: i + 1 }))
    a.put({ ai: 'dispute', reply: 'read' })
    await cue.wait(rest(10, MOVE * 2 + 640 + 720))

    // The dispute stops every reminder: the policy check flags it
    a.mark('stop')
    a.put({ at: 11, dMood: 'happy' })
    await toLane(a, cue, ACT.n, { step: stepNamed(ACT, 'STOP – Dispute') })
    await toApps(a, cue, { stopped: true }, 'collect')
    a.put({ mark: 'loop', markAt: a.rect('collect-checks') })
    await cue.wait(rest(11, MOVE * 2))

    // No timer: it's held until a person clears it
    a.mark('held')
    a.put({ at: 12, mark: 'none', dMood: 'normal', iMood: 'puzzled' })
    await toApps(a, cue, {}, 'slack')
    await cue.wait(rest(12, MOVE))
    a.put({ at: 13, iMood: 'normal', held: true })
    await cue.wait(400)
    a.put({ mark: 'under', markAt: a.rect('held') })
    await cue.wait(rest(13, 400))

    // A Pipedrive task and a Slack alert; the emails saved, the reply logged
    a.mark('task')
    a.put({ at: 14, mark: 'none' })
    await toLane(a, cue, ACT.n)
    await each(cue, 2, 450, i => a.put({ step: stepNamed(ACT, 'Dispute Activity') + i }))
    await cue.wait(rest(14, MOVE + 450))
    a.put({ at: 15, step: stepNamed(ACT, 'Save Dispute Emails') })
    await cue.wait(600)
    a.put({ step: stepNamed(ACT, 'Log Reply'), logged: true })
    await cue.wait(rest(15, 600))
    await toApps(a, cue, { at: -1 })
  }
}

const others: FilmPart<S> = {
  chip: 'Other paths',
  start: { ...P4, view: 'apps', focus: null },
  still: { ...P4, view: 'map', lane: BREAKS.n, step: BREAKS.steps.length - 1 },
  words: wordsOf(16, 19),
  ms: 11500,
  run: async (a, cue) => {
    a.mark('promise')
    a.put({ at: 16, iMood: 'puzzled' })
    await toLane(a, cue, ACT.n, { step: stepNamed(ACT, 'Save Promised Date') })
    await cue.wait(rest(16, MOVE))
    await say(a, cue, 17, { iMood: 'normal' })
    a.mark('owner')
    a.put({ at: 18 })
    await toLane(a, cue, WRITE.n)
    await each(cue, 2, 400, i => a.put({ step: i }))
    await cue.wait(rest(18, MOVE + 400))
    a.mark('breaks')
    a.put({ at: 19 })
    await toLane(a, cue, BREAKS.n)
    await each(cue, BREAKS.steps.length, 280, i => a.put({ step: i }))
    await cue.wait(rest(19, MOVE + (BREAKS.steps.length - 1) * 280))
  }
}

const result: FilmPart<S> = {
  chip: 'The result',
  start: { ...P4, view: 'map', lane: BREAKS.n, step: BREAKS.steps.length - 1 },
  still: { ...P4, world: 'ink', place: 'end', dMood: 'happy', iMood: 'happy', focus: null, cta: true },
  words: wordsOf(20, 21),
  ms: 8700,
  run: async (a, cue) => {
    a.mark('end')
    a.put({ at: -1, world: 'ink', place: 'end', focus: null, lane: 0, step: -1 })
    await cue.wait(1300)
    await say(a, cue, 20, { dMood: 'happy', iMood: 'happy' })
    await say(a, cue, 21, { cta: true })
    await cue.wait(1300)
  }
}

/** The case, drawn small: the invoice, riding the lit lane. */
const TOKEN = (
  <svg className='fa-token' viewBox='0 0 26 15'>
    <Ink className='fa-token__pill' pts={rr(1, 1, 24, 14, 7)} seed={81} amp={0.5} passes={1} />
    <Ink className='fa-token__doc' pts={rr(9.5, 3, 7, 9, 1)} seed={83} amp={0.3} passes={1} />
  </svg>
)

const tick = (n: number, i: number): CheckState => (n > i ? 'ok' : 'wait')

/* ── The scene ──────────────────────────────────────────────────────────── */

function render(s: S) {
  const spots = SPOTS[s.place]

  const actors: Actor[] = [
    { who: 'dennice', spot: spots.dennice, mood: s.dMood },
    { who: 'isa', spot: spots.isa, mood: s.iMood, out: !s.isa }
  ]

  const invoice = s.stopped
    ? { status: 'Stopped', tone: 'warn' as const }
    : s.sent === 'sent'
      ? { status: 'Reminded', tone: 'ok' as const }
      : s.rules >= RULES.length
        ? { status: 'Remind', tone: 'ok' as const }
        : { status: s.inv ? 'Checking' : 'Waiting', tone: 'neutral' as const }

  const mail =
    s.reply === 'read' ? 'Reply read' : s.reply === 'in' ? '1 reply' : s.sent === 'sent' ? 'Sent' : s.sent === 'writing' ? 'AI writing' : 'Waiting'

  const ai = {
    idle: { status: 'Waiting', tone: 'neutral' },
    reading: { status: 'Reading', tone: 'neutral' },
    dispute: { status: 'Dispute', tone: 'warn' }
  } as const

  return (
    <div className='fa fa-four fu' data-view={s.view} data-world={s.world}>
      <div className='fa-world'>
        <div className='fa-fit'>
          <Camera focus={s.focus} max={2.2} pad={20} duration={MOVE}>
            <div className='fa-apps'>
              <div className='fa-plate' />
              <RecordCard
                target='collect'
                mark={<ToolMark tool='quickbooks' size={18} />}
                title='Overdue invoice'
                status={invoice.status}
                tone={invoice.tone}
                fields={FIELDS.map((f, i) => ({ ...f, shown: s.inv > i }))}
                checksTitle='Policy rules'
                checks={RULES.map((label, i) => ({
                  label,
                  state: i === 0 && s.stopped ? 'flag' : tick(s.rules, i)
                }))}
              />
              <MailCard
                mark={<ToolMark tool='gmail' size={18} />}
                title='Collections mail'
                status={mail}
                mails={[
                  {
                    from: `Isa · ${CUSTOMER}`,
                    subject: `Re: ${INVOICE} · I dispute this invoice`,
                    shown: s.reply !== 'none',
                    read: s.reply === 'read'
                  },
                  {
                    from: `To Isa · ${CUSTOMER}`,
                    subject: `${INVOICE} is 12 days overdue`,
                    shown: s.sent === 'sent',
                    read: true
                  }
                ]}
              />
              <RecordCard
                target='reply'
                mark={<ToolMark tool='openai' size={18} />}
                title='Reply read by AI'
                status={ai[s.ai].status}
                tone={ai[s.ai].tone}
                fields={READ.map((f, i) => ({ ...f, shown: s.aiRead > i }))}
              />
              <SlackCard
                channel='#collections'
                posts={[
                  {
                    who: 'Collections',
                    text: `${INVOICE} disputed by ${CUSTOMER}. All reminders stopped.`,
                    shown: s.stopped,
                    buttons: [{ label: 'Clear dispute' }],
                    reply: 'No timer. Held until a person clears it.',
                    replied: s.held,
                    target: 'held'
                  },
                  {
                    who: 'Collections',
                    text: 'Pipedrive task added. Dispute emails saved, reply logged.',
                    shown: s.logged
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

      <Marker shape={s.mark === 'under' ? 'under' : 'loop'} at={s.markAt} on={s.mark !== 'none' && s.world === 'build'} />

      <p className='fa-cta' data-on={s.cta || undefined}>
        Run it yourself below
        <ArrowDown size={16} absoluteStrokeWidth strokeWidth={1.75} aria-hidden='true' />
      </p>
    </div>
  )
}

export const UNPAID_REMINDERS: FilmDef<S> = {
  title: 'AI Unpaid Invoice Reminders',
  size: { width: STAGE.w, height: STAGE.h },
  parts: [before, arrives, build, others, result],
  render
}

export function UnpaidRemindersFilm() {
  return <FilmStage def={UNPAID_REMINDERS} />
}
