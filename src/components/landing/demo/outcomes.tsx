'use client'

import { Fragment, type ReactNode } from 'react'

import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileImage,
  FileText,
  FileType,
  Folder,
  Hourglass,
  MapPin,
  MessageCircle,
  Phone,
  Reply,
  Star,
  Video
} from 'lucide-react'

import { ToolMark } from '@/components/landing/tool-stack-section'
import type { DemoOutcome } from '@/lib/demos/types'

import './outcomes.css'

const MARK = {
  gmail: { name: 'Gmail', slug: 'gmail', color: '#EA4335' },
  slack: { name: 'Slack', slug: 'slack', color: '#4A154B' },
  airtable: { name: 'Airtable', slug: 'airtable', color: '#18BFFF' },
  sheets: { name: 'Google Sheets', slug: 'googlesheets', color: '#34A853' },
  QuickBooks: { name: 'QuickBooks', slug: 'quickbooks', color: '#2CA01C' },
  Pipedrive: { name: 'Pipedrive', color: '#26B67C' },
  PostgreSQL: { name: 'PostgreSQL', slug: 'postgresql', color: '#336791' },
  'Google Drive': { name: 'Google Drive', slug: 'googledrive', color: '#4285F4' }
}

const APP_LABEL: Record<DemoOutcome['kind'], string> = {
  email: 'Gmail',
  slack: 'Slack',
  airtable: 'Airtable',
  sheets: 'Google Sheets',
  calendar: 'Google Calendar',
  drive: 'Google Drive',
  form: 'n8n form',
  record: '',
  chat: ''
}

/** The shortcodes the builds' Slack messages use, as Slack draws them. */
const EMOJI: Record<string, string> = {
  white_check_mark: '✅',
  warning: '⚠️',
  x: '❌',
  no_entry: '⛔',
  no_entry_sign: '🚫',
  rotating_light: '🚨',
  dart: '🎯',
  mag: '🔍',
  handshake: '🤝',
  hotel: '🏨',
  inbox_tray: '📥',
  hourglass: '⌛',
  hourglass_flowing_sand: '⏳',
  sunny: '☀️',
  page_facing_up: '📄',
  grey_question: '❔',
  question: '❓',
  busts_in_silhouette: '👥',
  mailbox_with_no_mail: '📭',
  information_source: 'ℹ️',
  package: '📦',
  tada: '🎉'
}

/** Slack's own emphasis, `*bold*`, and its `:shortcode:` emoji. */
function slackLine(raw: string) {
  return raw
    .replace(/:([a-z_]+):/g, (code, name: string) => EMOJI[name] ?? code)
    .split(/(\*[^*]+\*)/g)
    .map((part, index) =>
      part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
        <strong key={index}>{part.slice(1, -1)}</strong>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      )
    )
}

const initials = (name: string) =>
  name
    .replace(/<.*>|\(.*\)|@.*/g, '')
    .trim()
    .split(/\s+/)
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

function Email({ outcome }: { outcome: Extract<DemoOutcome, { kind: 'email' }> }) {
  return (
    <div className='oc-email'>
      <div className='oc-email-subject'>
        <span>{outcome.subject}</span>
        <span className='oc-email-tag'>Inbox</span>
      </div>
      <div className='oc-email-meta'>
        <span className='oc-avatar' aria-hidden='true'>
          {initials(outcome.from)}
        </span>
        <span className='oc-email-who'>
          <b>{outcome.from}</b>
          <span>to {outcome.to}</span>
        </span>
        <span className='oc-email-time'>
          {outcome.time}
          <Star size={14} aria-hidden='true' />
          <Reply size={14} aria-hidden='true' />
        </span>
      </div>
      <p className='oc-email-body'>{outcome.body}</p>
    </div>
  )
}

function Slack({ outcome }: { outcome: Extract<DemoOutcome, { kind: 'slack' }> }) {
  return (
    <div className='oc-slack'>
      <div className='oc-slack-channel'># {outcome.channel}</div>
      <div className='oc-slack-message'>
        <span className='oc-slack-avatar' aria-hidden='true'>
          {initials(outcome.app)}
        </span>
        <div>
          <p className='oc-slack-head'>
            <b>{outcome.app}</b>
            <span className='oc-slack-badge'>APP</span>
            <span className='oc-slack-time'>{outcome.time}</span>
          </p>
          {outcome.text.map((line, index) => (
            <p key={index} className='oc-slack-line'>
              {slackLine(line)}
            </p>
          ))}
          {outcome.buttons && (
            <div className='oc-slack-buttons'>
              {outcome.buttons.map((label, index) => (
                <span key={label} data-primary={index === 0 || undefined}>
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Columns whose values are states, drawn as the coloured chips the apps use. */
const PILL_COLUMN = /stage|status|outcome|tier/i

function Grid({ outcome }: { outcome: Extract<DemoOutcome, { kind: 'airtable' | 'sheets' }> }) {
  const sheets = outcome.kind === 'sheets'

  return (
    <div className='oc-grid' data-kind={outcome.kind}>
      <div className='oc-grid-bar'>
        <ToolMark tool={sheets ? MARK.sheets : MARK.airtable} size={15} />
        <b>{outcome.file}</b>
        <span className='oc-grid-tab'>{outcome.table}</span>
      </div>
      <div className='oc-grid-scroll'>
        <table>
          <thead>
            <tr>
              <th className='oc-grid-index' aria-hidden='true' />
              {outcome.columns.map((column, index) => (
                <th key={column}>{sheets ? `${String.fromCharCode(65 + index)} · ${column}` : column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {outcome.rows.map((row, rowIndex) => (
              <tr key={rowIndex} data-new={[outcome.highlight].flat().includes(rowIndex) || undefined}>
                <td className='oc-grid-index'>{rowIndex + (sheets ? 2 : 1)}</td>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} title={String(cell)}>
                    {PILL_COLUMN.test(outcome.columns[cellIndex]) && cell !== '' ? (
                      <span className='oc-pill' data-value={String(cell).toLowerCase()}>
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Calendar({ outcome }: { outcome: Extract<DemoOutcome, { kind: 'calendar' }> }) {
  return (
    <div className='oc-calendar' data-cancelled={outcome.cancelled || undefined}>
      <span className='oc-calendar-bar' aria-hidden='true' />
      <div>
        {outcome.cancelled && (
          <span className='oc-pill' data-value='cancelled'>
            Cancelled · guests notified
          </span>
        )}
        <p className='oc-calendar-title'>{outcome.title}</p>
        <p className='oc-calendar-when'>
          {outcome.date} · {outcome.time}
        </p>
        {outcome.meet && (
          <p className='oc-calendar-meet'>
            <Video size={15} aria-hidden='true' />
            Join with Google Meet
          </p>
        )}
        {outcome.location && (
          <p className='oc-calendar-where'>
            <MapPin size={15} aria-hidden='true' />
            {outcome.location}
          </p>
        )}
        <ul className='oc-calendar-guests'>
          {outcome.guests.map(guest => (
            <li key={guest}>
              <span className='oc-avatar' aria-hidden='true'>
                {initials(guest)}
              </span>
              {guest}
            </li>
          ))}
        </ul>
        {outcome.note && <p className='oc-calendar-note'>{outcome.note}</p>}
      </div>
    </div>
  )
}

/** Drive's own file-type icons, in the colours it draws them. */
const DRIVE_ICON = {
  folder: { Icon: Folder, color: '#5f6368' },
  pdf: { Icon: FileType, color: '#ea4335' },
  image: { Icon: FileImage, color: '#ea4335' },
  doc: { Icon: FileText, color: '#4285f4' },
  text: { Icon: FileText, color: '#5f6368' }
}

function Drive({ outcome }: { outcome: Extract<DemoOutcome, { kind: 'drive' }> }) {
  return (
    <div className='oc-drive'>
      <p className='oc-drive-path'>
        {outcome.path.map((part, index) => (
          <Fragment key={part}>
            {index > 0 && <ChevronRight size={15} aria-hidden='true' />}
            <span data-current={index === outcome.path.length - 1 || undefined}>{part}</span>
          </Fragment>
        ))}
      </p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Last modified</th>
            <th>File size</th>
          </tr>
        </thead>
        <tbody>
          {outcome.files.map((file, index) => {
            const { Icon, color } = DRIVE_ICON[file.type]

            return (
              <tr key={file.name} data-new={outcome.added?.includes(index) || undefined}>
                <td>
                  <span className='oc-drive-name'>
                    <Icon size={17} color={color} fill={file.type === 'folder' ? color : 'none'} aria-hidden='true' />
                    <span title={file.name}>{file.name}</span>
                  </span>
                </td>
                <td>{file.modified}</td>
                <td>{file.size ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Form({ outcome }: { outcome: Extract<DemoOutcome, { kind: 'form' }> }) {
  return (
    <div className='oc-form'>
      <p className='oc-form-title'>{outcome.title}</p>
      {outcome.fields.map(field => (
        <div key={field.label} className='oc-form-field'>
          <p>
            {field.label} <span aria-hidden='true'>*</span>
          </p>
          <div>{field.value}</div>
        </div>
      ))}
      <span className='oc-form-submit'>Submit</span>
    </div>
  )
}

function Record({ outcome }: { outcome: Extract<DemoOutcome, { kind: 'record' }> }) {
  return (
    <div className='oc-record' data-app={outcome.app}>
      <div className='oc-record-head'>
        <span>{outcome.title}</span>
        {outcome.badge && (
          <span className='oc-pill' data-value={outcome.badge.toLowerCase()}>
            {outcome.badge}
          </span>
        )}
      </div>
      <dl className='oc-record-fields'>
        {outcome.fields.map(field => (
          <div key={field.label}>
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Chat({ outcome }: { outcome: Extract<DemoOutcome, { kind: 'chat' }> }) {
  return (
    <div className='oc-chat' data-app={outcome.app}>
      <div className='oc-chat-head'>
        {outcome.app === 'VAPI' ? (
          <Phone size={14} aria-hidden='true' />
        ) : (
          <MessageCircle size={14} aria-hidden='true' />
        )}
        {outcome.title}
      </div>
      <ol className='oc-chat-lines'>
        {outcome.lines.map((line, index) => (
          <li key={index} data-from={line.from}>
            {line.text}
          </li>
        ))}
      </ol>
    </div>
  )
}

function Body({ outcome }: { outcome: DemoOutcome }) {
  switch (outcome.kind) {
    case 'email':
      return <Email outcome={outcome} />
    case 'slack':
      return <Slack outcome={outcome} />
    case 'calendar':
      return <Calendar outcome={outcome} />
    case 'form':
      return <Form outcome={outcome} />
    case 'drive':
      return <Drive outcome={outcome} />
    case 'record':
      return <Record outcome={outcome} />
    case 'chat':
      return <Chat outcome={outcome} />
    default:
      return <Grid outcome={outcome} />
  }
}

function AppMark({ outcome }: { outcome: DemoOutcome }): ReactNode {
  const { kind } = outcome

  if (kind === 'record') return <ToolMark tool={MARK[outcome.app]} size={14} />
  if (kind === 'chat') return <MessageCircle size={14} color='#5EB0D6' aria-hidden='true' />
  if (kind === 'email') return <ToolMark tool={MARK.gmail} size={14} />
  if (kind === 'slack') return <ToolMark tool={MARK.slack} size={14} />
  if (kind === 'airtable') return <ToolMark tool={MARK.airtable} size={14} />
  if (kind === 'sheets') return <ToolMark tool={MARK.sheets} size={14} />
  if (kind === 'calendar') return <CalendarDays size={14} color='#4C8BF5' aria-hidden='true' />
  if (kind === 'drive') return <ToolMark tool={MARK['Google Drive']} size={14} />

  return <ClipboardList size={14} color='#3b8fb5' aria-hidden='true' />
}

/** One line under each card saying where it came from in the build. */
const caption = (outcome: DemoOutcome) =>
  `${outcome.kind === 'record' || outcome.kind === 'chat' ? outcome.app : APP_LABEL[outcome.kind]} · from “${outcome.node}”`

/**
 * What the run leaves behind, drawn as each app shows it.
 *
 * `reached` is the set of nodes the current run has finished, or `null` when
 * nothing is running and no run has happened: then every card simply shows the
 * selected input's results. During a run a card stays a placeholder until its
 * node has run, so the results arrive in the order the build produces them.
 */
export function DemoOutcomes({
  outcomes,
  reached,
  subject
}: {
  outcomes: DemoOutcome[]
  reached: Set<string> | null
  subject: string
}) {
  if (outcomes.length === 0) return null

  /*
   * Tables span the row; the rest pair up. An odd number of half-width cards
   * would leave a hole, so the first (usually the tallest, a form or an email)
   * spans two rows and the next two stack beside it.
   */
  const isWide = (outcome: DemoOutcome) => outcome.kind === 'airtable' || outcome.kind === 'sheets'
  const halves = outcomes.filter(outcome => !isWide(outcome))
  const tall = halves.length >= 3 && halves.length % 2 === 1 ? halves[0] : undefined

  // A half-width card on its own would leave the other half empty.
  const lone = halves.length === 1 ? halves[0] : undefined

  return (
    <section className='oc-section' aria-label='Results of the run'>
      <div className='oc-head'>
        <p className='text-accent font-mono text-xs font-medium tracking-[0.2em] uppercase'>THE RESULTS</p>
        <p className='text-ink-3 text-[13px]'>What {subject} leaves behind, as each app shows it. Sample data.</p>
      </div>

      <div className='oc-cards'>
        {outcomes.map((outcome, index) => {
          const ready = !reached || reached.has(outcome.node)

          return (
            <figure
              key={`${outcome.kind}-${index}`}
              className='oc-card'
              data-wide={isWide(outcome) || outcome === lone || undefined}
              data-tall={outcome === tall || undefined}
              data-ready={ready || undefined}
            >
              <figcaption>
                <AppMark outcome={outcome} />
                {caption(outcome)}
              </figcaption>
              <div className='oc-frame'>
                <Body outcome={outcome} />
                {!ready && (
                  <div className='oc-pending'>
                    <Hourglass size={16} aria-hidden='true' />
                    Appears when the run reaches “{outcome.node}”
                  </div>
                )}
              </div>
            </figure>
          )
        })}
      </div>
    </section>
  )
}
