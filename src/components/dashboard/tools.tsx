'use client'

import { useState, type FormEvent } from 'react'

import { oppScore, quadrant, QUADRANT_LABEL, ROI_DEFAULTS, type Opportunity, type RoiInputs } from '@/lib/playbook'
import { cn } from '@/lib/utils'

type Props = {
  clientName: string | null
  opps: Opportunity[]
  onOpps: (opps: Opportunity[]) => void
  roi: Partial<RoiInputs>
  onRoi: (roi: RoiInputs) => void
}

export function ToolsView(props: Props) {
  return (
    <section>
      <div className='rvd-head'>
        <span className='rvd-eyebrow'>Tools</span>
        <h1>Score it, then price it</h1>
        <p>
          Both tools save to the client selected above, so the numbers are there when you write the Audit Report and
          Quotation.
        </p>
      </div>
      <div className='rvd-tools'>
        <OpportunityMatrix {...props} />
        <RoiCalculator {...props} />
      </div>
    </section>
  )
}

const SCALE = ['1', '2', '3', '4', '5']

function OpportunityMatrix({ clientName, opps, onOpps }: Props) {
  const [name, setName] = useState('')
  const [hrs, setHrs] = useState('4')
  const [imp, setImp] = useState('4')
  const [dif, setDif] = useState('2')
  const [con, setCon] = useState('4')

  const ranked = opps.map((o, i) => ({ ...o, i })).sort((a, b) => oppScore(b) - oppScore(a))
  const quickWinHours = ranked.filter(o => quadrant(o) === 'qw').reduce((sum, o) => sum + (Number(o.hrs) || 0), 0)

  const add = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    onOpps([...opps, { name: name.trim(), hrs: Math.max(0, parseFloat(hrs) || 0), imp: +imp, dif: +dif, con: +con }])
    setName('')
  }

  // Plot geometry: difficulty runs left to right, impact bottom to top.
  const W = 340
  const H = 300
  const L = 40
  const T = 14
  const R = 12
  const B = 40
  const pw = W - L - R
  const ph = H - T - B
  const x = (v: number) => L + ((v - 0.5) / 5) * pw
  const y = (v: number) => T + ((5.5 - v) / 5) * ph
  const midX = x(3.5)
  const midY = y(2.5)
  const stacked: Record<string, number> = {}

  return (
    <div className='rvd-tool' id='rvd-tool-matrix'>
      <header>
        <h2>Opportunity Matrix</h2>
        <p className='rvd-hint'>
          Score each opportunity 1–5. Difficulty 5 is hardest. Score = Impact × (6 − Difficulty) × Confidence, out of
          125.
        </p>
      </header>

      <form className='rvd-form' onSubmit={add}>
        <label className='rvd-fld wide' htmlFor='mx-name'>
          <span>Opportunity</span>
          <input
            id='mx-name'
            placeholder='e.g. Invoice data entry into QuickBooks'
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete='off'
            required
          />
        </label>
        <label className='rvd-fld' htmlFor='mx-hrs'>
          <span>Hours saved / week</span>
          <input id='mx-hrs' type='number' min='0' step='0.5' value={hrs} onChange={e => setHrs(e.target.value)} />
        </label>
        {(
          [
            ['mx-imp', 'Impact (1–5)', imp, setImp],
            ['mx-dif', 'Difficulty (1–5)', dif, setDif],
            ['mx-con', 'Confidence (1–5)', con, setCon]
          ] as const
        ).map(([id, label, value, set]) => (
          <label key={id} className='rvd-fld' htmlFor={id}>
            <span>{label}</span>
            <select id={id} value={value} onChange={e => set(e.target.value)}>
              {SCALE.map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        ))}
        <div className='rvd-fld' style={{ justifyContent: 'flex-end' }}>
          <button className='rvd-btn primary' type='submit'>
            Add
          </button>
        </div>
      </form>

      <div className='rvd-mx'>
        <div className='rvd-tbl'>
          {ranked.length ? (
            <>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Opportunity</th>
                    <th className='r'>Hrs/wk</th>
                    <th className='r'>I·D·C</th>
                    <th className='r'>Score</th>
                    <th>Quadrant</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((o, rank) => {
                    const q = quadrant(o)

                    return (
                      <tr key={`${o.name}-${o.i}`}>
                        <td className='rvd-mono'>{rank + 1}</td>
                        <td>{o.name}</td>
                        <td className='r'>{o.hrs}</td>
                        <td className='r rvd-mono'>
                          {o.imp}·{o.dif}·{o.con}
                        </td>
                        <td className='r'>
                          <b>{oppScore(o)}</b>
                        </td>
                        <td>
                          <span className={cn('rvd-pill', q)}>{QUADRANT_LABEL[q]}</span>
                        </td>
                        <td className='r'>
                          <button
                            className='rvd-btn sm ghost'
                            type='button'
                            aria-label={`Remove ${o.name}`}
                            onClick={() => onOpps(opps.filter((_, j) => j !== o.i))}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p className='rvd-hint'>
                Total from Quick Wins: <b>{quickWinHours} hrs/week</b>. Use the top rows for the Audit Report&rsquo;s
                priority table.
              </p>
            </>
          ) : (
            <div className='rvd-empty'>
              No opportunities yet{clientName ? ` for ${clientName}` : ''}. Add the first one above.
            </div>
          )}
        </div>

        <svg
          className='rvd-plot'
          viewBox={`0 0 ${W} ${H}`}
          role='img'
          aria-label='Opportunity matrix: impact against difficulty'
        >
          <rect className='q1' x={L} y={T} width={midX - L} height={midY - T} />
          <rect className='q2' x={midX} y={T} width={L + pw - midX} height={midY - T} />
          <rect className='q3' x={L} y={midY} width={midX - L} height={T + ph - midY} />
          <rect className='q4' x={midX} y={midY} width={L + pw - midX} height={T + ph - midY} />
          <rect className='frame' x={L} y={T} width={pw} height={ph} />
          <text className='ql' x={L + 8} y={T + 16}>
            QUICK WINS
          </text>
          <text className='ql' x={L + pw - 8} y={T + 16} textAnchor='end'>
            BIG SWINGS
          </text>
          <text className='ql' x={L + 8} y={T + ph - 8}>
            FILL-INS
          </text>
          <text className='ql' x={L + pw - 8} y={T + ph - 8} textAnchor='end'>
            MONEY PITS
          </text>
          {[1, 2, 3, 4, 5].map(v => (
            <g key={v}>
              <text className='ax' x={x(v)} y={T + ph + 16} textAnchor='middle'>
                {v}
              </text>
              <text className='ax' x={L - 10} y={y(v) + 4} textAnchor='end'>
                {v}
              </text>
            </g>
          ))}
          <text className='ax' x={L + pw / 2} y={H - 4} textAnchor='middle'>
            Difficulty →
          </text>
          <text className='ax' x={12} y={T + ph / 2} textAnchor='middle' transform={`rotate(-90 12 ${T + ph / 2})`}>
            Impact →
          </text>
          {ranked.map((o, rank) => {
            const key = `${o.dif}-${o.imp}`
            const n = (stacked[key] = (stacked[key] ?? 0) + 1)
            const cx = x(o.dif) + (n - 1) * 13 - (n > 1 ? 6 : 0)

            return (
              <g key={`${o.name}-${o.i}`}>
                <circle className='dot' cx={cx} cy={y(o.imp)} r={9} />
                <text className='dn' x={cx} y={y(o.imp) + 3.5} textAnchor='middle'>
                  {rank + 1}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

const FIELDS: { key: keyof RoiInputs; label: string; step?: string; placeholder?: string; title?: string }[] = [
  { key: 'hrs', label: 'Hours saved / week', step: '0.5' },
  { key: 'rate', label: 'Staff cost / hour', step: '1' },
  { key: 'wks', label: 'Working weeks / year', step: '1' },
  { key: 'oth', label: 'Other value / month', step: '10', title: 'Errors avoided, leads no longer lost' },
  { key: 'run', label: 'Running cost / month', step: '5', title: 'Subscriptions and AI usage' },
  { key: 'price', label: 'Your build price', step: '50', placeholder: 'blank = suggested' },
  { key: 'bh', label: 'Your build hours (est.)', step: '1', placeholder: 'optional' }
]

const CURRENCIES = [
  ['USD', 'USD $'],
  ['PHP', 'PHP ₱'],
  ['AUD', 'AUD $'],
  ['GBP', 'GBP £'],
  ['JPY', 'JPY ¥']
]

function RoiCalculator({ roi, onRoi }: Props) {
  const r: RoiInputs = { ...ROI_DEFAULTS, ...roi }
  const set = (key: keyof RoiInputs, value: string) => onRoi({ ...r, [key]: value })
  const n = (v: string) => Math.max(0, parseFloat(v) || 0)

  let fmt: (v: number) => string

  try {
    const nf = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: r.cur || 'USD',
      maximumFractionDigits: 0
    })

    fmt = v => nf.format(v)
  } catch {
    fmt = v => Math.round(v).toLocaleString()
  }

  const time = n(r.hrs) * n(r.rate) * n(r.wks)
  const other = n(r.oth) * 12
  const run = n(r.run) * 12
  const net = time + other - run
  const low = net * 0.1
  const high = net * 0.2
  const price = r.price !== '' ? n(r.price) : low
  const multiple = price > 0 ? net / price : 0
  const payback = net > 0 ? price / (net / 12) : 0
  const effectiveRate = r.bh !== '' && n(r.bh) > 0 ? price / n(r.bh) : null

  const verdict =
    net <= 0
      ? { tone: 'bad', text: 'The running costs are higher than the value. Recheck the numbers or the scope.' }
      : multiple >= 10
        ? { tone: 'good', text: 'Strong: the client gets at least 10× back in year one. Easy to defend.' }
        : multiple >= 5
          ? { tone: 'mid', text: 'Fair: 5–10× return. Justify it with complexity, risk or speed, or trim the scope.' }
          : {
              tone: 'bad',
              text: 'Hard to justify: under 5× return. Reduce the scope or lower the first version’s price.'
            }

  return (
    <div className='rvd-tool' id='rvd-tool-roi'>
      <header>
        <h2>ROI &amp; Price Calculator</h2>
        <p className='rvd-hint'>
          Price from value, not hours. A starting point is 10–20% of the first-year value, so the client sees a 5–10×
          return.
        </p>
      </header>

      <form className='rvd-form' onSubmit={e => e.preventDefault()}>
        <label className='rvd-fld' htmlFor='roi-cur'>
          <span>Currency</span>
          <select id='roi-cur' value={r.cur} onChange={e => set('cur', e.target.value)}>
            {CURRENCIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {FIELDS.map(f => (
          <label key={f.key} className='rvd-fld' htmlFor={`roi-${f.key}`} title={f.title}>
            <span>{f.label}</span>
            <input
              id={`roi-${f.key}`}
              type='number'
              min='0'
              step={f.step}
              placeholder={f.placeholder}
              value={r[f.key]}
              onChange={e => set(f.key, e.target.value)}
            />
          </label>
        ))}
      </form>

      <div className='rvd-out'>
        <div className='rvd-stat'>
          <b>Time value / year</b>
          <span>{fmt(time)}</span>
          <small>
            {n(r.hrs)} hrs × {fmt(n(r.rate))} × {n(r.wks)} wks
          </small>
        </div>
        <div className='rvd-stat'>
          <b>Net value / year</b>
          <span>{fmt(net)}</span>
          <small>
            + {fmt(other)} other − {fmt(run)} running
          </small>
        </div>
        <div className='rvd-stat'>
          <b>Suggested price</b>
          <span>
            {fmt(low)}–{fmt(high)}
          </span>
          <small>10–20% of year-one value</small>
        </div>
        <div className='rvd-stat'>
          <b>Client return, year one</b>
          <span>{multiple ? `${multiple.toFixed(1)}×` : '–'}</span>
          <small>
            at {fmt(price)}
            {r.price === '' ? ' (suggested)' : ''}
          </small>
        </div>
        <div className='rvd-stat'>
          <b>Payback</b>
          <span>{payback ? `${payback.toFixed(1)} mo` : '–'}</span>
          <small>price ÷ monthly net value</small>
        </div>
        {effectiveRate !== null && (
          <div className='rvd-stat'>
            <b>Your effective rate</b>
            <span>{fmt(effectiveRate)}/hr</span>
            <small>price ÷ {n(r.bh)} build hours</small>
          </div>
        )}
      </div>
      <div className={cn('rvd-verdict', verdict.tone)}>{verdict.text}</div>
    </div>
  )
}
