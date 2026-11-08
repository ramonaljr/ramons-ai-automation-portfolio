import './service-figures.css'

import type { ReactNode } from 'react'

import { FileText } from 'lucide-react'

import { ICON_STROKE } from '@/components/landing/motion'
import { at, mark, Paper } from '@/components/landing/process-figures'

/**
 * The figures beside each service: the document that service leaves on the
 * desk, drawn on the same paper as the Process and Engagement figures, so the
 * page speaks one visual language. A run log, an approval trail, an answer
 * with its sources, a sync report and a call summary.
 *
 * They illustrate the kind of work; none is a record of a client's system.
 * Each one marks, in the accent, the one place a person comes in.
 *
 * Inside the Services index, the figure on show (`.svc-fig[data-on]`) plays
 * in the same way the Process figures do (see process-figures.css).
 */

type TrailRow = { time: string; text: string; status: string; person?: boolean }

/** A timed list of what happened, with the person's step marked. */
function Trail({ rows, from = 1 }: { rows: TrailRow[]; from?: number }) {
  return (
    <ol className='pf-trail'>
      {rows.map((row, index) => (
        <li key={row.text} className='pf-in' style={at(index + from)} data-person={row.person || undefined}>
          <time>{row.time}</time>
          <span>{row.text}</span>
          <b>{row.status}</b>
        </li>
      ))}
    </ol>
  )
}

const RUNS_TODAY: TrailRow[] = [
  { time: '07:00', text: 'Sales sheet updated from 14 orders', status: '✓' },
  { time: '08:30', text: 'Weekly report sent to managers', status: '✓' },
  { time: '09:15', text: '3 invoices keyed into QuickBooks', status: '✓' },
  { time: '11:40', text: 'Follow-ups sent on 6 open quotes', status: '✓' },
  { time: '13:05', text: '1 order missing a price', status: 'To review', person: true }
]

function RoutineFigure() {
  return (
    <Paper kind='Run log' refLabel='Routine work · Today'>
      <Trail rows={RUNS_TODAY} />
      <p className='pf-foot pf-in' style={at(7)}>
        <b>5 runs today</b> · 1 left for a person
      </p>
    </Paper>
  )
}

const APPROVAL_TRAIL: TrailRow[] = [
  { time: '09:02', text: 'Onboarding form received', status: '✓' },
  { time: '09:02', text: 'Details and start date checked', status: '✓' },
  { time: '09:40', text: 'Manager approved in Slack', status: 'Approved', person: true },
  { time: '09:41', text: 'Accounts and Drive folder created', status: '✓' },
  { time: '09:41', text: 'Team told, first week booked', status: '✓' }
]

function ApprovalFigure() {
  return (
    <Paper kind='Approval trail' refLabel='Onboarding · New hire'>
      <Trail rows={APPROVAL_TRAIL} />
      <p className='pf-foot pf-in' style={at(7)}>
        <b>1 step with a person</b> · every step logged
      </p>
    </Paper>
  )
}

const SOURCES = ['Leave policy 2025 · p. 4', 'Employee handbook · 7.2']

function DocumentsFigure() {
  return (
    <Paper kind='Answer with sources' refLabel='Company documents'>
      <p className='pf-ask pf-in' style={at(1)}>
        <span>Asked</span>
        How many days of leave carry over into next year?
      </p>
      <p className='pf-answer pf-in' style={at(2)}>
        Up to five days carry over. Anything above that lapses on 31 March unless a manager approves an exception.
      </p>
      <ul className='pf-sources'>
        {SOURCES.map((source, index) => (
          <li key={source} className='pf-in' style={at(index + 3)}>
            <FileText strokeWidth={ICON_STROKE} aria-hidden='true' />
            {source}
          </li>
        ))}
      </ul>
      <p className='pf-foot pf-in' style={at(6)}>
        <b>Every answer links to its source</b> · unsure goes to a person
      </p>
    </Paper>
  )
}

const SYNCED = [
  { tool: mark('googlesheets', '#34A853'), name: 'Sheets' },
  { tool: mark('airtable', '#18BFFF'), name: 'Airtable' },
  { tool: mark('hubspot', '#FF7A59'), name: 'HubSpot' },
  { tool: mark('slack', '#4A154B'), name: 'Slack' }
]

function SyncFigure() {
  return (
    <Paper kind='Sync report' refLabel='Nightly check · 02:00'>
      <ol className='pf-chain' style={{ gridTemplateColumns: `repeat(${SYNCED.length}, minmax(0, 1fr))` }}>
        {SYNCED.map((item, index) => (
          <li key={item.name} className='pf-in' style={at(index)}>
            <span className='pf-tile'>{item.tool}</span>
            <span className='pf-tile-name'>{item.name}</span>
            {index < SYNCED.length - 1 && <i className='pf-link' style={at(index + 1)} />}
          </li>
        ))}
      </ol>
      <dl className='pf-fields'>
        <div className='pf-in' style={at(5)}>
          <dt>Checked</dt>
          <dd>412 customer records</dd>
        </div>
        <div className='pf-in' style={at(6)}>
          <dt>Updated</dt>
          <dd>18 changed details, in every tool</dd>
        </div>
        <div className='pf-in pf-success' style={at(7)}>
          <dt>Conflict</dt>
          <dd>1 record edited in two places, sent for review</dd>
        </div>
      </dl>
    </Paper>
  )
}

function CallFigure() {
  return (
    <Paper kind='Call summary' refLabel='After hours · 21:47'>
      <p className='pf-live pf-in' style={at(1)}>
        <i /> Answered <span>· 2 min 10 s · new customer</span>
      </p>
      <dl className='pf-fields'>
        <div className='pf-in' style={at(2)}>
          <dt>Asked</dt>
          <dd>&ldquo;Can I get an appointment this week?&rdquo;</dd>
        </div>
        <div className='pf-in' style={at(3)}>
          <dt>Collected</dt>
          <dd className='pf-chips'>
            <span>Name</span>
            <span>Phone</span>
            <span>Reason</span>
          </dd>
        </div>
        <div className='pf-in' style={at(4)}>
          <dt>Booked</dt>
          <dd>Thursday 10:00, confirmed by text</dd>
        </div>
        <div className='pf-in pf-success' style={at(5)}>
          <dt>For a person</dt>
          <dd>A price question, sent to the front desk</dd>
        </div>
      </dl>
      <p className='pf-foot pf-in' style={at(7)}>
        <b>Transcript saved</b> · team told in Slack
      </p>
    </Paper>
  )
}

/** By service slug, in the catalogue's order (lib/portfolio SERVICES). */
export const SERVICE_FIGURES: Record<string, ReactNode> = {
  'n8n-ai-agents': <RoutineFigure />,
  'business-process-automation': <ApprovalFigure />,
  'llm-rag-integrations': <DocumentsFigure />,
  'saas-api-integrations': <SyncFigure />,
  'ai-voice-agents': <CallFigure />
}

/** The paper in its dotted frame, playing in while `on`. */
export function ServiceFigure({ slug, on, className }: { slug: string; on: boolean; className?: string }) {
  return (
    <div className={className ? `svc-fig ${className}` : 'svc-fig'} data-on={on || undefined}>
      {SERVICE_FIGURES[slug]}
    </div>
  )
}
