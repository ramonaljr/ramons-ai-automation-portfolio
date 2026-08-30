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
  title: string
  duration: string
  tools: string[]
  description: string
}

export const SERVICES: Service[] = [
  {
    title: 'n8n AI Agents & Workflow Automation',
    duration: '1 to 3 weeks',
    tools: ['n8n (Cloud & Self-Hosted)', 'Webhooks', 'Triggers', 'Error Handling'],
    description:
      'I design, build, and deploy production-grade n8n automations and autonomous AI agents that run 24/7, connect your apps, and execute complex multi-step workflows with zero human intervention.'
  },
  {
    title: 'End-to-End Business Process Automation',
    duration: '2 to 4 weeks',
    tools: ['CRMs', 'Onboarding', 'Invoicing & AP/AR', 'Approval Flows'],
    description:
      'I eliminate repetitive manual bottlenecks across your entire business — lead management, client onboarding, automated reporting, data validation, and multi-department approval flows.'
  },
  {
    title: 'Claude, OpenAI & LLM Integrations (RAG)',
    duration: '1 to 3 weeks',
    tools: ['Claude 3.5 Sonnet', 'OpenAI GPT-4o', 'Prompt Engineering', 'RAG'],
    description:
      'I embed frontier LLM intelligence into your daily operations to classify incoming emails, extract structured data from unstructured documents and PDFs, and power secure internal knowledge bases.'
  },
  {
    title: 'Cross-Platform SaaS & API Integrations',
    duration: '1 to 2 weeks',
    tools: ['Google Workspace', 'Airtable', 'Notion', 'Slack & Telegram', 'REST APIs'],
    description:
      'I synchronize your disparate software tools into a unified, real-time ecosystem — ensuring clean data flows automatically between spreadsheets, databases, and communication channels.'
  },
  {
    title: 'Autonomous AI Voice & Customer Agents',
    duration: '2 to 3 weeks',
    tools: ['VAPI', 'Retell AI', 'ElevenLabs', 'Cal.com', 'WhatsApp & Twilio'],
    description:
      'I build human-like AI voice receptionists and conversational chatbots that handle customer inquiries, qualify inbound prospects, and book confirmed calendar appointments 24/7.'
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
