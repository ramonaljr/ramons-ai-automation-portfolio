import layout from '@/content/demos/solar-lead-scoring-follow-up.layout.json'
import { clock, minutesFrom } from '@/lib/demos/sample'
import type { DemoBundle, DemoLayout, DemoScenario } from '@/lib/demos/types'

/**
 * Inbound leads for Voltara, the commercial solar installer named in the build.
 *
 * The website form posts to a webhook; the AI only reads the enquiry, and the
 * score, tier and rep come from fixed rules. A 5-minute schedule hands leads
 * nobody acknowledged in time to the sales manager. Field names are the
 * build's own (the AI's schema, the Leads table, the Lead Log). Companies,
 * people and figures are made up.
 */

const BASE = { file: 'Voltara Leads', table: 'Leads' }
const LEADS_COLUMNS = ['name', 'company', 'score', 'tier', 'assignedRep', 'status']
const LOG_COLUMNS = ['receivedAt', 'company', 'intent', 'score', 'tier', 'assignedRep']

const EARLIER_LEADS = [
  ['Tom Reid', 'Reid Cold Storage', 71, 'enterprise', 'Alicia Gomez', 'contacted'],
  ['Nina Patel', 'Patel Family Dental', 48, 'smb', 'Ben Carter', 'contacted']
]

function scenarios(now: Date): DemoScenario[] {
  const receivedAt = now.toISOString()
  const ackDueAt = minutesFrom(now, 15)
  const ackDueLocal = clock(new Date(now.getTime() + 15 * 60_000))
  const logTime = receivedAt.slice(0, 16).replace('T', ' ')

  const form = {
    name: 'Rachel Moore',
    email: 'rachel.moore@moorelogistics.example',
    phone: '+1 619 555 0134',
    company: 'Moore Logistics',
    message:
      'We run a 120,000 sq ft distribution warehouse and our power bill keeps climbing, about 85,000 kWh a month. Flat roof, about 6 years old, and we own the building. Can someone come out and look at it this month?',
    country: 'US',
    source: 'website',
    consent: true,
    propertyType: 'Warehouse',
    monthlyKwh: 85000,
    roofType: 'Flat',
    siteOwnership: 'Own',
    roofAgeYears: 6,
    utilityProvider: 'SDG&E'
  }

  const read = {
    intent: 'site_assessment',
    urgency: 'high',
    budgetSignal: 'implied',
    propertyType: 'Warehouse',
    roofType: 'Flat',
    siteOwnership: 'Own',
    monthlyKwh: 85000,
    painPoint: 'power bill keeps climbing',
    confidence: 0.93
  }

  const reasons = [
    'Asked for a site assessment',
    'Owns the building',
    'High usage (85,000 kWh/month)',
    'Flat roof under 10 years',
    'Wants it this month'
  ]

  const scoredLead = {
    ...form,
    ...read,
    score: 86,
    tier: 'enterprise',
    tierLabel: 'Large business',
    intentLabel: 'Site assessment',
    estimatedSystemKw: 480,
    reasons,
    ackDueAt,
    ackDueLocal,
    receivedAfterHours: false,
    receivedAt
  }

  const rep = { repName: 'Alicia Gomez', repEmail: 'alicia.gomez@voltara.example', slackUserId: '' }
  const reply = `Thanks for the detail on the warehouse. A power bill that keeps climbing on a large flat roof you own is exactly the kind of site we look at first. Alicia Gomez from our commercial team will be in touch to arrange a site assessment this month.`

  const hot: DemoScenario = {
    id: 'hot',
    label: 'Moore Logistics · large site',
    hint: 'Scores 86: replied to in seconds, assigned to a rep, and the rep alerted in Slack.',
    output: {
      'New Lead From Website Form': { body: form, headers: { 'content-type': 'application/json' } },
      'Clean Up Form Data': { ...form, receivedAt, executionId: '20931' },
      'Name & Email Valid?': form,
      'Reply To Form - Received': {
        accepted: true,
        message: 'Thanks - we have your enquiry and a specialist will be in touch shortly.'
      },
      'Find Existing Lead Record': {},
      'Find Existing Lead': { hasPriorRecord: false },
      'AI Model - Read Enquiry': { model: 'gpt-4o-mini', tokenUsage: { promptTokens: 702, completionTokens: 96 } },
      'AI Reads Enquiry': { output: read },
      'Score And Tier Lead': scoredLead,
      'Route By Lead Type': scoredLead,
      'Find Rep Record': {
        id: 'recRepAlicia',
        fields: { repName: rep.repName, repEmail: rep.repEmail, tiers: ['enterprise'] }
      },
      'Assign Rep': rep,
      'Save Lead To Airtable': {
        id: 'recMooreLogistics',
        fields: {
          email: form.email,
          name: form.name,
          company: form.company,
          intent: read.intent,
          urgency: read.urgency,
          score: 86,
          tier: 'enterprise',
          assignedRep: rep.repName,
          assignedRepEmail: rep.repEmail,
          status: 'awaiting_ack',
          ackDueAt
        }
      },
      'AI Model - Write Reply': { model: 'gpt-4o-mini', tokenUsage: { promptTokens: 540, completionTokens: 71 } },
      'AI Writes Reply Email': { text: reply },
      'Email Reply To Lead': { id: '19b0c7d2a4e0f1b9', labelIds: ['SENT'] },
      'Alert Rep In Slack': { ok: true, channel: 'solar-leads', ts: '1762654010.000300' },
      'Save To Lead Log': {
        receivedAt,
        company: form.company,
        intent: read.intent,
        score: 86,
        tier: 'enterprise',
        assignedRep: rep.repName
      },
      'Rep Found?': rep,
      'Update Rep Last Assigned Time': { repEmail: rep.repEmail, lastAssignedAt: receivedAt }
    },
    outcomes: [
      {
        kind: 'email',
        node: 'Email Reply To Lead',
        from: rep.repName,
        to: form.email,
        subject: `Re: your enquiry - ${form.company}`,
        body: `Hi ${form.name},\n\n${reply}\n\nBest,\n${rep.repName}`,
        time: clock(now)
      },
      {
        kind: 'slack',
        node: 'Alert Rep In Slack',
        channel: 'solar-leads',
        app: 'n8n',
        time: 'just now',
        text: [
          ':sunny: *New Large business solar lead - score 86/100*',
          `Assigned to: ${rep.repName}`,
          '',
          `*${form.name}* at *${form.company}*`,
          `${form.email} | ${form.phone}`,
          '',
          'Building: Warehouse | Own or rent: Own',
          'Electricity use: 85000 kWh/month',
          'Rough system size: ~480 kW *(estimate only, not a quote)*',
          'Roof: Flat, 6 years old',
          '',
          'What they want: Site assessment | How urgent: high',
          `Why this score: ${reasons.join(', ')}`,
          '',
          `*Mark this lead as contacted in Airtable by ${ackDueLocal}*, or it goes to the sales manager.`
        ]
      },
      {
        kind: 'airtable',
        node: 'Save Lead To Airtable',
        ...BASE,
        columns: LEADS_COLUMNS,
        rows: [...EARLIER_LEADS, [form.name, form.company, 86, 'enterprise', rep.repName, 'awaiting_ack']],
        highlight: 2
      },
      {
        kind: 'sheets',
        node: 'Save To Lead Log',
        file: 'Lead Automation',
        table: 'Lead Log',
        columns: LOG_COLUMNS,
        rows: [[logTime, form.company, read.intent, 86, 'enterprise', rep.repName]],
        highlight: 0
      }
    ]
  }

  const pitch = {
    name: 'Kevin Brooks',
    email: 'kevin@panelpartners.example',
    phone: '',
    company: 'Panel Partners Wholesale',
    message: 'We supply tier-1 panels at trade prices and would love to be on your approved supplier list.',
    country: 'US',
    source: 'website',
    consent: true
  }

  const pitchRead = { intent: 'supplier_pitch', urgency: 'low', budgetSignal: 'none', painPoint: '', confidence: 0.97 }

  const pitchScored = {
    ...pitch,
    ...pitchRead,
    score: 8,
    tier: 'nurture',
    tierLabel: 'Low priority',
    reasons: ['Not a sales enquiry (supplier pitch)'],
    receivedAt
  }

  const low: DemoScenario = {
    id: 'low',
    label: 'Supplier pitch · low priority',
    hint: 'Not a customer: logged as low priority, no rep is pulled away from real leads.',
    branch: { 'Route By Lead Type': 1 },
    output: {
      'New Lead From Website Form': { body: pitch },
      'Clean Up Form Data': { ...pitch, receivedAt },
      'Name & Email Valid?': pitch,
      'Reply To Form - Received': {
        accepted: true,
        message: 'Thanks - we have your enquiry and a specialist will be in touch shortly.'
      },
      'Find Existing Lead Record': {},
      'Find Existing Lead': { hasPriorRecord: false },
      'AI Model - Read Enquiry': { model: 'gpt-4o-mini', tokenUsage: { promptTokens: 611, completionTokens: 52 } },
      'AI Reads Enquiry': { output: pitchRead },
      'Score And Tier Lead': pitchScored,
      'Route By Lead Type': pitchScored,
      'Save As Low-Priority Lead': {
        id: 'recPanelPartners',
        fields: { email: pitch.email, company: pitch.company, score: 8, tier: 'nurture', status: 'nurture' }
      },
      'Save To Lead Log': {
        receivedAt,
        company: pitch.company,
        intent: 'supplier_pitch',
        score: 8,
        tier: 'nurture',
        assignedRep: 'none'
      }
    },
    outcomes: [
      {
        kind: 'airtable',
        node: 'Save As Low-Priority Lead',
        ...BASE,
        columns: LEADS_COLUMNS,
        rows: [...EARLIER_LEADS, [pitch.name, pitch.company, 8, 'nurture', '', 'nurture']],
        highlight: 2
      },
      {
        kind: 'sheets',
        node: 'Save To Lead Log',
        file: 'Lead Automation',
        table: 'Lead Log',
        columns: LOG_COLUMNS,
        rows: [[logTime, pitch.company, 'supplier_pitch', 8, 'nurture', 'none']],
        highlight: 0
      }
    ]
  }

  const overdue = {
    id: 'recHarbourBrew',
    name: 'Sam Ortiz',
    company: 'Harbour Brewing Co',
    email: 'sam@harbourbrewing.example',
    tier: 'smb',
    score: 58,
    status: 'awaiting_ack',
    assignedRep: 'Ben Carter',
    ackDueAt: minutesFrom(now, -4)
  }

  const manager = { repName: 'Dana Ruiz', repEmail: 'dana.ruiz@voltara.example' }

  const escalate: DemoScenario = {
    id: 'escalate',
    label: 'Every 5 min · not followed up',
    hint: 'A lead passed its 15 minutes without contact: it goes to the sales manager.',
    output: {
      'Every 5 Minutes': { timestamp: receivedAt },
      'Lookup Sales Manager Record': { id: 'recRepDana', fields: { ...manager, role: 'manager' } },
      'Lookup Sales Manager': manager,
      'Find Overdue Lead Records': { id: overdue.id, fields: overdue },
      'Find Overdue Leads': overdue,
      'Reassign To Manager': {
        id: overdue.id,
        fields: {
          email: overdue.email,
          status: 'escalated',
          escalatedAt: receivedAt,
          previousRep: overdue.assignedRep,
          assignedRep: manager.repName,
          assignedRepEmail: manager.repEmail
        }
      },
      'Alert - Lead Not Followed Up': { ok: true, channel: 'solar-leads', ts: '1762654301.000700' },
      'Save To Escalation Log': {
        escalatedAt: receivedAt,
        email: overdue.email,
        company: overdue.company,
        tier: overdue.tier,
        score: overdue.score,
        originalRep: overdue.assignedRep,
        escalatedTo: manager.repName,
        reason: 'Rep did not follow up',
        ackDueAt: overdue.ackDueAt,
        executionId: '20977'
      }
    },
    outcomes: [
      {
        kind: 'slack',
        node: 'Alert - Lead Not Followed Up',
        channel: 'solar-leads',
        app: 'n8n',
        time: 'just now',
        text: [
          ':rotating_light: *Lead not followed up in time - sending to manager*',
          '',
          `*${overdue.name}* at *${overdue.company}*`,
          `Lead type: ${overdue.tier} | Score: ${overdue.score}/100`,
          overdue.email,
          '',
          `Was assigned to: ${overdue.assignedRep}`,
          `Now assigned to: ${manager.repName}`,
          `Follow-up was due: ${overdue.ackDueAt}`
        ]
      },
      {
        kind: 'airtable',
        node: 'Reassign To Manager',
        ...BASE,
        columns: LEADS_COLUMNS,
        rows: [
          ...EARLIER_LEADS,
          [overdue.name, overdue.company, overdue.score, overdue.tier, manager.repName, 'escalated']
        ],
        highlight: 2
      },
      {
        kind: 'sheets',
        node: 'Save To Escalation Log',
        file: 'Lead Automation',
        table: 'Escalation Log',
        columns: ['escalatedAt', 'company', 'tier', 'score', 'originalRep', 'escalatedTo', 'reason', 'ackDueAt'],
        rows: [
          [
            minutesFrom(now, -3 * 24 * 60)
              .slice(0, 16)
              .replace('T', ' '),
            'Coastal Self Storage',
            'smb',
            52,
            'Ben Carter',
            manager.repName,
            'Rep did not follow up',
            minutesFrom(now, -3 * 24 * 60 - 20)
              .slice(0, 16)
              .replace('T', ' ')
          ],
          [
            receivedAt.slice(0, 16).replace('T', ' '),
            overdue.company,
            overdue.tier,
            overdue.score,
            overdue.assignedRep,
            manager.repName,
            'Rep did not follow up',
            String(overdue.ackDueAt).slice(0, 16).replace('T', ' ')
          ]
        ],
        highlight: 1
      }
    ]
  }

  return [hot, low, escalate]
}

export const solarLeadScoringFollowUp: DemoBundle = {
  layout: layout as DemoLayout,
  scenarios
}
