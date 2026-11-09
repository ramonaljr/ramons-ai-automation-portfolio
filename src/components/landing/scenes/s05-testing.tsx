'use client'

import { Bar, Card, Check, Roll, Window, type Act } from '@/components/stageshow/kit'
import { SceneStage, SHEET_COMPACT, type SceneDef, type SceneProps } from '@/components/landing/scenes/scene'

/**
 * Process step 05 (Testing & handover): the test cases run one by one,
 * including the ones that go wrong on purpose, until all 12 pass. Then the
 * handover card arrives with what the client keeps.
 */

type S = { done: number; running: number; handover: boolean; handed: number; out: boolean }

const START: S = { done: 0, running: -1, handover: false, handed: 0, out: false }

const CASES = [
  'Standard invoice',
  'Duplicate invoice',
  'No matching PO',
  'Short delivery',
  'AI unsure, a person checks',
  'Slack approval not answered'
]

const TOTAL = 12
const HANDOVER = ['Runbook', 'Walkthrough video', 'Access list']

const passed = (done: number) => Math.min(done, TOTAL)

const testing: SceneDef<S> = {
  size: SHEET_COMPACT,
  start: START,
  poster: { done: TOTAL, running: -1, handover: true, handed: HANDOVER.length, out: false },
  hold: 2400,

  play: async (a: Act<S>) => {
    a.mark('open')
    await a.wait(600)
    a.mark('tests')

    for (let i = 0; i < CASES.length; i++) {
      a.put({ running: i })
      await a.wait(460)
      a.put({ done: i + 1 })
    }

    // The last row stands for the other six cases
    a.put({ running: CASES.length })
    await a.wait(420)
    a.put({ done: TOTAL, running: -1 })
    await a.wait(800)

    a.mark('handover')
    a.put({ handover: true })
    await a.wait(800)

    for (let i = 1; i <= HANDOVER.length; i++) {
      a.put({ handed: i })
      await a.wait(260)
    }

    a.mark('done')
  },

  exit: async (a: Act<S>) => {
    a.mark('exit')
    await a.set({ handover: false })
    await a.wait(450)
    await a.set({ out: true })
    await a.wait(320)
    await a.snap({ ...START, out: true })
    await a.wait(350)
    await a.set({ out: false })
    await a.wait(300)
  },

  render: s => (
    <>
      <Window className='ps-hero ps05-hero'>
        <div className='ps-body ps05' data-out={s.out || undefined}>
          <div className='ps05-head'>
            <span className='ps-strong'>Test report</span>
            <span className='ps-faint'>Invoice check</span>
          </div>
          <div className='ps05-score'>
            <span className='ps05-score__n'>
              <Roll variant='fade'>{String(passed(s.done))}</Roll>
              <span className='ps-faint'>/ {TOTAL}</span>
            </span>
            <span className='ps-muted'>cases passed</span>
          </div>

          <div className='ps05-cases'>
            {CASES.map((name, i) => (
              <div key={name} className='ps05-case' data-on={i < s.done || undefined}>
                <Check size={14} on={i < s.done} pending={s.running === i} />
                <span>{name}</span>
              </div>
            ))}
            <div className='ps05-case' data-on={s.done === TOTAL || undefined}>
              <Check size={14} on={s.done === TOTAL} pending={s.running === CASES.length} />
              <span>6 more edge cases</span>
            </div>
          </div>

          <div className='ps-filler'>
            {[
              [120, 0],
              [88, 0]
            ].map(([left], i) => (
              <div key={i}>
                <Bar w={left} h={5} tone={2} />
              </div>
            ))}
          </div>
        </div>
      </Window>

      <Card pad='medium' gap={10} className='ps05-handover' data-in={s.handover || undefined}>
        <span className='ps-strong ps05-handover__title'>Handed over</span>
        {HANDOVER.map((item, i) => (
          <div key={item} className='ps05-item' data-on={i < s.handed || undefined}>
            <Check size={14} on={i < s.handed} />
            <span>{item}</span>
          </div>
        ))}
      </Card>
    </>
  )
}

export function Testing(props: SceneProps) {
  return <SceneStage def={testing} {...props} />
}
