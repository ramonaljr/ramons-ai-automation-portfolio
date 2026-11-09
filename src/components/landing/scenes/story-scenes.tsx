'use client'

import './story.css'

import type { ComponentType, CSSProperties } from 'react'

import { Badge, Check, Icon, Roll, Window, type Act } from '@/components/stageshow/kit'
import {
  SceneStage,
  type SceneDef,
  type SceneProps,
  type SceneSize,
  type Steps
} from '@/components/landing/scenes/scene'
import { ToolMark, type Tool } from '@/components/landing/scenes/tool-mark'

/**
 * The Story section's three acts, one scene each: the inbox at 9:14 PM with
 * the work still arriving, the workflow taking it through, and the same
 * inbox clear at five. The names, amounts and times are illustration, the
 * same ones the act copy uses; none of it is a client record.
 *
 * Each scene is a list of steps (`steps`). On desktop the scroll walks them
 * (scene.tsx, scroll mode), so a scene is never still unfolding when its act
 * leaves; on phones each plays them through once as its panel arrives.
 */

/** The story board's 64 : 50, with the shared narrow design for phones. */
export const STORY: SceneSize = { width: 640, height: 500, compact: { below: 400, width: 360, height: 440 } }

type Tone = 'neutral' | 'success' | 'danger' | 'warning'

type Work = {
  mark: Tool | 'file' | 'user'
  title: string
  wait: { meta: string; tone: Tone; label: string }
  done: { meta: string; label: string }
}

/** Newest first, the way an inbox lists it. The same five in all three scenes, and all five fit. */
const WORK: Work[] = [
  {
    mark: 'gmail',
    title: 'Re: Invoice #2041 overdue',
    wait: { meta: 'Brightline Concrete · 9:11 PM', tone: 'neutral', label: 'Unread' },
    done: { meta: 'Answered with the invoice attached', label: 'Replied' }
  },
  {
    mark: 'file',
    title: 'INV-2041 · $4,820.00',
    wait: { meta: 'Needs keying in', tone: 'warning', label: 'To key in' },
    done: { meta: 'Matched to PO 7731', label: 'Posted' }
  },
  {
    mark: 'user',
    title: 'New lead: solar quote',
    wait: { meta: 'Waiting 3 hrs for a call', tone: 'danger', label: 'No reply' },
    done: { meta: 'Sales told in Slack', label: 'Called back' }
  },
  {
    mark: 'gmail',
    title: 'Month-end report?',
    wait: { meta: 'Operations · 8:52 PM', tone: 'neutral', label: 'Unread' },
    done: { meta: 'Report sent at 4:52 PM', label: 'Sent' }
  },
  {
    mark: 'file',
    title: 'INV-2042 · $1,265.40',
    wait: { meta: 'PO not matched yet', tone: 'warning', label: 'To key in' },
    done: { meta: 'Checked by a person first', label: 'Posted' }
  }
]

/** The backlog the act copy names, at its worst. */
const TOTALS = [
  { value: 47, label: 'unread emails', short: 'emails unread' },
  { value: 23, label: 'invoices to key in', short: 'invoices waiting' },
  { value: 6, label: 'leads waiting', short: 'leads waiting' }
]

const share = (total: number, part: number) => Math.round((total * part) / WORK.length)

const Mark = ({ mark }: { mark: Work['mark'] }) => (
  <span className='ps-tile'>
    {mark === 'file' || mark === 'user' ? <Icon name={mark} size={14} /> : <ToolMark tool={mark} />}
  </span>
)

const Clock = ({ time }: { time: string }) => (
  <span className='pst-clock'>
    <Icon name='clock' size={12} />
    {time}
  </span>
)

/** The three backlog figures; `part` of five is how much of each is showing. */
const Totals = ({ part, gone }: { part: number; gone?: boolean }) => (
  <div className='pst-totals' data-gone={gone || undefined}>
    {TOTALS.map(total => (
      <span key={total.label} className='pst-total'>
        {/* Rolls straight from one real figure to the next: the old number
            leaves as the new one arrives, so the box is never empty (a
            crossfade blanked it between steps; a count showed every number
            in between) */}
        <span className='pst-total__value'>
          <Roll>{String(share(total.value, part))}</Roll>
        </span>
        <span className='ps-faint pst-total__label'>{total.label}</span>
        <span className='ps-faint pst-total__short'>{total.short}</span>
      </span>
    ))}
  </div>
)

/* ---------- The problem: 9:14 PM, and it keeps arriving ---------- */

type ProblemState = { shown: number; out: boolean }

const PROBLEM_START: ProblemState = { shown: 0, out: false }

/** The oldest first, each new one landing on top and pushing the rest down. */
const PROBLEM_STEPS: Steps<ProblemState> = {
  count: WORK.length,
  at: n => ({ shown: n, out: false }),
  take: async (a, n, quick) => {
    a.put({ shown: n })
    await a.wait(quick ? 150 : 380)
  }
}

/** Every step from the start, as one take: the phone panels' play. */
const playSteps =
  <S extends object>(steps: Steps<S>) =>
  async (a: Act<S>) => {
    a.mark('open')
    await a.wait(300)

    for (let n = 1; n <= steps.count; n++) await steps.take(a, n, false)

    a.mark('done')
  }

const problem: SceneDef<ProblemState> = {
  size: STORY,
  start: PROBLEM_START,
  poster: PROBLEM_STEPS.at(PROBLEM_STEPS.count),
  hold: 2600,
  steps: PROBLEM_STEPS,
  play: playSteps(PROBLEM_STEPS),

  exit: async a => {
    a.mark('exit')
    await a.set({ out: true })
    await a.wait(320)
    await a.snap({ ...PROBLEM_START, out: true })
    await a.set({ out: false })
    await a.wait(300)
  },

  render: s => {
    // WORK is newest first, so the last `shown` items have arrived
    const first = WORK.length - s.shown

    return (
      <Window title='Inbox' className='ps-hero'>
        <div className='ps-body pst' data-out={s.out || undefined}>
          <div className='pst-head'>
            <span className='ps-strong'>Still waiting</span>
            <Clock time='9:14 PM' />
          </div>
          <Totals part={s.shown} />
          <div className='pst-list' style={{ height: `calc(var(--row) * ${WORK.length})` }}>
            {WORK.map((work, i) => (
              <div
                key={work.title}
                className='pst-row'
                data-in={i >= first || undefined}
                style={{ '--at': Math.max(0, i - first) } as CSSProperties}
              >
                <Mark mark={work.mark} />
                <span className='pst-row__text'>
                  <span className='ps-strong'>{work.title}</span>
                  <span className='ps-faint'>{work.wait.meta}</span>
                </span>
                <Badge tone={work.wait.tone} dot className='pst-status'>
                  {work.wait.label}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Window>
    )
  }
}

/* ---------- The system: the workflow takes it through ---------- */

/** The workflow's four steps. */
const NODES: { tool: Tool; label: string }[] = [
  { tool: 'gmail', label: 'Read' },
  { tool: 'claude', label: 'Decide' },
  { tool: 'quickbooks', label: 'Post' },
  { tool: 'slack', label: 'Tell' }
]

type Run = { title: string; result: string; to?: Tool; stops: number[] }

/** Tonight's run, item by item; the unmatched invoice stops at the decision. */
const RUN: Run[] = [
  { title: 'Re: Invoice #2041 overdue', result: 'Replied with the invoice attached', to: 'gmail', stops: [0, 1] },
  { title: 'INV-2041 · $4,820.00', result: 'Matched to PO 7731, posted', to: 'quickbooks', stops: [0, 1, 2] },
  { title: 'New lead: solar quote', result: 'Sales told to call back', to: 'slack', stops: [0, 1, 3] },
  { title: 'INV-2042 · $1,265.40', result: 'PO not matched, sent to a person', stops: [0, 1] },
  { title: 'Month-end report?', result: 'Report drafted and sent', to: 'gmail', stops: [0, 1, 3] }
]

const EXCEPTION = RUN.findIndex(run => !run.to)

type SystemState = { item: number; node: number; done: number; out: boolean }

const SYSTEM_START: SystemState = { item: -1, node: -1, done: 0, out: false }

/** One item a step: it lights each workflow step it passes through, then lands. */
const SYSTEM_STEPS: Steps<SystemState> = {
  count: RUN.length,
  at: n => ({ item: -1, node: -1, done: n, out: false }),
  take: async (a, n, quick) => {
    const i = n - 1

    a.put({ item: i })

    for (const node of RUN[i]!.stops) {
      a.put({ node })
      await a.wait(quick ? 70 : 170)
    }

    // The unusual case holds a beat longer, then goes to a person
    if (i === EXCEPTION) {
      a.mark('exception')
      await a.wait(quick ? 160 : 350)
    }

    a.put({ item: -1, node: -1, done: n })
    await a.wait(quick ? 60 : 220)
  }
}

const system: SceneDef<SystemState> = {
  size: STORY,
  start: SYSTEM_START,
  poster: SYSTEM_STEPS.at(SYSTEM_STEPS.count),
  hold: 2600,
  steps: SYSTEM_STEPS,
  play: playSteps(SYSTEM_STEPS),

  exit: async a => {
    a.mark('exit')
    await a.set({ out: true })
    await a.wait(320)
    await a.snap({ ...SYSTEM_START, out: true })
    await a.set({ out: false })
    await a.wait(300)
  },

  render: s => (
    <Window title='Inbox workflow · n8n' className='ps-hero'>
      <div className='ps-body pst' data-out={s.out || undefined}>
        <div className='pst-head'>
          <span className='ps-strong'>Tonight’s run</span>
          <Badge tone='success' dot>
            Running
          </Badge>
        </div>
        <div className='pst-flow'>
          {NODES.map((node, i) => (
            <div key={node.tool} className='pst-node' data-on={s.node === i || undefined}>
              {i > 0 && <span className='pst-node__line' data-on={s.node >= i || undefined} />}
              <span className='ps-tile'>
                <ToolMark tool={node.tool} size={18} />
              </span>
              <span className='ps-faint'>{node.label}</span>
            </div>
          ))}
        </div>
        <div className='pst-run'>
          {RUN.map((run, i) => {
            const done = i < s.done
            const exception = i === EXCEPTION

            return (
              <div key={run.title} className='pst-run__row' data-on={done || undefined}>
                <Check size={16} on={done} pending={s.item === i} />
                <span className='pst-row__text'>
                  <span className='ps-strong'>{run.title}</span>
                  <span className='ps-faint'>
                    <Roll variant='fade'>{done ? run.result : s.item === i ? 'Working…' : 'Waiting'}</Roll>
                  </span>
                </span>
                <span className='pst-run__to ps-in' data-in={done || undefined}>
                  {exception ? (
                    <Badge tone='warning' dot>
                      To a person
                    </Badge>
                  ) : (
                    run.to && <ToolMark tool={run.to} size={14} />
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Window>
  )
}

/* ---------- The outcome: the same inbox, clear at five ---------- */

type OutcomeState = { cleared: number; clear: boolean; out: boolean }

const OUTCOME_START: OutcomeState = { cleared: 0, clear: false, out: false }

/** One item cleared a step, then the last step swaps the zeroed totals for "All caught up". */
const OUTCOME_STEPS: Steps<OutcomeState> = {
  count: WORK.length + 1,
  at: n => ({ cleared: Math.min(n, WORK.length), clear: n > WORK.length, out: false }),
  take: async (a, n, quick) => {
    if (n > WORK.length) {
      a.mark('clear')
      a.put({ clear: true })
    } else {
      a.put({ cleared: n })
    }

    await a.wait(quick ? 110 : 300)
  }
}

const outcome: SceneDef<OutcomeState> = {
  size: STORY,
  start: OUTCOME_START,
  poster: OUTCOME_STEPS.at(OUTCOME_STEPS.count),
  hold: 2600,
  steps: OUTCOME_STEPS,
  play: playSteps(OUTCOME_STEPS),

  exit: async a => {
    a.mark('exit')
    await a.set({ out: true })
    await a.wait(320)
    await a.snap({ ...OUTCOME_START, out: true })
    await a.set({ out: false })
    await a.wait(300)
  },

  render: s => (
    <Window title='Inbox' className='ps-hero'>
      <div className='ps-body pst' data-out={s.out || undefined}>
        <div className='pst-head'>
          <span className='ps-strong'>Today</span>
          <Clock time='5:00 PM' />
        </div>
        {/* The banner takes the totals' place once they reach zero, so the
            list sits where the problem's did and every row stays in view */}
        <div className='pst-slot'>
          <Totals part={WORK.length - s.cleared} gone={s.clear} />
          <div className='pst-clear ps-in' data-in={s.clear || undefined}>
            <span className='pst-clear__check'>
              <Icon name='check' size={14} stroke={2} />
            </span>
            <span className='pst-row__text'>
              <span className='ps-strong'>All caught up</span>
              <span className='ps-faint'>One checked by a person first</span>
            </span>
          </div>
        </div>
        <div className='pst-list'>
          {WORK.map((work, i) => {
            const done = i < s.cleared

            return (
              <div key={work.title} className='pst-row' data-in='' data-done={done || undefined}>
                <Mark mark={work.mark} />
                <span className='pst-row__text'>
                  <span className='ps-strong'>{work.title}</span>
                  <span className='ps-faint'>
                    <Roll variant='fade'>{done ? work.done.meta : work.wait.meta}</Roll>
                  </span>
                </span>
                <Badge tone={done ? 'success' : work.wait.tone} dot className='pst-status'>
                  <Roll variant='fade'>{done ? work.done.label : work.wait.label}</Roll>
                </Badge>
              </div>
            )
          })}
        </div>
      </div>
    </Window>
  )
}

function ProblemScene(props: SceneProps) {
  return <SceneStage def={problem} {...props} />
}

function SystemScene(props: SceneProps) {
  return <SceneStage def={system} {...props} />
}

function OutcomeScene(props: SceneProps) {
  return <SceneStage def={outcome} {...props} />
}

/** In act order: problem, system, outcome. */
export const STORY_SCENES: ComponentType<SceneProps>[] = [ProblemScene, SystemScene, OutcomeScene]
