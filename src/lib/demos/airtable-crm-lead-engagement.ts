import layout from '@/content/demos/airtable-crm-lead-engagement.layout.json'
import { CENTRAL, centralOffset, clock, dayFrom, shortDay } from '@/lib/demos/sample'
import type { DemoBundle, DemoLayout, DemoOutcome, DemoScenario } from '@/lib/demos/types'

/**
 * The lead pipeline of Kestrel Digital, the fictional agency the Zap was built
 * for. Moving a lead to a new stage in Airtable starts the Zap: the filter
 * lets through only a stage it has not handled, the code step works out the
 * greeting ("Dr. Maya Santos" becomes "Dr. Santos") and the owner, step 4
 * claims the stage, and Paths sends the lead down the route for it. Error
 * handlers stay dark: each run here succeeds first time. Emails are the Zap's
 * own text with the sample filled in; the AI emails keep to the Zap's brief.
 */

const LEADS = { file: 'Lead Pipeline', table: 'Leads' }
const COLUMNS = ['Company', 'Contact', 'Stage', 'Handled Stages', 'Pipeline Log']

type Lead = {
  id: string
  company: string
  contact: string
  greeting: string
  email: string
  owner: string
  notes: string
  stage: string
  handled: string[]
  log: string
}

const OWNER = 'Nadia Brooks'

const PATHS = [
  'Path 1: Ready to Start',
  'Path 2: No Response',
  'Path 3: Quoted',
  'Path 4: Approved',
  'Path 5: Paid and Closed',
  'Path 6: Missing Email'
]

const EARLIER = [
  [
    'Ridgeway Builders',
    'Tom Ridge',
    'Quoted',
    'Ready to Start, Quoted',
    'Wed, 04 Nov 2026 11:20:05 -0600 Quoted: quote follow-up sent to tom@ridgewaybuilders.example'
  ],
  [
    'Blue Fern Studio',
    'Ana Cruz',
    'Paid and Closed',
    'Approved, Paid and Closed',
    'Fri, 06 Nov 2026 16:45:52 -0600 Paid and Closed: thank-you email sent to ana@bluefernstudio.example'
  ]
]

/** Zapier's `zap_meta_human_now`: "Sun, 08 Nov 2026 19:51:00 -0600". */
function humanNow(moment: Date) {
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-GB', { timeZone: CENTRAL, ...options }).format(moment)

  const date = moment.toLocaleDateString('en-CA', { timeZone: CENTRAL })

  return `${part({ weekday: 'short' })}, ${part({ day: '2-digit' })} ${part({ month: 'short' })} ${part({ year: 'numeric' })} ${part({ hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} ${centralOffset(new Date(`${date}T12:00:00Z`)).replace(':', '')}`
}

function scenarios(now: Date): DemoScenario[] {
  const stamp = humanNow(now)
  const time = clock(now)
  const later = new Date(now.getTime() + 2 * 86_400_000)
  const laterStamp = humanNow(later)
  const laterTime = `${shortDay(dayFrom(now, 2))}, ${clock(later)}`

  /** The steps every run shares: trigger, filter, code, claim, Paths. */
  function opening(lead: Lead, path: number) {
    const handled = [...lead.handled, lead.stage]

    const record = {
      id: lead.id,
      Company: lead.company,
      Contact: lead.contact,
      Email: lead.email || undefined,
      Owner: lead.owner,
      Notes: lead.notes,
      Stage: lead.stage,
      'Handled Stages': lead.handled,
      'Pipeline Log': lead.log,
      'Stage Changed': now.toISOString()
    }

    return {
      '1. New or Updated Record in Lead Pipeline': { record_id: lead.id, ...record },
      '2. Filter conditions': { passed: true, Stage: lead.stage, 'Handled Stages': lead.handled.join(',') },
      '3. Run Javascript': {
        greeting: lead.greeting,
        owner: lead.owner,
        handled_stages: handled.join(','),
        log_prefix: lead.log ? `${lead.log}\n` : ''
      },
      '4. Update Record': { id: lead.id, fields: { 'Handled Stages': handled } },
      '5. Split into paths': { path: PATHS[path] }
    }
  }

  const prefix = (lead: Lead) => (lead.log ? `${lead.log}\n` : '')
  const sent = (id: string) => ({ id, threadId: id, labelIds: ['SENT'] })

  /** The lead's row in Airtable after the run, with the earlier leads above it. */
  const leadsTable = (lead: Lead, node: string, stage: string, handled: string[], log: string): DemoOutcome => ({
    kind: 'airtable',
    node,
    ...LEADS,
    columns: COLUMNS,
    rows: [...EARLIER, [lead.company, lead.contact, stage, handled.join(', '), log.split('\n').at(-1) ?? '']],
    highlight: EARLIER.length
  })

  // ── Ready to Start: a Drive folder, a content task, the link on the lead ──

  const harbor: Lead = {
    id: 'recH4rb0rP1ne',
    company: 'Harbor & Pine Coffee',
    contact: 'Sofia Reyes',
    greeting: 'Sofia',
    email: 'sofia@harborpine.example',
    owner: OWNER,
    notes: 'Social media retainer, 3 months. Two cafes, launching a third in January.',
    stage: 'Ready to Start',
    handled: ['Approved'],
    log: 'Thu, 05 Nov 2026 10:12:44 -0600 Approved: welcome email sent to sofia@harborpine.example'
  }

  const folder = 'https://drive.google.com/drive/folders/1Hp7cKq2RxVt'
  const readyLog = `${prefix(harbor)}${stamp} Ready to Start: Drive folder and Social Media Content task created.`

  const ready: DemoScenario = {
    id: 'ready',
    label: 'Stage → Ready to Start',
    hint: 'A Drive folder for the client, a Social Media Content task linked to the lead, and the folder link saved on it.',
    branch: { '5. Split into paths': 0 },
    output: {
      ...opening(harbor, 0),
      '6. Path conditions': { passed: true, Stage: 'Ready to Start' },
      '7. Create Folder': {
        id: '1Hp7cKq2RxVt',
        title: harbor.company,
        mimeType: 'application/vnd.google-apps.folder',
        alternateLink: folder
      },
      '13. Create Record': {
        id: 'recT4skSoc1al',
        fields: {
          Task: 'Social Media Content',
          Lead: [harbor.id],
          Notes: `Save drafts and final assets in the client folder: ${folder}`
        }
      },
      '14. Update Record': { id: harbor.id, fields: { 'Drive Folder': folder, 'Pipeline Log': readyLog } }
    },
    outcomes: [
      {
        kind: 'drive',
        node: '7. Create Folder',
        path: ['My Drive', 'Clients'],
        files: [
          { name: harbor.company, type: 'folder', modified: `${time} me` },
          { name: 'Blue Fern Studio', type: 'folder', modified: 'Oct 14 me' },
          { name: 'Ridgeway Builders', type: 'folder', modified: 'Oct 2 me' }
        ],
        added: [0]
      },
      {
        kind: 'airtable',
        node: '13. Create Record',
        ...LEADS,
        table: 'Tasks',
        columns: ['Task', 'Lead', 'Notes'],
        rows: [
          [
            'Social Media Content',
            'Blue Fern Studio',
            'Save drafts and final assets in the client folder: drive.google.com/drive/folders/1Bf…'
          ],
          [
            'Social Media Content',
            harbor.company,
            `Save drafts and final assets in the client folder: ${folder.replace('https://', '')}`
          ]
        ],
        highlight: 1
      },
      leadsTable(harbor, '14. Update Record', 'Ready to Start', [...harbor.handled, 'Ready to Start'], readyLog)
    ]
  }

  // ── No Response: a follow-up now, a nudge if nothing changes in two days ──

  const okafor: Lead = {
    id: 'recOk4f0rDnt',
    company: 'Okafor Family Dental',
    contact: 'Mr. David Okafor',
    greeting: 'Mr. Okafor',
    email: 'david@okafordental.example',
    owner: OWNER,
    notes: 'Website rebuild with online booking. Asked for a proposal on Oct 28.',
    stage: 'No Response',
    handled: [],
    log: ''
  }

  const firstLog = `${stamp} No Response: follow-up email sent to ${okafor.email}`
  const nudgeLog = `${firstLog}\n${laterStamp} No Response: second follow-up sent to ${okafor.email} after 2 days with no reply`

  const noResponse: DemoScenario = {
    id: 'no-response',
    label: 'Stage → No Response',
    hint: 'A follow-up goes out now; two days later the lead is checked again, and still silent, so one nudge follows.',
    branch: { '5. Split into paths': 1 },
    waits: { '19. Delay For': 'Waiting 2 days, then checking the lead again' },
    output: {
      ...opening(okafor, 1),
      '15. Path conditions': { passed: true, Stage: 'No Response', Email: okafor.email },
      '16. Send Email': sent('19b0d1a2c3e4f506'),
      '18. Update Record': { id: okafor.id, fields: { 'Pipeline Log': firstLog } },
      '19. Delay For': { delayed_for: '2 days', resumed_at: later.toISOString() },
      '20. Find Record': {
        id: okafor.id,
        Company: okafor.company,
        Stage: 'No Response',
        'Pipeline Log': firstLog
      },
      '21. Filter conditions': { passed: true, Stage: 'No Response' },
      '22. Send Email': sent('19b0f3d4e5a6b708'),
      '27. Update Record': { id: okafor.id, fields: { 'Pipeline Log': nudgeLog } }
    },
    outcomes: [
      {
        kind: 'email',
        node: '16. Send Email',
        from: OWNER,
        to: okafor.email,
        subject: `Following up: ${okafor.company}`,
        body: `Hi ${okafor.greeting},\n\nI wanted to follow up on my last message about the project for ${okafor.company}. Are you still interested in moving forward?\n\nIf it helps, I am happy to set up a quick 15-minute call this week to answer any questions.\n\nBest regards,\n${OWNER}`,
        time
      },
      {
        kind: 'email',
        node: '22. Send Email',
        from: OWNER,
        to: okafor.email,
        subject: `Should I close your file, ${okafor.greeting}?`,
        body: `Hi ${okafor.greeting},\n\nI have not heard back, so I will assume the timing is not right for ${okafor.company} at the moment. If you would still like to go ahead, just reply to this email and I will pick things up from there.\n\nBest regards,\n${OWNER}`,
        time: laterTime
      },
      leadsTable(okafor, '27. Update Record', 'No Response', ['No Response'], nudgeLog)
    ]
  }

  // ── Approved: AI writes the welcome ───────────────────────────────────────

  const santos: Lead = {
    id: 'recS4nt0sPT',
    company: 'Santos Physical Therapy',
    contact: 'Dr. Maya Santos',
    greeting: 'Dr. Santos',
    email: 'maya@santospt.example',
    owner: OWNER,
    notes: 'Patient intake automation and a new booking page. Proposal approved by email.',
    stage: 'Approved',
    handled: ['Quoted'],
    log: 'Mon, 02 Nov 2026 14:03:10 -0600 Quoted: quote follow-up sent to maya@santospt.example'
  }

  const welcome = `Hi Dr. Santos,\n\nThank you for approving our proposal. We're excited to start work with Santos Physical Therapy.\n\nHere's what happens next. First, we'll set up a short kickoff call to confirm the scope and the timeline, so everyone agrees on what we're building and when. I'll send a few times that work for us; pick whichever suits you best.\n\nWe'll also share a project folder where we'll keep files, drafts and notes in one place. Feel free to add anything you'd like us to see before the call.\n\nIf any questions come up in the meantime, just reply to this email.\n\nBest regards,\n${OWNER}`
  const approvedLog = `${prefix(santos)}${stamp} Approved: welcome email sent to ${santos.email}`

  const approved: DemoScenario = {
    id: 'approved',
    label: 'Stage → Approved',
    hint: 'AI by Zapier writes a welcome under 150 words, addressed to "Dr. Santos", sent from Gmail and logged.',
    branch: { '5. Split into paths': 3 },
    output: {
      ...opening(santos, 3),
      '41. Path conditions': { passed: true, Stage: 'Approved', Email: santos.email },
      '42. Write welcome email': { output: welcome },
      '43. Send Email': sent('19b0e2c3d4f5a617'),
      '48. Update Record': { id: santos.id, fields: { 'Pipeline Log': approvedLog } }
    },
    outcomes: [
      {
        kind: 'email',
        node: '43. Send Email',
        from: OWNER,
        to: santos.email,
        subject: `Welcome aboard, ${santos.company}`,
        body: welcome,
        time
      },
      leadsTable(santos, '48. Update Record', 'Approved', [...santos.handled, 'Approved'], approvedLog)
    ]
  }

  // ── No email on the lead: logged and skipped, stage left unclaimed ────────

  const lark: Lead = {
    id: 'recL4rkB4kry',
    company: 'Lark Street Bakery',
    contact: 'Jo Lark',
    greeting: 'Jo',
    email: '',
    owner: OWNER,
    notes: 'Menu boards and a small online order form.',
    stage: 'Quoted',
    handled: [],
    log: ''
  }

  const skippedLog = `${stamp} Skipped Quoted: no email sent because the Email field is empty. Fill it in, then set the stage again.`

  const missing: DemoScenario = {
    id: 'missing',
    label: 'Stage → Quoted, no email',
    hint: 'No address to write to: nothing is sent, the skip is logged, and the stage is released so it can run again.',
    branch: { '5. Split into paths': 5 },
    output: {
      ...opening(lark, 5),
      '57. Path conditions': { passed: true, Email: '(empty)', Stage: 'Quoted' },
      '58. Update Record': { id: lark.id, fields: { 'Handled Stages': [], 'Pipeline Log': skippedLog } }
    },
    outcomes: [leadsTable(lark, '58. Update Record', 'Quoted', [], skippedLog)]
  }

  return [ready, noResponse, approved, missing]
}

export const airtableCrmLeadEngagement: DemoBundle = { layout: layout as DemoLayout, scenarios }
