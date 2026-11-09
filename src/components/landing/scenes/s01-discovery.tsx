'use client'

import { Badge, Bar, Check, Chip, Window, type Act } from '@/components/stageshow/kit'
import { SceneStage, SHEET_COMPACT, type SceneDef, type SceneProps } from '@/components/landing/scenes/scene'

/**
 * Process step 01 (Discovery): the call notes for the invoice job. The
 * client's own words go in first, then who touches the work today, then what
 * success looks like. The company and quote are illustration.
 */

type S = { quote: string; typing: boolean; people: number; success: boolean; out: boolean }

const QUOTE = 'We match every invoice to its PO by hand.'
const PEOPLE = ['Accounts payable', 'Budget owner', 'Site manager']
const START: S = { quote: '', typing: false, people: 0, success: false, out: false }

const discovery: SceneDef<S> = {
  size: SHEET_COMPACT,
  start: START,
  poster: { ...START, quote: QUOTE, people: PEOPLE.length, success: true },
  hold: 2600,

  play: async (a: Act<S>) => {
    a.mark('open')
    await a.wait(600)
    a.put({ typing: true })
    await a.type('quote', QUOTE, { interval: 38 })
    a.put({ typing: false })
    a.mark('people')
    await a.wait(450)

    for (let i = 1; i <= PEOPLE.length; i++) {
      a.put({ people: i })
      await a.wait(220)
    }

    await a.wait(450)
    a.mark('success')
    a.put({ success: true })
  },

  // Everything written fades together, then resets while hidden
  exit: async (a: Act<S>) => {
    a.mark('exit')
    await a.set({ out: true })
    await a.wait(320)
    await a.snap({ ...START, out: true })
    await a.set({ out: false })
    await a.wait(300)
  },

  render: (s, layout) => (
    <Window title='Call notes' className='ps-hero'>
      <div className='ps-body ps01' data-out={s.out || undefined}>
        <div className='ps01-head'>
          <span className='ps-strong'>Brightline Concrete</span>
          <Badge>Discovery call</Badge>
        </div>

        <div className='ps01-section'>
          <span className='ps-label'>In their words</span>
          <p className='ps01-quote'>
            <span className='ps01-quote__text'>{s.quote}</span>
            <span className='ps01-caret' data-on={s.typing || undefined} />
          </p>
        </div>

        <div className='ps01-section'>
          <span className='ps-label'>Who touches it</span>
          {/* Keyed by layout: a chip measures its width once, so the row remounts
              to measure again at the phone's type size */}
          <div key={layout} className='ps01-people'>
            {PEOPLE.map((name, i) => (
              <Chip key={name} show={i < s.people} gap={6}>
                {name}
              </Chip>
            ))}
          </div>
        </div>

        <div className='ps01-section'>
          <span className='ps-label'>What success looks like</span>
          <div className='ps01-success ps-in' data-in={s.success || undefined}>
            <Check on size={14} />
            <span>Every bill checked before anyone pays it</span>
          </div>
        </div>

        <div className='ps-filler ps01-filler'>
          {[
            [168, 40],
            [124, 56],
            [188, 32],
            [96, 48]
          ].map(([left, right], i) => (
            <div key={i}>
              <Bar w={left} h={5} tone={2} />
              <Bar w={right} h={5} tone={2} />
            </div>
          ))}
        </div>
      </div>
    </Window>
  )
}

export function Discovery(props: SceneProps) {
  return <SceneStage def={discovery} {...props} />
}
