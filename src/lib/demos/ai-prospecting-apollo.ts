import layout from '@/content/demos/ai-prospecting-apollo.layout.json'
import type { DemoBundle, DemoLayout, DemoScenario } from '@/lib/demos/types'

/**
 * Prospecting for Harbourline Payroll Services, the client named in the build.
 *
 * Two entry points: the request form that finds, scores and drafts, and the
 * 15-minute schedule that moves rows marked "approved" into Pipedrive. Field
 * names are the build's own (the form's fields, the Prospects sheet's
 * columns, the AI's schema). People and companies are made up.
 */

type Prospect = {
  apolloId: string
  firstName: string
  lastName: string
  title: string
  company: string
  website: string
  industry: string
  employees: number
  city: string
  score: number
  reasons: string
  status: 'pending_review' | 'low_fit'
  companySummary: string
  relevantHook: string
  subjectLine: string
}

const CAMPAIGN = 'Cebu SMEs - Q4'
const SENDER = 'Joanna Reyes'

const PROSPECTS: Prospect[] = [
  {
    apolloId: '64f1a0c2e9b8d70001a3c511',
    firstName: 'Paolo',
    lastName: 'Villanueva',
    title: 'Owner',
    company: 'Coldlink Cebu Logistics',
    website: 'https://coldlinkcebu.example',
    industry: 'logistics & supply chain',
    employees: 85,
    city: 'Cebu City',
    score: 88,
    reasons: 'Decision-maker title, Target industry, 51-200 employees, Verified email',
    status: 'pending_review',
    companySummary: 'Cold-chain trucking and storage for food exporters across the Visayas.',
    relevantHook: 'Opening a second warehouse in Mandaue this quarter',
    subjectLine: 'Payroll for your Mandaue warehouse team'
  },
  {
    apolloId: '64f1a0c2e9b8d70001a3c6f0',
    firstName: 'Liza',
    lastName: 'Tan',
    title: 'Head of HR',
    company: 'Islas Packaging Corp',
    website: 'https://islaspackaging.example',
    industry: 'packaging & containers',
    employees: 140,
    city: 'Mandaue',
    score: 74,
    reasons: 'HR leader, Target industry, 51-200 employees, Verified email',
    status: 'pending_review',
    companySummary: 'Corrugated box maker supplying Cebu furniture and food exporters.',
    relevantHook: 'Hiring 30 line staff for a new night shift',
    subjectLine: 'Night-shift payroll without the overtime errors'
  },
  {
    apolloId: '64f1a0c2e9b8d70001a3c7a2',
    firstName: 'Ramon',
    lastName: 'Cruz',
    title: 'Finance Manager',
    company: 'Mactan Retail Group',
    website: 'https://mactanretail.example',
    industry: 'retail',
    employees: 60,
    city: 'Lapu-Lapu',
    score: 66,
    reasons: 'Finance title, Target industry, 51-200 employees, Verified email',
    status: 'pending_review',
    companySummary: 'Four convenience stores around the Mactan airport.',
    relevantHook: 'Fifth store opening near the new terminal',
    subjectLine: 'One payroll for five stores'
  },
  {
    apolloId: '64f1a0c2e9b8d70001a3c8d4',
    firstName: 'Jun',
    lastName: 'Abella',
    title: 'Operations Supervisor',
    company: 'Talisay Hardware',
    website: 'https://talisayhardware.example',
    industry: 'retail',
    employees: 22,
    city: 'Talisay',
    score: 41,
    reasons: 'Not a decision-maker, 11-50 employees, Held back: no verified email',
    status: 'low_fit',
    companySummary: 'Family-run hardware store.',
    relevantHook: '',
    subjectLine: ''
  }
]

const row = (p: Prospect) => ({
  apolloId: p.apolloId,
  campaign: CAMPAIGN,
  firstName: p.firstName,
  lastName: p.lastName,
  fullName: `${p.firstName} ${p.lastName}`,
  title: p.title,
  email: p.status === 'low_fit' ? '' : `${p.firstName.toLowerCase()}@${new URL(p.website).hostname}`,
  emailStatus: p.status === 'low_fit' ? 'unavailable' : 'verified',
  city: p.city,
  country: 'Philippines',
  company: p.company,
  website: p.website,
  industry: p.industry,
  employees: p.employees,
  score: p.score,
  reasons: p.reasons
})

const draft = (p: Prospect) =>
  p.subjectLine
    ? {
        companySummary: p.companySummary,
        relevantHook: p.relevantHook,
        subjectLine: p.subjectLine,
        emailBody: `Hi ${p.firstName},\n\nSaw that ${p.company} is ${p.relevantHook.charAt(0).toLowerCase()}${p.relevantHook.slice(1)}. Harbourline runs payroll and HR admin for Cebu SMEs, so new hires are paid right from their first cut-off.\n\nWorth a 15-minute call next week?`,
        usedWebsite: true,
        confidence: 0.82
      }
    : {
        companySummary: p.companySummary,
        relevantHook: '',
        subjectLine: '',
        emailBody: '',
        usedWebsite: false,
        confidence: 0.4
      }

function scenarios(now: Date): DemoScenario[] {
  const startedAt = now.toISOString()
  const scored = PROSPECTS.map(row)
  const finals = PROSPECTS.map(p => ({ ...row(p), ...draft(p), senderName: SENDER, status: p.status }))
  const review = PROSPECTS.filter(p => p.status === 'pending_review')

  const request = {
    'Campaign name': CAMPAIGN,
    'Job titles (comma-separated)': 'Owner, Founder, Managing Director, Head of HR, Finance Manager',
    'Locations (comma-separated)': 'Cebu, Philippines',
    'Company size (employees)': '51-200',
    'Industry keywords (comma-separated)': 'logistics, packaging, retail',
    'What are we offering? (one sentence)': 'Outsourced payroll and HR admin for growing SMEs',
    'Sender name for the email': SENDER,
    'Max new prospects to enrich (uses Apollo credits)': 4
  }

  const columns = ['fullName', 'title', 'company', 'score', 'status', 'subjectLine']

  const sheetRow = (p: Prospect, status: string = p.status) => [
    `${p.firstName} ${p.lastName}`,
    p.title,
    p.company,
    p.score,
    status,
    p.subjectLine
  ]

  const find: DemoScenario = {
    id: 'find',
    label: 'New run · Cebu SMEs',
    hint: 'Search, skip known prospects, enrich, score, research and draft, then a Slack digest.',
    branch: { 'Anything To Enrich?': 0 },
    output: {
      'Prospecting Request Form': { ...request, submittedAt: startedAt, formMode: 'production' },
      'Clean Up Request': {
        campaignName: CAMPAIGN,
        jobTitles: ['Owner', 'Founder', 'Managing Director', 'Head of HR', 'Finance Manager'],
        locations: ['Cebu, Philippines'],
        employeeRange: '51,200',
        minEmployees: 51,
        maxEmployees: 200,
        industryKeywords: 'logistics, packaging, retail',
        offer: request['What are we offering? (one sentence)'],
        senderName: SENDER,
        maxToEnrich: 4,
        startedAt
      },
      'Apollo - Search People': {
        pagination: { page: 1, per_page: 25, total_entries: 9 },
        people: PROSPECTS.map(p => ({ id: p.apolloId, first_name: p.firstName, title: p.title }))
      },
      'Load Known Prospects': [{ apolloId: '64f1a0c2e9b8d70001a3b902', status: 'approved' }],
      'Shortlist New Prospects': { ids: PROSPECTS.map(p => p.apolloId), skippedKnown: 1 },
      'Anything To Enrich?': { ids: PROSPECTS.map(p => p.apolloId) },
      'Apollo - Enrich Contacts': { status: 'success', matches: PROSPECTS.map(p => ({ id: p.apolloId })) },
      'Flatten & Score Leads': scored,
      'Fetch Company Website': PROSPECTS.map(p => ({ url: p.website, statusCode: 200 })),
      'Prepare Website Text': scored.map(s => ({ ...s, websiteText: `${s.company} · ${s.industry} · ${s.city}` })),
      'AI Model - Write Email': { model: 'gpt-4o-mini', tokenUsage: { promptTokens: 5120, completionTokens: 860 } },
      'AI Researches & Drafts Email': PROSPECTS.map(p => ({ output: draft(p) })),
      'Set Final Status': finals,
      'Save To Prospects Sheet': finals.map(f => ({ ...f, createdAt: startedAt })),
      'Build Review Digest': {
        campaign: CAMPAIGN,
        total: 4,
        reviewCount: 3,
        lowFitCount: 1,
        lines: review
          .map(p => `- *${p.firstName} ${p.lastName}* - ${p.title}, ${p.company} (${p.score}/100)`)
          .join('\n')
      },
      'Slack - Review Digest': { ok: true, channel: 'prospecting', ts: '1762651032.000400' }
    },
    outcomes: [
      {
        kind: 'form',
        node: 'Prospecting Request Form',
        title: 'Harbourline Payroll Services - New Prospecting Run',
        fields: Object.entries(request).map(([label, value]) => ({ label, value: String(value) }))
      },
      {
        kind: 'slack',
        node: 'Slack - Review Digest',
        channel: 'prospecting',
        app: 'n8n',
        time: 'just now',
        text: [
          `:dart: *New prospects ready for review* - ${CAMPAIGN}`,
          '3 to review | 1 held back (low fit or no verified email)',
          '',
          ...review.map(p => `- *${p.firstName} ${p.lastName}* - ${p.title}, ${p.company} (${p.score}/100)`),
          '',
          'Open the *Prospecting* Google Sheet > *Prospects* tab. Change *status* to *approved* for anyone worth contacting - they’re added to Pipedrive within 15 minutes.'
        ]
      },
      {
        kind: 'sheets',
        node: 'Save To Prospects Sheet',
        file: 'Prospecting',
        table: 'Prospects',
        columns,
        rows: PROSPECTS.map(p => sheetRow(p)),
        highlight: 0
      }
    ]
  }

  const paolo = PROSPECTS[0]
  const approved = { ...finals[0], status: 'approved' }
  const dealId = 4182

  const crm: DemoScenario = {
    id: 'crm',
    label: 'Every 15 min · approved → Pipedrive',
    hint: 'Paolo was marked approved in the sheet: organisation, person and deal are created.',
    branch: {
      'Loop Over Prospects': [1, 0],
      'Org Exists?': 1,
      'Person Exists?': 1
    },
    output: {
      'Every 15 Minutes': { timestamp: startedAt },
      'Find Approved Prospects': [approved],
      'Loop Over Prospects': [approved],
      'Row Ready For CRM?': approved,
      'Find Org In Pipedrive': {},
      'Org Exists?': {},
      'Create Org In Pipedrive': { id: 912, name: paolo.company },
      'Remember Org ID': { orgId: 912 },
      'Find Person In Pipedrive': {},
      'Person Exists?': {},
      'Create Person In Pipedrive': { id: 3307, name: approved.fullName, org_id: 912 },
      'Remember Person ID': { personId: 3307 },
      'Create Deal': {
        id: dealId,
        title: `${paolo.company} - ${CAMPAIGN}`,
        org_id: 912,
        person_id: 3307,
        status: 'open'
      },
      'Mark As In CRM': { apolloId: paolo.apolloId, status: 'in_crm', pipedriveDealId: dealId, crmAt: startedAt },
      'Pin Research & Email To Deal': { id: 77120, deal_id: dealId, pinned_to_deal_flag: true },
      'Slack - Added To CRM': { ok: true, channel: 'prospecting', ts: '1762651941.000200' }
    },
    outcomes: [
      {
        kind: 'record',
        node: 'Create Deal',
        app: 'Pipedrive',
        title: `${paolo.company} - ${CAMPAIGN}`,
        badge: 'Open',
        fields: [
          { label: 'Person', value: approved.fullName },
          { label: 'Organisation', value: paolo.company },
          { label: 'Pipeline stage', value: 'Lead in' },
          { label: 'Pinned note', value: `Suggested first email: “${paolo.subjectLine}”` },
          { label: 'Score', value: `${paolo.score}/100` },
          { label: 'Hook', value: paolo.relevantHook }
        ]
      },
      {
        kind: 'slack',
        node: 'Slack - Added To CRM',
        channel: 'prospecting',
        app: 'n8n',
        time: 'just now',
        text: [
          ':handshake: *Approved prospects processed: 1* - each valid one now has a Pipedrive deal with the suggested first email pinned as a note. Review and send from Pipedrive.'
        ]
      },
      {
        kind: 'sheets',
        node: 'Mark As In CRM',
        file: 'Prospecting',
        table: 'Prospects',
        columns,
        rows: [sheetRow(paolo, 'in_crm'), ...PROSPECTS.slice(1).map(p => sheetRow(p))],
        highlight: 0
      }
    ]
  }

  return [find, crm]
}

export const aiProspectingApollo: DemoBundle = {
  layout: layout as DemoLayout,
  scenarios
}
