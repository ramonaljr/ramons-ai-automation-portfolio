import './process-figures.css'

import type { CSSProperties, ReactNode } from 'react'

import { ClipboardCheck } from 'lucide-react'

import { ICON_STROKE } from '@/components/landing/motion'

/**
 * The figures beside each Process step: the thing the client holds at the
 * end of that step, drawn as a document on the drafting table.
 *
 * One example runs through all six, a purchase approval that takes three
 * follow-ups, so the figures read as one job going from a problem on a call
 * to a monitored system: problem statement, opportunity list, system map,
 * build log, test report, run monitor. The figures illustrate the kind of
 * work; none of them is a record of a client's system or a measured result.
 *
 * Every figure is drawn in its finished state. Inside the pinned sheet, the
 * step on show (`.proc-visual[data-on]`) plays it in: lines rise, bars grow,
 * paths draw and ticks land in order. The ruled list shows them still.
 * Sizes are in `em`, and the paper's font size follows its frame through
 * container units, so one drawing fits the pinned frame and the list alike.
 */

/** Delay slot for a piece of a figure, in steps of the shared stagger. */
const at = (d: number) => ({ '--d': d }) as CSSProperties

/** A tool's mark from public/images/tools, in its own colour. */
const mark = (slug: string, color: string) => (
  <span
    className='pf-logo'
    style={{
      backgroundColor: color,
      WebkitMaskImage: `url(/images/tools/${slug}.svg)`,
      maskImage: `url(/images/tools/${slug}.svg)`
    }}
  />
)

/** The paper itself: the document's kind and reference, then its body. */
function Paper({ kind, refLabel, children }: { kind: string; refLabel: string; children: ReactNode }) {
  return (
    <div className='pf' aria-hidden='true'>
      <div className='pf-head pf-in'>
        <span className='pf-kind'>{kind}</span>
        <span className='pf-ref'>{refLabel}</span>
      </div>
      {children}
    </div>
  )
}

function ProblemFigure() {
  return (
    <Paper kind='Problem statement' refLabel='Call notes · Day 1'>
      <p className='pf-quote pf-in' style={at(1)}>
        &ldquo;Purchase approvals take three follow-ups.&rdquo;
      </p>
      <dl className='pf-fields'>
        <div className='pf-in' style={at(2)}>
          <dt>Touches it</dt>
          <dd className='pf-chips'>
            <span>Requester</span>
            <span>Manager</span>
            <span>Finance</span>
          </dd>
        </div>
        <div className='pf-in' style={at(3)}>
          <dt>Today</dt>
          <dd>An email thread and a shared sheet</dd>
        </div>
        <div className='pf-in pf-success' style={at(4)}>
          <dt>Success</dt>
          <dd>A decision the same day, without chasing</dd>
        </div>
      </dl>
    </Paper>
  )
}

/** Hours lost per item, as a share of the longest bar. */
const OPPORTUNITIES = [
  { label: 'Manual data entry', value: '4.2 hrs / wk', share: 0.92, verdict: 'Automate' },
  { label: 'Waiting on approval', value: '1.8 days', share: 0.74, verdict: 'Automate' },
  { label: 'Repeat follow-ups', value: '26 / month', share: 0.55, verdict: 'Automate' },
  { label: 'Final sign-off', value: '5 min', share: 0.12, verdict: 'Keep a person' }
]

export function AuditFigure() {
  return (
    <Paper kind='Opportunity list' refLabel='Process audit · Week 1'>
      <ol className='pf-rank'>
        {OPPORTUNITIES.map((item, index) => (
          <li key={item.label} className='pf-in' style={at(index + 1)} data-keep={item.share < 0.2 || undefined}>
            <span className='pf-rank-label'>{item.label}</span>
            <span className='pf-bar' style={{ '--share': item.share, ...at(index + 1) } as CSSProperties}>
              <i />
            </span>
            <span className='pf-rank-value'>{item.value}</span>
            <span className='pf-tag'>{item.verdict}</span>
          </li>
        ))}
      </ol>
      <p className='pf-foot pf-in' style={at(6)}>
        <b>3 to automate</b> · 1 stays with a person
      </p>
    </Paper>
  )
}

function MapFigure() {
  return (
    <Paper kind='System map' refLabel='Solution design · Rev. A'>
      <svg className='pf-map' viewBox='0 0 640 250' role='presentation'>
        <path className='pf-draw' style={at(1)} pathLength={1} d='M150 125 H210' />
        <path className='pf-draw' style={at(2)} pathLength={1} d='M350 125 H410' />
        <path className='pf-draw' style={at(3)} pathLength={1} d='M550 108 C580 108 580 48 600 48' />
        <path className='pf-draw pf-dash' style={at(3)} pathLength={1} d='M550 142 C580 142 580 202 600 202' />

        <g className='pf-node pf-in' style={at(0)}>
          <rect x='10' y='92' width='140' height='66' rx='10' />
          <text x='26' y='121'>Request form</text>
          <text className='pf-sub' x='26' y='141'>item · cost · reason</text>
        </g>
        <g className='pf-node pf-in' style={at(1)}>
          <rect x='210' y='92' width='140' height='66' rx='10' />
          <text x='226' y='121'>Checks</text>
          <text className='pf-sub' x='226' y='141'>budget · supplier</text>
        </g>
        <g className='pf-node pf-core pf-in' style={at(2)}>
          <rect x='410' y='92' width='140' height='66' rx='10' />
          <text x='426' y='121'>Approval</text>
          <text className='pf-sub' x='426' y='141'>manager, in Slack</text>
        </g>

        <text className='pf-edge pf-in' style={at(4)} x='566' y='36'>
          approved
        </text>
        <text className='pf-edge pf-in' style={at(4)} x='566' y='226'>
          rejected
        </text>
        <circle className='pf-end pf-in' style={at(4)} cx='606' cy='48' r='5' />
        <circle className='pf-end pf-in' style={at(4)} cx='606' cy='202' r='5' />
      </svg>

      <div className='pf-map-legend pf-in' style={at(4)}>
        <span>Approved → record saved, requester told</span>
        <span>Rejected → back to requester with the reason</span>
      </div>

      <span className='pf-stamp' style={at(6)}>
        Signed off
      </span>
    </Paper>
  )
}

const CONNECTIONS = [
  { tool: <ClipboardCheck strokeWidth={ICON_STROKE} aria-hidden='true' />, name: 'Form' },
  { tool: mark('n8n', '#EA4B71'), name: 'n8n' },
  { tool: mark('slack', '#4A154B'), name: 'Slack' },
  { tool: mark('googlesheets', '#34A853'), name: 'Sheets' },
  { tool: mark('gmail', '#EA4335'), name: 'Gmail' }
]

const BUILD_LOG = [
  'Request form connected',
  'Budget and supplier checks set',
  'Approval sent to the manager in Slack',
  'Every run logged · failure alerts on'
]

export function BuildFigure() {
  return (
    <Paper kind='Build log' refLabel='Build & connect · In your accounts'>
      <ol className='pf-chain'>
        {CONNECTIONS.map((item, index) => (
          <li key={item.name} className='pf-in' style={at(index)}>
            <span className='pf-tile'>{item.tool}</span>
            <span className='pf-tile-name'>{item.name}</span>
            {index < CONNECTIONS.length - 1 && <i className='pf-link' style={at(index + 1)} />}
          </li>
        ))}
      </ol>
      <ul className='pf-log'>
        {BUILD_LOG.map((line, index) => (
          <li key={line} className='pf-in' style={at(index + 5)}>
            <b>✓</b>
            {line}
          </li>
        ))}
      </ul>
    </Paper>
  )
}

const TEST_CASES = [
  'Standard request',
  'Missing field',
  'Duplicate request',
  'Over budget',
  'Manager away',
  'Slack not responding',
  'Sheet locked',
  'Wrong currency',
  'Late reply',
  'Rejected',
  'Resubmitted',
  'Ten at once'
]

function TestFigure() {
  return (
    <Paper kind='Test report' refLabel='Testing & handover · Final days'>
      <p className='pf-score pf-in' style={at(1)}>
        <b>12 / 12</b> cases passed
      </p>
      <ul className='pf-cases'>
        {TEST_CASES.map((label, index) => (
          <li key={label} className='pf-in' style={at(index * 0.5 + 2)}>
            <b>✓</b>
            {label}
          </li>
        ))}
      </ul>
      <p className='pf-foot pf-handover pf-in' style={at(9)}>
        <span>Handover</span> Runbook ✓ · Team walkthrough ✓ · Access list ✓
      </p>
    </Paper>
  )
}

/** A fortnight of daily runs, drawn, not measured; day 9 had a failed run. */
const RUNS = [0.42, 0.55, 0.5, 0.62, 0.58, 0.35, 0.3, 0.66, 0.7, 0.61, 0.74, 0.68, 0.4, 0.36]
const FAILED_DAY = 8

export function MonitorFigure() {
  return (
    <Paper kind='Run monitor' refLabel='Launch & optimize · Monthly'>
      <p className='pf-live pf-in' style={at(1)}>
        <i /> Live <span>· every run checked</span>
      </p>
      <div className='pf-runs pf-in' style={at(2)}>
        {RUNS.map((height, index) => (
          <span
            key={index}
            data-failed={index === FAILED_DAY || undefined}
            style={{ '--h': height, ...at(index * 0.35 + 2) } as CSSProperties}
          />
        ))}
        <span className='pf-runs-note' style={{ '--x': (FAILED_DAY + 0.5) / RUNS.length } as CSSProperties}>
          Failed run → alert sent, fixed the same day
        </span>
      </div>
      <p className='pf-foot pf-in' style={at(8)}>
        <b>Alerts on</b> · a failed run reaches me first
      </p>
    </Paper>
  )
}

/** In PROCESS order: discovery, audit, design, build, testing, launch. */
export const PROCESS_FIGURES: ReactNode[] = [
  <ProblemFigure key='problem' />,
  <AuditFigure key='audit' />,
  <MapFigure key='map' />,
  <BuildFigure key='build' />,
  <TestFigure key='test' />,
  <MonitorFigure key='monitor' />
]
