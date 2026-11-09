'use client'

import { PhoneCall, PhoneMissed } from 'lucide-react'

import { Badge, Bar, BrandMark, Check, Collapse, Roll, Spinner, States, Stream } from '@/components/stageshow/kit'
import { ToolMark } from '@/components/landing/scenes/tool-mark'

/**
 * App screens the films share, drawn as clean cards in the site's look. Each
 * takes plain values, so a film's state decides what shows and the card only
 * draws it. Numbers, names and filler events are illustration.
 */

const ICON = { absoluteStrokeWidth: true, strokeWidth: 1.75 } as const

/* ── A phone's recent calls, every one missed ───────────────────────────── */

export type Missed = { from: string; at: string; note: string }

export function MissedCalls({ calls, shown }: { calls: Missed[]; shown: number }) {
  return (
    <section className='fc-card fc-missed' data-target='missed'>
      <header className='fc-missed__head'>
        <span className='fc-strong'>Recent calls</span>
        <span className='fc-muted'>Front desk</span>
      </header>
      <ul className='fc-missed__list'>
        {calls.map((c, i) => (
          <li key={c.from + c.at} className='fc-missed__row fc-in' data-in={shown > i || undefined}>
            <PhoneMissed size={16} {...ICON} className='fc-missed__icon' />
            <span className='fc-missed__who'>
              <span className='fc-strong'>{c.from}</span>
              <span className='fc-muted'>{c.note}</span>
            </span>
            <span className='fc-missed__at'>{c.at}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ── A live phone call with the voice agent ─────────────────────────────── */

export type Line = { who: 'agent' | 'caller'; text: string }

export type CallState = 'ring' | 'live' | 'ended'

export function CallCard({
  lines,
  shown,
  words,
  call,
  secs,
  from,
  note
}: {
  lines: readonly Line[]
  shown: number
  words: number[]
  call: CallState
  secs: number
  from: string
  note: string
}) {
  return (
    <section className='fc-card fc-call' data-target='call'>
      <div className='fc-call__head'>
        <PhoneCall size={32} {...ICON} className='fc-call__disc' />
        <span className='fc-strong fc-call__who'>Voice agent</span>
        <div className='fc-call__status'>
          <Badge
            tone={call === 'live' ? 'success' : call === 'ring' ? 'warning' : 'neutral'}
            dot
            className='fc-call__badge'
            data-ring={call === 'ring' || undefined}
          >
            <Roll variant='fade'>{call === 'ring' ? 'Ringing' : call === 'live' ? 'On call' : 'Ended'}</Roll>
          </Badge>
          <span className='fc-call__timer' data-on={call !== 'ring' || undefined}>
            0:{String(secs).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className='fc-call__thread'>
        <div className='fc-ring' data-on={call === 'ring' || undefined}>
          <span className='fc-ring__halo'>
            <PhoneCall size={44} {...ICON} className='fc-ring__disc' />
          </span>
          <span className='fc-strong'>Incoming call</span>
          <span className='fc-muted'>
            {from} · {note}
          </span>
        </div>
        <div className='fc-call__lines'>
          {lines.map((l, i) => (
            <Collapse key={l.text} open={shown > i} reveal={l.who === 'caller' ? 'drop' : 'clip'}>
              {l.who === 'agent' ? (
                <div className='fc-agent'>
                  <Stream text={l.text} count={words[i] ?? 0} />
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

/* ── Google Calendar, one afternoon ─────────────────────────────────────── */

export type CalState = 'idle' | 'checking' | 'open' | 'recheck' | 'booked'

/** 2 PM at the top of the grid, 52px an hour, so a half hour is 26px. */
const HOUR = 52
const TOP = 10
const at = (h: number) => TOP + (h - 14) * HOUR

const label = (h: number) => `${Math.floor(h) - 12}:${h % 1 ? '30' : '00'}`

export function CalendarDay({
  day,
  cal,
  asked,
  free,
  picked,
  event
}: {
  day: string
  cal: CalState
  asked: number
  free: number[]
  picked: number
  event: string
}) {
  return (
    <section className='fc-card fc-cal' data-target='calendar'>
      <div className='fc-cal__head'>
        <BrandMark brand='google-calendar' size={20} tile={false} />
        <span className='fc-strong'>{day}</span>
        <States
          align='end'
          className='fc-cal__status'
          value={cal}
          states={{
            idle: <span />,
            checking: (
              <span className='fc-st'>
                <Spinner size={12} />
                Checking {label(asked)} PM
              </span>
            ),
            open: <span className='fc-st fc-st--accent'>{free.length} open times</span>,
            recheck: (
              <span className='fc-st'>
                <Spinner size={12} />
                Checking {label(picked)} again
              </span>
            ),
            booked: (
              <span className='fc-st fc-st--ok'>
                <Check on size={14} />
                Booked
              </span>
            )
          }}
        />
      </div>
      <div className='fc-cal__grid' data-crop>
        {['2 PM', '3 PM', '4 PM', '5 PM'].map((h, i) => (
          <div key={h} className='fc-cal__hour' style={{ top: TOP + i * HOUR }}>
            <span className='fc-cal__label'>{h}</span>
          </div>
        ))}
        {/* Filler: the time asked for, already taken, and the late afternoon */}
        <div
          className='fc-ev fc-ev--busy'
          data-checking={cal === 'checking' || undefined}
          style={{ top: at(asked), height: HOUR / 2 - 2 }}
        >
          <Bar w={84} h={5} tone={2} />
        </div>
        <div className='fc-ev fc-ev--busy fc-ev--tall' style={{ top: at(16), height: HOUR * 2 - 2 }}>
          <Bar w={110} h={5} tone={2} />
        </div>
        {free.map((h, i) => {
          const isPick = h === picked
          const shown = cal === 'open' || (isPick && cal === 'recheck')

          return (
            <div
              key={h}
              className='fc-free'
              data-on={shown || undefined}
              data-pick={(isPick && cal === 'recheck') || undefined}
              style={{
                top: at(h),
                height: HOUR / 2 - 2,
                transitionDelay: cal === 'open' ? `${i * 90}ms` : '0ms'
              }}
            >
              <span className='fc-free__label'>{label(h)} free</span>
            </div>
          )
        })}
        <div
          className='fc-ev fc-ev--new'
          data-on={cal === 'booked' || undefined}
          style={{ top: at(picked), height: HOUR / 2 - 2 }}
        >
          <span className='fc-ev__title'>{event}</span>
        </div>
      </div>
    </section>
  )
}

/* ── Airtable, the rows a run writes ────────────────────────────────────── */

export type Row = { cells: string[]; shown: boolean }

/** Each table's last column is a status tag, set flush right. */
export function AirtableCard({
  tables
}: {
  tables: { name: string; head: string[]; rows: Row[]; filler?: boolean }[]
}) {
  return (
    <section className='fc-card fc-air' data-target='airtable'>
      <div className='fc-air__head'>
        <ToolMark tool='airtable' size={18} />
        <span className='fc-strong'>Airtable</span>
      </div>
      {tables.map(t => (
        <div key={t.name} className='fc-air__table'>
          <span className='fc-air__name'>{t.name}</span>
          <div className='fc-air__row fc-air__row--head'>
            {t.head.map(h => (
              <span key={h}>{h}</span>
            ))}
          </div>
          {t.rows.map(r => (
            <Collapse key={r.cells.join()} open={r.shown} reveal='drop'>
              <div className='fc-air__row fc-air__row--new'>
                {r.cells.map((c, i) => (
                  <span key={c + i} className={i === r.cells.length - 1 ? 'fc-air__tag' : undefined}>
                    {c}
                  </span>
                ))}
              </div>
            </Collapse>
          ))}
          {/* Filler: an earlier row, nothing to read */}
          {t.filler && (
            <div className='fc-air__row fc-air__row--filler'>
              <Bar w={64} h={5} tone={2} />
              <Bar w={52} h={5} tone={2} />
              <Bar w={40} h={5} tone={2} />
            </div>
          )}
        </div>
      ))}
    </section>
  )
}
