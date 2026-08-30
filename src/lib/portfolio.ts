/**
 * Single source of truth for the landing page's portfolio content.
 *
 * Everything here is real: services and principles are carried over from the
 * previous portfolio build, case studies mirror src/content/case-studies/*.mdx,
 * and the work history is Ramon's actual career. Nothing in this file is
 * invented placeholder copy — if a number appears, it comes from a case study.
 */

export const PROFILE = {
  name: 'Ramon A. Vallejera, Jr.',
  shortName: 'Ramon',
  title: 'AI Automation Specialist',
  credential: 'MBA',
  location: 'Philippines',
  email: 'ramonvallejerajr@gmail.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/ramonaljr' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/ramon-vallejera-jr-mba' },
    { label: 'X', href: 'https://x.com/ramonaljr' }
  ]
} as const

/** Headline figures. Each is traceable to a case study or to work history. */
export const HERO_STATS = [
  { value: '25+ hrs', label: 'manual AP work removed per week' },
  { value: '10 yrs', label: 'finance & business operations' },
  { value: '4', label: 'production pipelines shipped' }
] as const

// ─── Services ────────────────────────────────────────────────────────────────

export type Service = {
  slug: string
  title: string

  /** Short label for cards and sidebars. */
  short: string
  duration: string
  tools: string[]
  description: string

  /** Long-form copy for the dedicated service page. */
  detail: string

  /** What the engagement actually covers. */
  includes: string[]

  /** What you receive at handover. */
  deliverables: { title: string; desc: string }[]

  /** Why this is done well. */
  qualities: string[]
}

export const SERVICES: Service[] = [
  {
    slug: 'n8n-ai-agents',
    title: 'n8n AI Agents & Workflow Automation',
    short: 'n8n AI Agents',
    duration: '1 to 3 weeks',
    tools: ['n8n (Cloud & Self-Hosted)', 'Webhooks', 'Triggers', 'Error Handling'],
    description:
      'I design, build, and deploy production-grade n8n automations and autonomous AI agents that run 24/7, connect your apps, and execute complex multi-step workflows with zero human intervention.',
    detail:
      'n8n is where most of my production work lives. It handles the cases Zapier cannot: branching logic that depends on the data, custom code inside a step, self-hosting when the data cannot leave your infrastructure, and unlimited steps without per-task billing. I build the workflow, run it against your real edge cases, wire up error branches and alerting, and hand it over documented so your team can extend it.',
    includes: [
      'Workflow architecture and node design',
      'Cloud or self-hosted deployment',
      'AI agent steps with tool calling',
      'Try/catch error branches on every path',
      'Failure alerting to Slack, email or Telegram',
      'Credential and environment setup'
    ],
    deliverables: [
      { title: 'The workflow', desc: 'Built, tested against your real data, and running in your own n8n instance — not mine.' },
      { title: 'Exported JSON', desc: 'The full workflow export, so you are never locked to me or to a single instance.' },
      { title: 'Runbook', desc: 'What each branch does, what the failure modes are, and how to recover from each one.' },
      { title: 'Handover walkthrough', desc: 'A recorded session covering how to operate, monitor and extend the workflow.' }
    ],
    qualities: [
      'Error handling designed before the happy path',
      'Deterministic logic kept out of the LLM',
      'Self-hosting supported end to end',
      'No per-task billing surprises',
      'Documented for the person who inherits it',
      'Tested against malformed real-world inputs'
    ]
  },
  {
    slug: 'business-process-automation',
    title: 'End-to-End Business Process Automation',
    short: 'Process Automation',
    duration: '2 to 4 weeks',
    tools: ['CRMs', 'Onboarding', 'Invoicing & AP/AR', 'Approval Flows'],
    description:
      'I eliminate repetitive manual bottlenecks across your entire business — lead management, client onboarding, automated reporting, data validation, and multi-department approval flows.',
    detail:
      'Most manual work is not one task, it is a chain of them: a form arrives, someone checks it, someone else approves it, a record gets created in three systems, a folder gets made, an email goes out. I map that whole chain first — including the exceptions everyone handles from memory — then automate it end to end. Ten years in finance operations means I understand approval thresholds, segregation of duties and audit trails before I touch a node.',
    includes: [
      'Process and SOP mapping workshops',
      'Exception and edge-case cataloguing',
      'Multi-department approval routing',
      'Automated document and folder provisioning',
      'Data validation between systems of record',
      'Human-in-the-loop gates on high-value steps'
    ],
    deliverables: [
      { title: 'Process map', desc: 'The current state documented, including the exceptions that only live in people heads.' },
      { title: 'Automated pipeline', desc: 'The chain running end to end, with approvals routed to the right people.' },
      { title: 'Audit trail', desc: 'Every run logged, so finance and compliance can reconstruct what happened and when.' },
      { title: 'Exception queue', desc: 'A place for the cases the automation should not decide alone, with alerting.' }
    ],
    qualities: [
      'Accounting and approval rules mapped first',
      'Segregation of duties respected',
      'Every run leaves an audit trail',
      'Exceptions surfaced, never silently dropped',
      'Built to survive staff turnover',
      'Rollback path for every automated write'
    ]
  },
  {
    slug: 'llm-rag-integrations',
    title: 'Claude, OpenAI & LLM Integrations (RAG)',
    short: 'LLM & RAG',
    duration: '1 to 3 weeks',
    tools: ['Claude 3.5 Sonnet', 'OpenAI GPT-4o', 'Prompt Engineering', 'RAG'],
    description:
      'I embed frontier LLM intelligence into your daily operations to classify incoming emails, extract structured data from unstructured documents and PDFs, and power secure internal knowledge bases.',
    detail:
      'LLMs are excellent at reading messy input and terrible at arithmetic you depend on. I use them for exactly the first job: pulling structured data out of PDFs, scanned invoices, emails and contracts, and answering questions over your own documents with citations. Numbers, balances and routing decisions stay in deterministic code. Every extraction enforces a JSON schema and carries a confidence score, so low-confidence cases go to a human instead of into your ledger.',
    includes: [
      'Document extraction with enforced JSON schemas',
      'Vector indexing for retrieval over your own docs',
      'Cited answers, so responses are checkable',
      'Confidence scoring and low-confidence routing',
      'Prompt chains version-controlled, not ad hoc',
      'Model choice matched to cost and accuracy needs'
    ],
    deliverables: [
      { title: 'Extraction pipeline', desc: 'Documents in, validated structured data out, with confidence attached to every field.' },
      { title: 'Knowledge base', desc: 'Your documentation indexed and queryable, with citations back to the source.' },
      { title: 'Prompt library', desc: 'The prompts and schemas as versioned artefacts you can review and change.' },
      { title: 'Evaluation set', desc: 'A held-out set of real documents used to measure accuracy before and after changes.' }
    ],
    qualities: [
      'Schema-enforced output, never free text into a database',
      'Confidence thresholds tuned to your risk appetite',
      'Citations on every retrieved answer',
      'Deterministic math kept out of the model',
      'Costs measured per document, not guessed',
      'Fallbacks for low-resolution and handwritten inputs'
    ]
  },
  {
    slug: 'saas-api-integrations',
    title: 'Cross-Platform SaaS & API Integrations',
    short: 'SaaS & API',
    duration: '1 to 2 weeks',
    tools: ['Google Workspace', 'Airtable', 'Notion', 'Slack & Telegram', 'REST APIs'],
    description:
      'I synchronize your disparate software tools into a unified, real-time ecosystem — ensuring clean data flows automatically between spreadsheets, databases, and communication channels.',
    detail:
      'Data drifts the moment it lives in two places. I connect your tools so one system is authoritative and the rest follow it, rather than letting three spreadsheets disagree by Friday. That means idempotent writes so retries do not duplicate records, keyed matching so the same customer is the same customer everywhere, and reconciliation jobs that catch drift the real-time path missed.',
    includes: [
      'One authoritative source of truth per entity',
      'Idempotent writes that survive retries',
      'Keyed matching to prevent duplicate records',
      'Rate limit handling with backoff',
      'Nightly reconciliation and drift reporting',
      'Webhook and polling triggers as appropriate'
    ],
    deliverables: [
      { title: 'Integration map', desc: 'Which system owns which field, and which direction each piece of data flows.' },
      { title: 'Sync pipelines', desc: 'Running connections between your tools, with retry and backoff handled.' },
      { title: 'Reconciliation job', desc: 'A scheduled audit that reports drift rather than letting it accumulate silently.' },
      { title: 'Schema documentation', desc: 'Field mappings written down, so the next change does not start from scratch.' }
    ],
    qualities: [
      'One system of record, never three',
      'Retries cannot create duplicates',
      'API rate limits handled, not hoped around',
      'Drift detected by a scheduled audit',
      'Field mappings documented, not tribal',
      'Works with REST APIs when no connector exists'
    ]
  },
  {
    slug: 'ai-voice-agents',
    title: 'Autonomous AI Voice & Customer Agents',
    short: 'AI Voice Agents',
    duration: '2 to 3 weeks',
    tools: ['VAPI', 'Retell AI', 'ElevenLabs', 'Cal.com', 'WhatsApp & Twilio'],
    description:
      'I build human-like AI voice receptionists and conversational chatbots that handle customer inquiries, qualify inbound prospects, and book confirmed calendar appointments 24/7.',
    detail:
      'A voice agent is judged on latency and on knowing when to stop. I build receptionists that answer in under a second, follow a defined qualification script, check real calendar availability, and book a confirmed slot — then hand off to a human the moment the conversation leaves the script. Every call is transcribed and logged, so you can review what the agent actually said rather than trusting that it behaved.',
    includes: [
      'Low-latency voice pipeline configuration',
      'Qualification script and conversation design',
      'Live calendar availability and booking',
      'Human handoff on out-of-scope requests',
      'Call transcription and logging',
      'SMS or WhatsApp follow-up after the call'
    ],
    deliverables: [
      { title: 'Live voice agent', desc: 'Answering a real number, following your script, booking into your real calendar.' },
      { title: 'Conversation design', desc: 'The script, the branches, and the explicit points where it hands off to a person.' },
      { title: 'Call log', desc: 'Every call transcribed and stored, so you can audit what was actually said.' },
      { title: 'Escalation rules', desc: 'Defined conditions under which the agent stops and a human takes over.' }
    ],
    qualities: [
      'Sub-second response latency targeted',
      'Knows the limits of its own script',
      'Books only into genuinely free slots',
      'Every call transcribed and reviewable',
      'Explicit human handoff, not a dead end',
      'Tested against interruptions and accents'
    ]
  }
]

// ─── Platforms ───────────────────────────────────────────────────────────────

export type Platform = {
  name: string
  primary?: boolean
  tagline: string
  bestFor: string[]
  note: string
}

export const PLATFORMS: Platform[] = [
  {
    name: 'n8n',
    primary: true,
    tagline: 'Complex logic, AI agents, full ownership',
    bestFor: ['Self-hosted & data-sensitive work', 'AI agents and RAG pipelines', 'Custom code inside a workflow', 'Unlimited steps, no per-task billing'],
    note: 'My default, and where most of my production work lives — cloud or self-hosted.'
  },
  {
    name: 'Zapier',
    tagline: 'Fastest path between mainstream SaaS apps',
    bestFor: ['8,000+ app connectors', 'Simple trigger-to-action flows', 'Teams already standardised on it', 'Shipping something this afternoon'],
    note: 'When speed to value matters more than flexibility, Zapier wins.'
  },
  {
    name: 'Make',
    tagline: 'Visual branching and high-volume data ops',
    bestFor: ['Complex routers and iterators', 'High operation volumes, lower cost', 'Visual debugging of each bundle', 'Heavy data transformation'],
    note: 'The middle ground: more power than Zapier, gentler than self-hosting.'
  }
]

// ─── Process ─────────────────────────────────────────────────────────────────

export const PROCESS = [
  {
    step: '01',
    title: 'Map the process',
    desc: 'Before any building, I document your SOPs, edge cases, approval rules and systems of record — so the automation matches how the business actually runs.'
  },
  {
    step: '02',
    title: 'Design the architecture',
    desc: 'I decide what stays deterministic code and what an LLM handles, pick the right platform for the job, and plan the error branches and human review gates up front.'
  },
  {
    step: '03',
    title: 'Build & test against real data',
    desc: 'The workflow is built and run against your real edge cases — malformed PDFs, duplicate records, missing fields — not just the happy path.'
  },
  {
    step: '04',
    title: 'Hand over documented',
    desc: 'You get a documented workflow, alerting on failures, and a walkthrough — so your team can operate and extend it without me.'
  }
]

// ─── Stack ───────────────────────────────────────────────────────────────────

export const STACK = [
  { group: 'Automation', items: ['n8n', 'Zapier', 'Make', 'Webhooks', 'REST APIs'] },
  { group: 'AI & LLM', items: ['Claude 3.5 Sonnet', 'OpenAI GPT-4o', 'DeepSeek', 'RAG', 'Prompt Engineering'] },
  { group: 'Data & Vector', items: ['Pinecone', 'Supabase Vector', 'Airtable', 'Google Sheets', 'PostgreSQL'] },
  { group: 'Business Systems', items: ['QuickBooks', 'Google Workspace', 'Notion', 'Cal.com', 'CRMs'] },
  { group: 'Voice & Messaging', items: ['VAPI', 'Retell AI', 'ElevenLabs', 'Twilio', 'Telegram', 'Slack'] }
]

// ─── Principles ──────────────────────────────────────────────────────────────

export const PRINCIPLES = [
  {
    n: '01',
    title: 'Domain-Driven Process Mapping',
    sub: 'Accounting logic and business rules mapped before building',
    body: "Process-first mapping before code. Invoicing, AP/AR, and GL reconciliations fail when developers don't understand the accounting rules. I map out the SOPs, edge cases, and chart of accounts first."
  },
  {
    n: '02',
    title: 'Deterministic Reliability + LLM Intelligence',
    sub: 'Zero hallucinations on financial numbers and ledgers',
    body: 'Deterministic math, probabilistic AI. Critical calculations, ledger balances, and data routes remain deterministic in code. LLMs are reserved for unstructured document parsing, classification, and extraction.'
  },
  {
    n: '03',
    title: 'Fail-Safe & Human-in-the-Loop Design',
    sub: 'Workflows documented so teams can operate them',
    body: 'Fail-safe architecture with human oversight. Every production workflow includes try/catch error branches, automated alert notifications, and human-in-the-loop review gates for high-value transactions.'
  }
]

// ─── Work history ────────────────────────────────────────────────────────────

export const EXPERIENCE = [
  { company: 'My Mountain Mover', role: 'Financial Analyst' },
  { company: 'Johndorf Ventures Corporation', role: 'Branch Accountant' },
  { company: 'Johndorf Ventures Corporation', role: 'Project Cost Accountant' },
  { company: 'Johndorf Ventures Corporation', role: 'AP Supervisor & Tax Compliance Analyst' }
]

// ─── Engagement models ───────────────────────────────────────────────────────

export const ENGAGEMENTS = [
  {
    name: 'Automation Audit',
    duration: '1 week',
    summary: 'Map what you do manually and what is worth automating.',
    includes: ['Process and SOP mapping', 'Automation opportunity list', 'Platform recommendation', 'Prioritised roadmap'],
    cta: 'Request a quote'
  },
  {
    name: 'Fixed-Scope Build',
    duration: '1 to 4 weeks',
    summary: 'One pipeline, built, tested against real data and documented.',
    includes: ['Architecture and error design', 'Build on n8n, Zapier or Make', 'Testing against your edge cases', 'Documentation and handover'],
    cta: 'Request a quote',
    featured: true
  },
  {
    name: 'Ongoing Retainer',
    duration: 'Monthly',
    summary: 'Keep existing workflows healthy and keep extending them.',
    includes: ['Monitoring and failure alerts', 'Fixes and platform changes', 'New workflows as they come up', 'Priority availability'],
    cta: 'Request a quote'
  }
]
