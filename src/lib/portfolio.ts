/**
 * Single source of truth for the landing page's portfolio content.
 *
 * Everything here is real: services and principles are carried over from the
 * previous portfolio build, case studies mirror src/content/case-studies/*.mdx,
 * and the work history is Ramon's actual career. Nothing in this file is
 * invented placeholder copy — if a number appears, it comes from a case study.
 */

export const PROFILE = {
  // One public name and one title, everywhere. The full legal name is kept for
  // structured data, so the CV and LinkedIn still match this site.
  name: 'Ramon Vallejera Jr.',
  legalName: 'Ramon A. Vallejera, Jr.',
  shortName: 'Ramon',
  title: 'AI Automation Engineer',
  audience: 'finance & operations teams',
  credential: 'MBA',
  location: 'Philippines',
  email: 'ramonvallejerajr@gmail.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/ramonaljr' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ramon-vallejera-jr-mba-6976a3115' },
    { label: 'Upwork', href: 'https://www.upwork.com/freelancers/~01b91218e9b141a711' }
  ],

  /** Served from public/. Swap the file, keep the path. */
  cv: '/ramon-vallejera-cv.pdf'
} as const

/**
 * Headline figures. Each is traceable to Selected Work, work history or the
 * profile. The system count is the number of case studies, passed in by the
 * page, so it cannot drift from Selected Work. No measured time savings are
 * claimed until a client result backs one.
 */
export const heroStats = (systems: number) => [
  { value: String(systems), label: 'complete n8n systems built, end to end' },
  { value: '10 yrs', label: 'running business operations' },
  { value: 'MBA', label: 'business thinking behind every build' }
]

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
    short: 'Workflow Automation',
    duration: '1 to 3 weeks',
    tools: ['n8n (cloud or your own server)', 'Instant triggers', 'Scheduled runs', 'Error alerts'],
    description:
      'Reliable n8n automations and AI assistants that run around the clock, connect your apps, and carry multi-step work through without anyone pushing it along.',
    detail:
      'n8n is where most of my work is built. It handles what simpler tools like Zapier cannot: decisions that depend on the data, custom steps, running on your own server when data must not leave your business, and unlimited steps without paying per task. I build the workflow, test it against the unusual cases your business really sees, add error handling and alerts, and hand it over documented so your team can extend it.',
    includes: [
      'Workflow design, step by step',
      'Set up in n8n cloud or on your own server',
      'AI steps that can use your other tools',
      'A backup plan for every step that can fail',
      'Failure alerts to Slack, email or Telegram',
      'Secure setup of logins and settings'
    ],
    deliverables: [
      {
        title: 'The workflow',
        desc: 'Built, tested with your real data, and running in your own n8n account — not mine.'
      },
      {
        title: 'Backup copy',
        desc: 'A full export of the workflow, so you are never tied to me or to one account.'
      },
      {
        title: 'Instruction guide',
        desc: 'What each part does, what can go wrong, and how to recover from each problem.'
      },
      {
        title: 'Handover walkthrough',
        desc: 'A recorded session showing how to run, check and extend the workflow.'
      }
    ],
    qualities: [
      'Plans for errors before anything else',
      'Fixed rules, not AI, for anything that must be exact',
      'Can run entirely on your own server',
      'No surprise per-task charges',
      'Documented for whoever takes it over',
      'Tested with messy real-world data'
    ]
  },
  {
    slug: 'business-process-automation',
    title: 'End-to-End Business Process Automation',
    short: 'Process Automation',
    duration: '2 to 4 weeks',
    tools: ['CRMs', 'Onboarding', 'Invoices & payments', 'Approvals'],
    description:
      'The repetitive bottlenecks come out of your business from start to finish — lead management, client onboarding, automatic reports, data checks and approvals across departments.',
    detail:
      'Most manual work is not one task, it is a chain of them: a form arrives, someone checks it, someone else approves it, a record gets created in three systems, a folder gets made, an email goes out. I map that whole chain first — including the unusual cases everyone handles from memory — then automate it from start to finish. Ten years in finance operations means I understand approval limits, keeping duties separate so no one person controls a payment, and keeping a record of every step, before I build anything.',
    includes: [
      'Workshops to map how the work is done today',
      'A list of every unusual case and exception',
      'Approvals routed across departments',
      'Documents and folders created automatically',
      'Data checked between your systems',
      'A person signs off on high-value steps'
    ],
    deliverables: [
      {
        title: 'Process map',
        desc: 'How the work runs today, written down, including the exceptions that only live in people\u2019s heads.'
      },
      {
        title: 'Automated process',
        desc: 'The chain running from start to finish, with approvals sent to the right people.'
      },
      {
        title: 'Activity record',
        desc: 'Every run is recorded, so finance and compliance can see what happened and when.'
      },
      { title: 'Review list', desc: 'A place for the cases the automation should not decide alone, with alerts.' }
    ],
    qualities: [
      'Accounting and approval rules mapped first',
      'No one person controls a payment alone',
      'Every run leaves a record',
      'Unusual cases flagged, never silently dropped',
      'Keeps working when staff change',
      'Every automatic change can be undone'
    ]
  },
  {
    slug: 'llm-rag-integrations',
    title: 'Claude & OpenAI for Documents and Company Knowledge',
    short: 'AI Document Answers',
    duration: '1 to 3 weeks',
    tools: ['Claude', 'OpenAI', 'Prompt writing', 'Document search'],
    description:
      'Leading AI models inside your daily operations: incoming email sorted, details pulled out of messy documents and PDFs, and a secure company knowledge base your team can ask questions.',
    detail:
      'AI models are excellent at reading messy information and unreliable at maths you depend on. I use them for the first job: pulling the details out of PDFs, scanned invoices, emails and contracts, and answering questions from your own documents with links to the source. Numbers, balances and routing decisions stay in fixed rules. Every extraction must fit a set format and comes with a confidence score, so anything uncertain goes to a person instead of into your books.',
    includes: [
      'Details pulled from documents into a fixed format',
      'Your documents indexed so they can be searched by meaning',
      'Answers with links to the source, so they can be checked',
      'Confidence scores, with unsure cases sent to a person',
      'AI instructions saved and versioned, not improvised',
      'AI model chosen to balance cost and accuracy'
    ],
    deliverables: [
      {
        title: 'Document reader',
        desc: 'Documents in, checked and organised data out, with a confidence score on every field.'
      },
      { title: 'Knowledge base', desc: 'Your documents indexed and searchable, with links back to the source.' },
      {
        title: 'AI instruction library',
        desc: 'The AI instructions and formats, saved as versions you can review and change.'
      },
      {
        title: 'Accuracy test set',
        desc: 'A set of real documents kept aside to measure accuracy before and after any change.'
      }
    ],
    qualities: [
      'AI output always fits a set format before it is saved',
      'Confidence limits set to how much risk you accept',
      'A source link on every answer',
      'Calculations done by fixed rules, not the AI',
      'Cost measured per document, not guessed',
      'Backup handling for blurry and handwritten documents'
    ]
  },
  {
    slug: 'saas-api-integrations',
    title: 'App Integrations: Your Tools Kept in Sync',
    short: 'App Integrations',
    duration: '1 to 2 weeks',
    tools: ['Google Workspace', 'Airtable', 'Notion', 'Slack & Telegram', 'Custom app connections'],
    description:
      'Your scattered tools work as one live system — clean data moving automatically between spreadsheets, databases, and the channels your team actually uses.',
    detail:
      'Data falls out of step the moment it lives in two places. I connect your tools so one system holds the master copy and the rest follow it, instead of three spreadsheets disagreeing by Friday. That means retries that never create duplicate records, matching on a unique ID so the same customer is the same customer everywhere, and a scheduled check that catches anything the live sync missed.',
    includes: [
      'One master record for each customer, order or item',
      'Safe retries that never create duplicates',
      'Matching that keeps one record per customer',
      'App usage limits handled by slowing down and retrying',
      'A nightly check for records that fall out of step',
      'Instant or scheduled updates, whichever fits'
    ],
    deliverables: [
      {
        title: 'Connection map',
        desc: 'Which system owns which piece of information, and which way it flows.'
      },
      { title: 'Live connections', desc: 'Running connections between your tools, with retries handled.' },
      {
        title: 'Nightly check',
        desc: 'A scheduled check that reports differences instead of letting them build up unnoticed.'
      },
      {
        title: 'Field guide',
        desc: 'Which field matches which in each app, written down so the next change does not start from scratch.'
      }
    ],
    qualities: [
      'One master record, never three',
      'Retries cannot create duplicates',
      'App usage limits handled, not hoped around',
      'Differences caught by a scheduled check',
      'Field matches written down, not kept in someone\u2019s head',
      'Works even when no ready-made connector exists'
    ]
  },
  {
    slug: 'ai-voice-agents',
    title: 'AI Phone Receptionists & Customer Chat',
    short: 'AI Phone Receptionist',
    duration: '2 to 3 weeks',
    tools: ['VAPI', 'Retell AI', 'ElevenLabs', 'Cal.com', 'WhatsApp & Twilio'],
    description:
      'Natural-sounding AI phone receptionists and chatbots that answer customer questions, screen new enquiries, and book confirmed appointments around the clock.',
    detail:
      'A voice agent is judged on how fast it replies and on knowing when to stop. I build receptionists that answer in under a second, follow a set list of screening questions, check real calendar availability, and book a confirmed time — then hand over to a person the moment the conversation goes beyond the script. Every call is transcribed and saved, so you can check what the agent actually said rather than trusting that it behaved.',
    includes: [
      'Fast-response voice setup',
      'Screening questions and conversation design',
      'Live calendar availability and booking',
      'Hand-off to a person for anything off script',
      'Every call transcribed and saved',
      'Text or WhatsApp follow-up after the call'
    ],
    deliverables: [
      {
        title: 'Live voice agent',
        desc: 'Answering a real number, following your script, booking into your real calendar.'
      },
      {
        title: 'Conversation design',
        desc: 'The script, the branches, and the exact points where it hands off to a person.'
      },
      { title: 'Call log', desc: 'Every call transcribed and stored, so you can check what was actually said.' },
      { title: 'Hand-off rules', desc: 'Defined situations where the agent stops and a person takes over.' }
    ],
    qualities: [
      'Replies in under a second',
      'Knows the limits of its own script',
      'Books only into genuinely free times',
      'Every call transcribed and reviewable',
      'A clear hand-off to a person, not a dead end',
      'Tested with interruptions and accents'
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
    tagline: 'Flexible workflows with full ownership',
    bestFor: [
      'Sensitive work that stays in your environment',
      'Processes with several decisions and exceptions',
      'Custom steps when standard connectors are not enough',
      'Higher volumes without paying for every task'
    ],
    note: 'My usual choice when the workflow needs flexibility, control and room to grow.'
  },
  {
    name: 'Zapier',
    tagline: 'The quickest way to connect familiar business tools',
    bestFor: [
      'Simple, dependable handoffs between apps',
      'Teams already using Zapier',
      'Common tools with ready-made connections',
      'Getting a straightforward workflow live quickly'
    ],
    note: 'A strong fit when speed and ease of maintenance matter more than deep customization.'
  },
  {
    name: 'Make',
    tagline: 'Visual workflows for larger amounts of information',
    bestFor: [
      'Processes with several routes and conditions',
      'Moving and reshaping larger sets of data',
      'Seeing exactly what happened at each step',
      'Balancing flexibility with a visual builder'
    ],
    note: 'A useful middle ground when the process is visual but needs more flexibility than a simple app connection.'
  },
  {
    name: 'GoHighLevel',
    tagline: 'Customer follow-up, sales tracking and campaigns in one place',
    bestFor: [
      'Capturing and following up with leads',
      'Email, text and voice campaigns',
      'Agencies managing several client accounts',
      'Keeping the customer journey in one system'
    ],
    note: 'Best when the customer relationship system is the centre of the work, rather than one tool among many.'
  }
]

// ─── Process ─────────────────────────────────────────────────────────────────

export type Step = {
  step: string
  label: string

  /** Bold one-line statement of what this stage settles. */
  summary: string
  desc: string

  /** Which Working Together engagement the step sits in, and when, so the
   *  two sections read as one path. Matches ENGAGEMENTS' names and durations. */
  phase: 'Audit' | 'Build' | 'Retainer'
  timing: string

  /** What the client is asked for at this step. The section's blurb promises it. */
  fromYou: string

  /** What the client has in hand once the step is done. */
  youGet: string
}

export const PROCESS: Step[] = [
  {
    step: '01',
    label: 'Discovery',
    summary: 'Start with the work, not the software.',
    desc: 'We talk through the outcome you need, who touches the process today and where repetitive work, delays or errors are costing you time.',
    phase: 'Audit',
    timing: 'Day 1',
    fromYou: 'A 30-minute call, and a walk through how the work happens today.',
    youGet: 'A plain statement of the problem and how success will be measured.'
  },
  {
    step: '02',
    label: 'Process audit',
    summary: 'Find the best automation opportunities.',
    desc: 'I write down how the work is done today, measure where it gets stuck and separate what is worth automating from what still needs a person.',
    phase: 'Audit',
    timing: 'Week 1',
    fromYou: 'View access to the tools involved and an hour with whoever runs the process.',
    youGet: 'A prioritised list of what to automate and the time each one saves.'
  },
  {
    step: '03',
    label: 'Solution design',
    summary: 'Map the system before writing a workflow.',
    desc: 'I set out where information goes, the rules it follows, what the AI does, who approves what and what happens when something fails. You see exactly what gets built and why.',
    phase: 'Build',
    timing: 'First days',
    fromYou: 'Sign-off on the system map before anything is built.',
    youGet: 'A one-page map of how the system will work, including approvals and what happens on errors.'
  },
  {
    step: '04',
    label: 'Build & connect',
    summary: 'Connect the tools and bring the plan to life.',
    desc: 'I build the automation, connect your apps, set up the AI steps, and add a record of every run, alerts and a way to recover when something fails.',
    phase: 'Build',
    timing: '1 to 4 weeks',
    fromYou: 'Access to the apps being connected, and quick answers on unusual cases.',
    youGet: 'A working automation in your own accounts, with a record of every run and alerts.'
  },
  {
    step: '05',
    label: 'Testing & handover',
    summary: 'Prove it works when things go wrong, not just when they go right.',
    desc: 'We test real cases, unusual ones, who can access what and what happens when an app stops responding. Your team gets clear instructions and a practical walkthrough.',
    phase: 'Build',
    timing: 'Final days',
    fromYou: 'Real examples to test with, and the people who will use it at the walkthrough.',
    youGet: 'Test results, documentation and a walkthrough for your team.'
  },
  {
    step: '06',
    label: 'Launch & optimize',
    summary: 'Go live, watch closely and keep improving.',
    desc: 'I watch the first runs closely, fix anything unexpected and measure the result. The system evolves as your volume, tools and process change.',
    phase: 'Retainer',
    timing: 'Monthly',
    fromYou: 'Flag anything odd in the first weeks. The retainer is optional.',
    youGet: 'Close monitoring of the first runs and a measured result.'
  }
]

// ─── Tool stack ──────────────────────────────────────────────────────────────

export type Tool = {
  name: string

  /** Matches public/images/tools/<slug>.svg. Omit when there is no logo file
   *  and a monogram badge should be rendered instead. */
  slug?: string

  /** Brand hex, from the simple-icons dataset. */
  color: string
}

/** First marquee row — automation platforms, models, and data stores. */
export const TOOLS_ROW_1: Tool[] = [
  { name: 'n8n', slug: 'n8n', color: '#EA4B71' },
  { name: 'Zapier', slug: 'zapier', color: '#FF4F00' },
  { name: 'Make', slug: 'make', color: '#6D00CC' },
  { name: 'Claude', slug: 'anthropic', color: '#191919' },
  { name: 'OpenAI', slug: 'openai', color: '#412991' },
  { name: 'DeepSeek', color: '#3B4FC4' },
  { name: 'PostgreSQL', slug: 'postgresql', color: '#4169E1' },
  { name: 'Supabase', slug: 'supabase', color: '#3FCF8E' },
  { name: 'Pinecone', color: '#0B7285' },
  { name: 'Airtable', slug: 'airtable', color: '#18BFFF' },
  { name: 'Notion', slug: 'notion', color: '#000000' },
  { name: 'Google Sheets', slug: 'googlesheets', color: '#34A853' }
]

/** Second marquee row — business systems and channels. */
export const TOOLS_ROW_2: Tool[] = [
  { name: 'HubSpot', slug: 'hubspot', color: '#FF7A59' },
  { name: 'Salesforce', slug: 'salesforce', color: '#00A1E0' },
  { name: 'QuickBooks', slug: 'quickbooks', color: '#2CA01C' },
  { name: 'Xero', slug: 'xero', color: '#13B5EA' },
  { name: 'Stripe', slug: 'stripe', color: '#635BFF' },
  { name: 'Shopify', slug: 'shopify', color: '#7AB55C' },
  { name: 'Twilio', slug: 'twilio', color: '#F22F46' },
  { name: 'WhatsApp', slug: 'whatsapp', color: '#25D366' },
  { name: 'Telegram', slug: 'telegram', color: '#26A5E4' },
  { name: 'Slack', slug: 'slack', color: '#4A154B' },
  { name: 'Gmail', slug: 'gmail', color: '#EA4335' },
  { name: 'Google Drive', slug: 'googledrive', color: '#4285F4' },
  { name: 'Cal.com', slug: 'caldotcom', color: '#292929' },
  { name: 'ElevenLabs', slug: 'elevenlabs', color: '#000000' },
  { name: 'VAPI', color: '#0A6F63' },
  { name: 'GitHub', slug: 'github', color: '#181717' }
]

// ─── Principles ──────────────────────────────────────────────────────────────

export const PRINCIPLES = [
  {
    n: '01',
    title: 'Map the work before automating it',
    sub: 'Business rules and exceptions are captured before anything is built',
    body: 'We first map what happens, who approves it and which unusual cases need special treatment. That keeps the finished workflow aligned with how your business actually operates.'
  },
  {
    n: '02',
    title: 'Keep important numbers exact',
    sub: 'AI reads messy information; fixed rules handle calculations and approvals',
    body: 'AI can read documents, emails and other unstructured information. Important totals, balances and approval decisions still follow fixed rules that can be checked and tested.'
  },
  {
    n: '03',
    title: 'Make problems visible and recoverable',
    sub: 'Alerts, review steps and clear instructions are included from the start',
    body: 'When something unusual happens, the right person is alerted and sensitive work pauses for review. Your team also receives clear instructions for recovering and continuing safely.'
  }
]

// ─── Testimonials ────────────────────────────────────────────────────────────

export type Testimonial = {
  quote: string
  name: string
  role: string
  company?: string

  /** Matches public/images/testimonials/<file>. Optional. */
  avatar?: string

  /**
   * Not a real quote yet. Draft entries are filtered out before render and the
   * section disappears entirely when nothing survives, so the site never shows
   * praise nobody gave. Same guarantee `sample` provides on a case study.
   *
   * To publish one: replace every bracketed field with the person's own words,
   * confirm they are happy to be named, then delete this line.
   */
  draft?: boolean
}

/**
 * Placeholders, deliberately unmistakable.
 *
 * They exist so the component, the data shape and the layout are all in place
 * and can be reviewed at realistic copy lengths. The text is written so that
 * flipping `draft` by accident produces something obviously unfinished rather
 * than a plausible-looking fake endorsement.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    draft: true,
    quote:
      '[Placeholder] Replace with the client\u2019s own words. Two or three sentences reads best in this column \u2014 what the work looked like before, what changed, and what it freed the team up to do.',
    name: '[Name]',
    role: '[Role]',
    company: '[Company]'
  },
  {
    draft: true,
    quote:
      '[Placeholder] A shorter quote works here too. One sharp sentence about a specific outcome carries more than a paragraph of general praise.',
    name: '[Name]',
    role: '[Role]',
    company: '[Company]'
  },
  {
    draft: true,
    quote:
      '[Placeholder] If a colleague can speak to the handover \u2014 that they could run and extend the workflow without you \u2014 that is the one worth putting third.',
    name: '[Name]',
    role: '[Role]',
    company: '[Company]'
  }
]

// ─── Work history ────────────────────────────────────────────────────────────

export type Role = {
  index: string
  company: string
  role: string
  period: string

  /**
   * Work arrangement only — never a department or function, which the role
   * title already carries. One badge that means two unrelated things gives a
   * scanning reader no way to know what it is telling them.
   */
  arrangement?: string
  stack: string[]

  /** The scannable claim. Rendered at full ink; must not restate `description`. */
  achievement: string

  /** The supporting detail behind the claim. Rendered quieter. */
  description: string
}

/**
 * A run of consecutive roles at one employer. Three of these four roles are the
 * same company; listing it three times read as three unrelated jobs rather than
 * one six-year tenure with two promotions.
 */
export type Tenure = {
  company: string

  /** Span across the grouped roles, for the band header. */
  span: string
  roles: Role[]
}

export const EXPERIENCE: Role[] = [
  {
    index: '01',
    company: 'My Mountain Mover',
    role: 'Financial Analyst',
    period: '2022 — Present',
    arrangement: 'US Remote',
    stack: ['Claude', 'Valuation Models', 'Financial Analysis', 'Forecasting', 'Excel'],
    achievement: 'Build company valuation models and forecasts for US stock portfolios',
    description:
      'Claude and AI tooling carry the research, market-data analysis and structured reporting around that work — the habit of handing repeatable analysis to a machine started here.'
  },
  {
    index: '02',
    company: 'Johndorf Ventures Corporation',
    role: 'Branch Accountant',
    period: '2020 — 2021',
    stack: ['Team Leadership', 'Payables & Receivables', 'Account Reconciliation', 'SAP', 'Process Mapping'],
    achievement: 'Led a 10-person accounting team closing the books every month and year',
    description:
      'Ran and documented the month-end close, account checks and approvals for supplier bills, customer payments and payouts — the same step-by-step mapping that automation depends on.'
  },
  {
    index: '03',
    company: 'Johndorf Ventures Corporation',
    role: 'Project Cost Accountant',
    period: '2016 — 2020',
    stack: ['Cost Accounting', 'Budget vs Actual', 'QuickBooks', 'Workbooks'],
    achievement: 'Checked multi-million project costs against the books, with automated reports',
    description:
      'Compared planned and actual costs for a major real estate developer, checked material, labour and overhead costs against the records, and built reports that ran on a schedule.'
  },
  {
    index: '04',
    company: 'Johndorf Ventures Corporation',
    role: 'Accounts Payable Supervisor & Tax Compliance Analyst',
    period: '2015 — 2018',
    stack: ['Tax Compliance', 'Invoicing', 'Supplier Reconciliation', 'Payment Approvals'],
    achievement: 'Ran supplier invoices from receipt to payment and kept every tax filing on time',
    description:
      'Oversaw invoice processing, overdue supplier balances and payment approvals, and managed the tax filing calendar — high-volume, rule-based work that is ideal for automation.'
  }
]

/**
 * Groups consecutive same-employer roles. Consecutive rather than global, so a
 * later return to a previous employer would still read as a separate tenure.
 *
 * The span is derived from the group's outermost dates rather than stored, so
 * it cannot drift out of sync with the roles it summarises.
 */
const periodStart = (period: string) => period.split('—')[0]?.trim() ?? period
const periodEnd = (period: string) => period.split('—').at(-1)?.trim() ?? period

export const TENURES: Tenure[] = EXPERIENCE.reduce<Tenure[]>((groups, role) => {
  const current = groups.at(-1)

  if (current?.company === role.company) {
    current.roles.push(role)
  } else {
    groups.push({ company: role.company, span: role.period, roles: [role] })
  }

  // Roles run newest-first, so the group's span is the last role's start
  // through the first role's end.
  const group = groups.at(-1)!

  group.span = `${periodStart(group.roles.at(-1)!.period)} — ${periodEnd(group.roles[0].period)}`

  return groups
}, [])

// ─── Engagement models ───────────────────────────────────────────────────────

/**
 * Engagement tiers.
 *
 * `forWhen` names the state the reader is in, not what they get — that is
 * `summary`'s job. Prices are published as starting points (`price`,
 * `priceNote`); llms.txt states the same figures, and the chatbot's n8n
 * prompt, which lives outside this repo, needs to agree with them.
 */
export const ENGAGEMENTS = [
  {
    name: 'Automation Audit',
    duration: '1 week',
    forWhen: 'You know something is eating the week, but not what to automate first.',
    summary: 'Map what you do manually and what is worth automating.',
    includes: [
      'How the work is done today, written down',
      'A list of what is worth automating',
      'Which tool to build it on',
      'A plan in order of priority'
    ],
    cta: 'Book the audit',
    href: '#contact',

    // Sample prices, set from 2026 market rates for freelance n8n / Make /
    // Zapier work (single builds $400-1,200, multi-workflow systems
    // $1,500-4,500, retainers $1,200-3,800/mo). Replace with real ones.
    price: '$750',
    priceNote: 'fixed fee',
    outcome: 'A prioritised plan and which tool to build it on.',
    start: true
  },
  {
    name: 'Fixed-Price Build',
    duration: '1 to 4 weeks',
    forWhen: 'You know exactly which process, and want it built and handed over.',
    summary: 'One automation, built, tested on your real data and documented.',
    includes: [
      'System design, including what happens on errors',
      'Build on n8n, Zapier, Make or GoHighLevel',
      'Testing with your unusual cases',
      'Documentation and handover'
    ],
    cta: 'Request a quote',
    featured: true,
    price: 'From $1,800',
    priceNote: 'per workflow, fixed quote',
    outcome: 'A tested workflow running in your accounts, documented.'
  },
  {
    name: 'Ongoing Retainer',
    duration: 'Monthly',
    forWhen: 'You already have workflows running and need them to keep running.',
    summary: 'Keep existing workflows healthy and keep extending them.',
    includes: [
      'Monitoring and failure alerts',
      'Fixes when your tools change',
      'New workflows as they come up',
      'Faster replies when you need me'
    ],
    cta: 'Request a quote',
    price: 'From $1,200',
    priceNote: 'per month',
    outcome: 'Workflows that keep working as your tools change.'
  }
]

// ─── FAQ ─────────────────────────────────────────────────────────────────────

/**
 * Shared by the FAQ section and the landing page's FAQPage structured data,
 * so the answers search engines show are the ones on the page.
 */
export const FAQS = [
  {
    icon: 'handshake',
    question: 'Is the first call really free, and how is it different from the audit?',
    answer:
      'Yes. The 30-minute call is free: you walk me through the process and I tell you whether it is worth automating, on which platform, and roughly what it would take. The Automation Audit is a separate, paid week of work that maps everything in detail and gives you a prioritised plan. You can skip the audit and go straight to a build.'
  },
  {
    icon: 'lock',
    question: 'Will my business data remain private?',
    answer:
      'Yes. I work inside accounts and systems you control, request only the access the workflow needs, and can run everything on your own servers when sensitive data should never leave your business.'
  },
  {
    icon: 'key',
    question: 'What access will you need?',
    answer:
      'Usually a test account, sample records and limited access to the tools being connected. We agree on access before the build, and your real passwords stay in your own password manager.'
  },
  {
    icon: 'handshake',
    question: 'Who owns and maintains the automation?',
    answer:
      'You do. The finished workflow runs in your accounts and includes documentation, a recorded handover and clear instructions for the person who maintains it next.'
  },
  {
    icon: 'bell',
    question: 'What happens if a workflow fails?',
    answer:
      'Important workflows alert you when something fails, retry safely without creating duplicates, and pause for a person to check anything where a wrong decision would be costly. Problems are flagged, never hidden.'
  },
  {
    icon: 'tools',
    question: 'Which platform will you build on?',
    answer:
      'Usually n8n: it can run on your own servers for sensitive data, handles processes with many decisions and custom steps, and does not charge per task as volume grows. Zapier suits simple handoffs between familiar apps, especially if your team already uses it. Make fits processes with several routes that move larger amounts of data. GoHighLevel is the choice when your customer list, sales tracking and marketing campaigns are the centre of the work. I recommend one after the audit, based on your tools, volume and who maintains it afterwards.'
  },
  {
    icon: 'clock',
    question: 'How long does a typical project take?',
    answer:
      'A focused workflow usually takes one to four weeks after the process and access are clear. The Automation Audit takes one week and gives you a prioritised plan before you commit to a build.'
  }
]
