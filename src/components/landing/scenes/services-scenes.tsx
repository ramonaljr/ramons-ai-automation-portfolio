'use client'

import type { ComponentType } from 'react'

import { Badge, Bar, BrandMark, Button, Check, Chip, Count, Icon, Window } from '@/components/stageshow/kit'
import { CARD, SceneStage, type SceneDef, type SceneProps } from '@/components/landing/scenes/scene'
import { ToolMark, type Tool } from '@/components/landing/scenes/tool-mark'

/**
 * The scene beside each service: the work that service does, playing out.
 * A day's run log, an onboarding approval, an answer with its sources, a
 * nightly sync and an after-hours call. Each marks, in the accent, the one
 * place a person comes in. They illustrate the kind of work; none is a
 * record of a client's system.
 */

const filler = (rows: number[][]) => (
  <div className='ps-filler'>
    {rows.map(([left, right], i) => (
      <div key={i}>
        <Bar w={left} h={5} tone={2} />
        <Bar w={right} h={5} tone={2} />
      </div>
    ))}
  </div>
)

/* ---------- Routine work: a day's run log ---------- */

type RoutineState = { done: number; running: number; out: boolean }

const RUNS: { time: string; text: string; person?: boolean }[] = [
  { time: '07:00', text: 'Sales sheet updated from 14 orders' },
  { time: '08:30', text: 'Weekly report sent to managers' },
  { time: '09:15', text: '3 invoices keyed into QuickBooks' },
  { time: '11:40', text: 'Follow-ups sent on 6 open quotes' },
  { time: '13:05', text: '1 order missing a price', person: true }
]

const ROUTINE_START: RoutineState = { done: 0, running: -1, out: false }

const routine: SceneDef<RoutineState> = {
  size: CARD,
  start: ROUTINE_START,
  poster: { done: RUNS.length, running: -1, out: false },

  play: async a => {
    a.mark('open')
    await a.wait(500)

    for (let i = 0; i < RUNS.length; i++) {
      a.put({ running: i })
      await a.wait(420)
      a.put({ done: i + 1, running: -1 })
      await a.wait(160)
    }

    a.mark('done')
  },

  exit: async a => {
    a.mark('exit')
    await a.set({ out: true })
    await a.wait(320)
    await a.snap({ ...ROUTINE_START, out: true })
    await a.wait(350)
    await a.set({ out: false })
    await a.wait(300)
  },

  render: s => (
    <Window title='Run log' className='ps-hero'>
      <div className='ps-body psv' data-out={s.out || undefined}>
        <div className='psv-head'>
          <span className='ps-strong'>Today</span>
          <span className='psv-count'>
            <Count value={s.done} duration={300} />
            <span className='ps-muted'>runs</span>
          </span>
        </div>
        <div className='psv-trail'>
          {RUNS.map((run, i) => (
            <div
              key={run.time}
              className='psv-row ps-in'
              data-in={i <= Math.max(s.done - 1, s.running) || undefined}
              data-person={run.person || undefined}
            >
              <time className='ps-faint'>{run.time}</time>
              <span>{run.text}</span>
              {run.person ? (
                <span className='psv-status' data-on={i < s.done || undefined}>
                  <Check size={14} on={false} pending={s.running === i} />
                  <Badge tone='accent' dot>
                    To review
                  </Badge>
                </span>
              ) : (
                <Check size={14} on={i < s.done} pending={s.running === i} />
              )}
            </div>
          ))}
        </div>
        {filler([
          [140, 40],
          [96, 52]
        ])}
      </div>
    </Window>
  )
}

/* ---------- Process automation: an onboarding approval ---------- */

type ApprovalState = { shown: number; approved: boolean; out: boolean }

const STEPS: { time: string; text: string; ask?: boolean }[] = [
  { time: '09:02', text: 'Onboarding form received' },
  { time: '09:02', text: 'Details and start date checked' },
  { time: '09:40', text: 'Manager approves in Slack', ask: true },
  { time: '09:41', text: 'Accounts and Drive folder created' },
  { time: '09:41', text: 'Team told, first week booked' }
]

const ASK = 2

const APPROVAL_START: ApprovalState = { shown: 0, approved: false, out: false }

const approval: SceneDef<ApprovalState> = {
  size: CARD,
  start: APPROVAL_START,
  poster: { shown: STEPS.length, approved: true, out: false },
  cursor: { at: 'rest', style: 'arrow', ripple: true },

  play: async a => {
    a.mark('open')
    await a.wait(500)

    for (let i = 1; i <= ASK + 1; i++) {
      a.put({ shown: i })
      await a.wait(420)
    }

    // The one step a person takes
    a.mark('approve')
    await a.wait(400)
    await a.click({ at: 'approve', x: 0.5, y: 0.55 })
    a.put({ approved: true })
    await a.wait(600)

    for (let i = ASK + 2; i <= STEPS.length; i++) {
      a.put({ shown: i })
      await a.wait(420)
    }

    await a.move('rest')
    a.mark('done')
  },

  exit: async a => {
    a.mark('exit')
    await a.set({ out: true })
    await a.wait(320)
    await a.snap({ ...APPROVAL_START, out: true })
    await a.set({ out: false })
    await a.wait(300)
  },

  render: s => (
    <>
      <Window title='Approval trail' className='ps-hero'>
        <div className='ps-body psv' data-out={s.out || undefined}>
          <div className='psv-head'>
            <span className='ps-strong'>New hire onboarding</span>
            <span className='ps-faint'>Starts Monday</span>
          </div>
          <div className='psv-trail'>
            {STEPS.map((step, i) => (
              <div
                key={step.text}
                className='psv-row ps-in'
                data-in={i < s.shown || undefined}
                data-person={step.ask || undefined}
              >
                <time className='ps-faint'>{step.time}</time>
                <span className='psv-text'>
                  {step.ask && <BrandMark brand='slack' size={14} tile={false} />}
                  {step.text}
                </span>
                {step.ask ? (
                  <Button
                    variant='primary'
                    size='small'
                    className='psv-approve'
                    data-target='approve'
                    icon={s.approved ? <Icon name='check' size={12} stroke={2} /> : undefined}
                  >
                    {s.approved ? 'Approved' : 'Approve'}
                  </Button>
                ) : (
                  <Check size={14} on={i < s.shown && (i < ASK || s.approved)} />
                )}
              </div>
            ))}
          </div>
          {filler([
            [140, 40],
            [96, 52]
          ])}
        </div>
      </Window>
      <span className='ps-rest psv-rest' data-target='rest' />
    </>
  )
}

/* ---------- AI on your documents: an answer with its sources ---------- */

type AnswerState = { question: string; asking: boolean; answer: string; sources: number; out: boolean }

const QUESTION = 'How many days of leave carry over?'

const ANSWER =
  'Up to five days carry over. Anything above that lapses on 31 March unless a manager approves an exception.'

const SOURCES = ['Leave policy 2025 · p. 4', 'Employee handbook · 7.2']

const ANSWER_START: AnswerState = { question: '', asking: false, answer: '', sources: 0, out: false }

const answer: SceneDef<AnswerState> = {
  size: CARD,
  start: ANSWER_START,
  poster: { question: QUESTION, asking: false, answer: ANSWER, sources: SOURCES.length, out: false },
  hold: 2800,

  play: async a => {
    a.mark('open')
    await a.wait(500)
    a.put({ asking: true })
    await a.type('question', QUESTION, { interval: 36 })
    a.put({ asking: false })
    await a.wait(500)
    a.mark('answer')
    await a.type('answer', ANSWER, { interval: 12 })
    await a.wait(300)

    for (let i = 1; i <= SOURCES.length; i++) {
      a.put({ sources: i })
      await a.wait(220)
    }

    a.mark('done')
  },

  exit: async a => {
    a.mark('exit')
    await a.set({ out: true })
    await a.wait(320)
    await a.snap({ ...ANSWER_START, out: true })
    await a.set({ out: false })
    await a.wait(300)
  },

  render: s => (
    <Window title='Ask the handbook' className='ps-hero'>
      <div className='ps-body psv psv-ask' data-out={s.out || undefined}>
        <div className='psv-question'>
          <span className='psv-question__text'>{s.question}</span>
          <span className='ps01-caret' data-on={s.asking || undefined} />
        </div>
        <p className='psv-answer'>{s.answer}</p>
        <div className='psv-sources'>
          {SOURCES.map((source, i) => (
            <span key={source} className='psv-source ps-in' data-in={i < s.sources || undefined}>
              <Icon name='file' size={12} />
              {source}
            </span>
          ))}
        </div>
        <span className='psv-note ps-faint ps-in' data-in={s.sources === SOURCES.length || undefined}>
          Every answer links to its source. Unsure goes to a person.
        </span>
        {filler([
          [150, 40],
          [110, 52],
          [130, 36]
        ])}
      </div>
    </Window>
  )
}

/* ---------- Integrations: a nightly sync ---------- */

type SyncState = { tools: number; checked: number; updated: number; conflict: boolean; out: boolean }

const SYNCED: { tool: Tool; name: string }[] = [
  { tool: 'googlesheets', name: 'Sheets' },
  { tool: 'airtable', name: 'Airtable' },
  { tool: 'hubspot', name: 'HubSpot' },
  { tool: 'slack', name: 'Slack' }
]

const SYNC_START: SyncState = { tools: 0, checked: 0, updated: 0, conflict: false, out: false }

const sync: SceneDef<SyncState> = {
  size: CARD,
  start: SYNC_START,
  poster: { tools: SYNCED.length, checked: 412, updated: 18, conflict: true, out: false },

  play: async a => {
    a.mark('open')
    await a.wait(500)

    for (let i = 1; i <= SYNCED.length; i++) {
      a.put({ tools: i })
      await a.wait(260)
    }

    await a.wait(300)
    a.put({ checked: 412 })
    await a.wait(900)
    a.put({ updated: 18 })
    await a.wait(900)
    a.mark('conflict')
    a.put({ conflict: true })
    a.mark('done')
  },

  exit: async a => {
    a.mark('exit')
    await a.set({ out: true })
    await a.wait(320)
    await a.snap({ ...SYNC_START, out: true })
    await a.wait(350)
    await a.set({ out: false })
    await a.wait(300)
  },

  render: s => (
    <Window title='Nightly sync · 02:00' className='ps-hero'>
      <div className='ps-body psv' data-out={s.out || undefined}>
        <div className='psv-chain'>
          {SYNCED.map((item, i) => (
            <div key={item.tool} className='psv-link ps-in' data-in={i < s.tools || undefined}>
              {i > 0 && <i className='psv-line' />}
              <span className='ps-tile'>
                <ToolMark tool={item.tool} />
              </span>
              <span className='ps-muted'>{item.name}</span>
            </div>
          ))}
        </div>
        <div className='psv-stats'>
          <div className='psv-stat'>
            <span className='ps-label'>Checked</span>
            <span className='psv-stat__value'>
              <Count value={s.checked} duration={700} />
              <span className='ps-muted'>customer records</span>
            </span>
          </div>
          <div className='psv-stat'>
            <span className='ps-label'>Updated</span>
            <span className='psv-stat__value'>
              <Count value={s.updated} duration={600} />
              <span className='ps-muted'>changed details, in every tool</span>
            </span>
          </div>
          <div className='psv-stat'>
            <span className='ps-label'>Conflict</span>
            <span className='psv-stat__value ps-in' data-in={s.conflict || undefined}>
              <Badge tone='accent' dot>
                Sent for review
              </Badge>
              <span className='ps-muted'>1 record edited in two places</span>
            </span>
          </div>
        </div>
      </div>
    </Window>
  )
}

/* ---------- Voice agents: an after-hours call ---------- */

type CallState = { fields: number; people: number; out: boolean }

const CALL_START: CallState = { fields: 0, people: 0, out: false }
const COLLECTED = ['Name', 'Phone', 'Reason']

const call: SceneDef<CallState> = {
  size: CARD,
  start: CALL_START,
  poster: { fields: 4, people: COLLECTED.length, out: false },

  play: async a => {
    a.mark('open')
    await a.wait(600)
    a.put({ fields: 1 })
    await a.wait(700)
    a.put({ fields: 2 })
    await a.wait(250)

    for (let i = 1; i <= COLLECTED.length; i++) {
      a.put({ people: i })
      await a.wait(200)
    }

    await a.wait(400)
    a.put({ fields: 3 })
    await a.wait(800)
    a.mark('person')
    a.put({ fields: 4 })
    a.mark('done')
  },

  exit: async a => {
    a.mark('exit')
    await a.set({ out: true })
    await a.wait(320)
    await a.snap({ ...CALL_START, out: true })
    await a.set({ out: false })
    await a.wait(300)
  },

  render: s => (
    <Window title='Call summary' className='ps-hero'>
      <div className='ps-body psv' data-out={s.out || undefined}>
        <div className='psv-head'>
          <span className='psv-live'>
            <i />
            <span className='ps-strong'>Answered at 21:47</span>
          </span>
          <span className='ps-faint'>2 min 10 s · new customer</span>
        </div>
        <dl className='psv-fields'>
          <div className='ps-in' data-in={s.fields >= 1 || undefined}>
            <dt className='ps-label'>Asked</dt>
            <dd>&ldquo;Can I get an appointment this week?&rdquo;</dd>
          </div>
          <div className='ps-in' data-in={s.fields >= 2 || undefined}>
            <dt className='ps-label'>Collected</dt>
            <dd className='psv-chips'>
              {COLLECTED.map((item, i) => (
                <Chip key={item} show={i < s.people} gap={6}>
                  {item}
                </Chip>
              ))}
            </dd>
          </div>
          <div className='ps-in' data-in={s.fields >= 3 || undefined}>
            <dt className='ps-label'>Booked</dt>
            <dd className='psv-booked'>
              <Check on size={14} />
              Thursday 10:00, confirmed by text
            </dd>
          </div>
          <div className='ps-in' data-in={s.fields >= 4 || undefined}>
            <dt className='ps-label'>For a person</dt>
            <dd className='psv-booked'>
              <Badge tone='accent' dot>
                Front desk
              </Badge>
              A price question
            </dd>
          </div>
        </dl>
        {filler([
          [150, 40],
          [110, 52]
        ])}
      </div>
    </Window>
  )
}

function Routine(props: SceneProps) {
  return <SceneStage def={routine} {...props} />
}

function Approval(props: SceneProps) {
  return <SceneStage def={approval} {...props} />
}

function Answer(props: SceneProps) {
  return <SceneStage def={answer} {...props} />
}

function Sync(props: SceneProps) {
  return <SceneStage def={sync} {...props} />
}

function Call(props: SceneProps) {
  return <SceneStage def={call} {...props} />
}

/** By service slug, in the catalogue's order (lib/portfolio SERVICES). */
export const SERVICE_SCENES: Record<string, ComponentType<SceneProps>> = {
  'n8n-ai-agents': Routine,
  'business-process-automation': Approval,
  'llm-rag-integrations': Answer,
  'saas-api-integrations': Sync,
  'ai-voice-agents': Call
}
