'use client'

import { Badge, Bar, BrandMark, Button, Card, Check, Icon, Roll, Window, type Act } from '@/components/stageshow/kit'
import { SceneStage, SHEET, type SceneDef, type SceneProps } from '@/components/landing/scenes/scene'

/**
 * Process step 06 (Launch & optimize): the live system checking an invoice
 * before anyone pays it.
 *
 * The invoice is the anchor; a Slack approval card straddles its left edge
 * carrying the checks; a person approves; the invoice's own status pill
 * changes to the payoff, with the amount to pay after retention. It follows
 * the invoice build's real flow (duplicate check, PO and delivery match,
 * approval in Slack, bill added to QuickBooks after retention). The vendor,
 * PO and amounts are illustration, not a client record.
 */

type S = { card: boolean; done: number; running: boolean; approved: boolean; booked: boolean; resetting: boolean }

const START: S = { card: false, done: 0, running: false, approved: false, booked: false, resetting: false }
const CHECKS = ['No duplicate found', 'Matches PO 7731', 'Delivery received']

const live: SceneDef<S> = {
  size: SHEET,
  start: START,
  poster: { ...START, card: true, done: 3, approved: true, booked: true },
  hold: 2400,
  cursor: { at: 'rest', style: 'arrow', ripple: true },

  play: async (a: Act<S>) => {
    a.mark('open')
    await a.wait(700)

    // The approval card arrives carrying its checks, the first already running
    a.put({ card: true, running: true })
    await a.wait(900)
    a.mark('checks')

    for (let i = 1; i <= CHECKS.length; i++) {
      await a.wait(650)
      a.put({ done: i, running: i < CHECKS.length })
    }

    await a.wait(500)
    a.mark('approve')
    await a.click({ at: 'approve', x: 0.82, y: 0.62 })
    a.put({ approved: true })

    // The result follows its cause: the invoice updates a beat later
    await a.wait(650)
    a.mark('booked')
    a.put({ booked: true })
    await a.move('rest')
  },

  exit: async (a: Act<S>) => {
    // Exit around the anchor: the card leaves, then the invoice's changed
    // figures fade and reset while hidden, so nothing rewinds in view
    a.mark('exit')
    await a.set({ card: false })
    await a.wait(500)
    await a.set({ resetting: true })
    await a.wait(220)
    await a.snap({ ...START, resetting: true })
    await a.set({ resetting: false })
    await a.wait(300)
  },

  render: s => (
    <>
      <Window className='ps06-invoice'>
        <div className='ps06-inv' data-reset={s.resetting || undefined}>
          <div className='ps06-inv__head'>
            <span className='ps06-inv__title'>Invoice</span>
            <Bar w={52} h={6} tone={2} />
          </div>
          <div className='ps06-inv__vendor'>
            <span className='ps-strong'>Brightline Concrete</span>
            <Bar w={128} h={5} tone={2} />
          </div>
          <div className='ps06-inv__total'>$4,860.00</div>
          <Badge className='ps06-status' tone={s.booked ? 'success' : 'neutral'} dot>
            <Roll variant='fade'>{s.booked ? 'Added to QuickBooks' : 'Waiting for approval'}</Roll>
          </Badge>
          {/* The row's room is reserved, so nothing below it moves when
              it arrives or when the loop resets */}
          <div className='ps06-pay' data-on={s.booked || undefined}>
            <span className='ps-muted'>To pay after 10% retention</span>
            <span className='ps-strong'>$4,374.00</span>
          </div>
          <div className='ps06-inv__rows'>
            {[
              [86, 44],
              [64, 52],
              [92, 40],
              [58, 48],
              [76, 44]
            ].map(([left, right], i) => (
              <div key={i} className='ps06-inv__row'>
                <Bar w={left} h={5} tone={2} />
                <Bar w={right} h={5} tone={2} />
              </div>
            ))}
          </div>
        </div>
      </Window>

      <Card pad='medium' gap={12} className='ps06-slack' data-in={s.card || undefined}>
        <div className='ps06-card__head'>
          <BrandMark brand='slack' size={16} tile={false} />
          <span className='ps-strong'>Invoice approval</span>
        </div>
        <div className='ps06-checks'>
          {CHECKS.map((label, i) => (
            <div key={label} className='ps06-check' data-on={i < s.done || undefined}>
              <Check size={14} on={i < s.done} pending={s.running && i === s.done} />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className='ps06-actions'>
          <Button size='small' className='ps06-reject' data-on={!s.approved || undefined}>
            Reject
          </Button>
          <Button
            variant='primary'
            size='small'
            data-target='approve'
            icon={s.approved ? <Icon name='check' size={12} stroke={2} /> : undefined}
          >
            {s.approved ? 'Approved' : 'Approve'}
          </Button>
        </div>
      </Card>

      <span className='ps-rest ps06-rest' data-target='rest' />
    </>
  )
}

export function Live(props: SceneProps) {
  return <SceneStage def={live} {...props} />
}
