/**
 * The client delivery playbook behind /dashboard.
 *
 * Seven phases, each a checklist whose items point at a guide, a Drive
 * template or one of the two tools. Content lives here rather than in the
 * database so it is versioned with the site and reviewed like any other copy;
 * only per-client progress (ticks, matrix rows, ROI inputs) goes to Supabase.
 *
 * Template ids are the files in the "Client Document Templates" Drive folder.
 * A re-upload changes the id, so update the matching entry here when one is
 * replaced.
 */

export const DRIVE_FOLDER = 'https://drive.google.com/drive/folders/1H9NYFumpoyWIVNvkU0dCkFtRS8-C3tkU'

export const driveUrl = (id: string) => `https://drive.google.com/file/d/${id}/view`

export type TemplateKey =
  | 'discovery'
  | 'nda'
  | 'audit'
  | 'quotation'
  | 'agreement'
  | 'kickoff'
  | 'access'
  | 'change'
  | 'invoice'
  | 'receipt'
  | 'reminders'
  | 'training'
  | 'userguide'
  | 'sop'
  | 'techdoc'
  | 'completion'
  | 'feedback'
  | 'casestudy'
  | 'retainer'
  | 'monthly'

export const TEMPLATES: Record<TemplateKey, { name: string; id: string; use: string }> = {
  discovery: {
    name: 'Discovery Questionnaire',
    id: '1YTXe8M4aIMyXUIj4y8K5YpTGrPNRGWED',
    use: 'Sent before the call: process, tools, goals, budget.'
  },
  nda: {
    name: 'NDA',
    id: '1EQKfPt6mHH4XLcQDTZg01TFnPpZKBOlD',
    use: 'Mutual NDA before they share internal data or access.'
  },
  audit: {
    name: 'Automation Audit Report',
    id: '123Nl9LCOXBEfZGhpWLyowYx8IDFEJpAK',
    use: 'The deliverable for the one-week paid audit.'
  },
  quotation: {
    name: 'Quotation',
    id: '1rpw_6pNcmQKtkulRt6KTUBehZ534FXug',
    use: 'Their problem in their words, scope, Not Included, savings, milestones.'
  },
  agreement: {
    name: 'Service Agreement',
    id: '1BjRUe_pnKgJKiy1pzhIyGLSoj9gSa-cZ',
    use: 'Payments, IP, warranty, liability, termination.'
  },
  kickoff: {
    name: 'Kickoff Welcome',
    id: '1Je75hxLmwPEIa8kSWmNAgHcl1gT8Zn2E',
    use: 'Welcome email, kickoff agenda, milestone calendar.'
  },
  access: {
    name: 'Access Checklist',
    id: '19RbNhaSLFn64D6NMANWF9dZ4hwCAuMY4',
    use: 'What access I need and how to share it safely.'
  },
  change: {
    name: 'Change Request',
    id: '1-k56kn3K5t3419fQFXE1YbNHGYkrqdYt',
    use: 'Prices and approves anything outside the agreed scope.'
  },
  invoice: { name: 'Invoice', id: '1vtmgvufL1FqbdY6C1YxW94_DJQgmGTcX', use: 'Milestone invoice with bank details.' },
  receipt: {
    name: 'Payment Receipt',
    id: '1nh_MbUxrot85i6486RWcxDzykUt6Zilt',
    use: 'Confirms each payment and the remaining balance.'
  },
  reminders: {
    name: 'Payment Reminders',
    id: '1O5c6RS_ENPDxXYetiBMDDAALYP4NeQI8',
    use: 'Four emails from friendly reminder to final notice.'
  },
  training: {
    name: 'Handover & Training',
    id: '1GY-V85V73RVBvkZEkaWkNN3cfm4J-XDQ',
    use: 'Session agenda, competency checklist, acceptance sign-off.'
  },
  userguide: {
    name: 'User Guide',
    id: '1FfYaqhjVdxij1D18uxJ9-A47jpYNcy9s',
    use: "Plain-language guide for the client's staff."
  },
  sop: {
    name: 'Handover SOP',
    id: '1cUccJJ702Ad1xqj_j2aGlyI1yiLKHrE1',
    use: 'Monitoring and troubleshooting for whoever maintains it.'
  },
  techdoc: {
    name: 'Technical Documentation',
    id: '194SQupsGA6LipQfAC53pBL1nn93D72Hv',
    use: 'Architecture, integrations, AI steps, security.'
  },
  completion: {
    name: 'Completion Report',
    id: '1Irya7UeGnS_vlTwRVtjJ8JW1NH5n-HTV',
    use: 'Every deliverable done, with evidence; client signs off.'
  },
  feedback: {
    name: 'Feedback & Testimonial',
    id: '1vHq_aDkAzRtpq9CmuAp75Xgv3_BD8A6n',
    use: 'Ratings, results, testimonial and permission to use it.'
  },
  casestudy: {
    name: 'Case Study',
    id: '1OmwXwl6SmKcSp7J0onl6ZJpxsvQ6KifJ',
    use: 'Turns the results into portfolio proof.'
  },
  retainer: {
    name: 'Retainer Agreement',
    id: '1dhZ45ZAlxlcU2BLvSyyrHmHS_nkkz96J',
    use: 'Monthly support: hours, response times, terms.'
  },
  monthly: {
    name: 'Monthly Support Report',
    id: '1n_08P2ti5W6X5mMAXbg0HMg1IEDIp6l2',
    use: 'System health, fixes, hours used, recommendations.'
  }
}

export type ToolKey = 'matrix' | 'roi'

export const TOOLS: Record<ToolKey, string> = { matrix: 'Opportunity Matrix', roi: 'ROI & Price Calculator' }

export type ItemLinks = { g?: string[]; t?: TemplateKey[]; k?: ToolKey }

export type Phase = { id: string; name: string; time: string; goal: string; done: string; items: [string, ItemLinks][] }

export const PHASES: Phase[] = [
  {
    id: 'discover',
    name: 'Discovery Call',
    time: 'Free · 30 min',
    goal: "Understand one process well enough to say whether it's worth automating, on which platform, and roughly what it takes.",
    done: 'Summary and recommended next step sent within 48 hours.',
    items: [
      ['Send the Discovery Questionnaire before the call', { t: ['discovery'] }],
      ['Research the business: website, team size, tools they mention', {}],
      ['Run the call with the Discovery Call Script', { g: ['call'] }],
      ['Put numbers on the pain: volume, hours per week, cost of mistakes', { g: ['roi'], k: 'roi' }],
      ['Run the Automation Fit Test on the main process', { g: ['fit'] }],
      ['Confirm who decides and the budget range', { g: ['call'] }],
      ['Choose the path: Audit first, or straight to a fixed-price build', { g: ['offers'] }],
      ['Send the NDA if they will share internal data', { t: ['nda'] }],
      ['Send the summary email with the recommendation', { g: ['followup'] }]
    ]
  },
  {
    id: 'audit',
    name: 'Automation Audit',
    time: '1 week · fixed fee',
    goal: 'Map how the work is really done, find what is worth automating, and put it in order of priority.',
    done: 'Audit Report presented live and Phase 1 chosen.',
    items: [
      ['Confirm scope, interviewees and sample data on day 1', { g: ['auditplan'] }],
      ['Interview the owner or leadership', { g: ['int-owner'] }],
      ['Interview each process owner', { g: ['int-process'] }],
      ['Interview or shadow frontline staff', { g: ['int-user'] }],
      ['Interview whoever manages the tools', { g: ['int-it'] }],
      ['Map the current process step by step', { g: ['map'] }],
      ['Collect 5–10 real sample records for testing', { g: ['map'] }],
      ['List every opportunity and run the Fit Test', { g: ['fit'] }],
      ['Score opportunities on the Opportunity Matrix', { g: ['matrix'], k: 'matrix' }],
      ['Calculate ROI for the top opportunities', { g: ['roi'], k: 'roi' }],
      ['Recommend the platform', { g: ['platform'] }],
      ['Write the Automation Audit Report', { t: ['audit'] }],
      ['Present the findings live', { g: ['present'] }]
    ]
  },
  {
    id: 'propose',
    name: 'Proposal & Pricing',
    time: '2–5 days',
    goal: 'Win the build at a price set by the value it creates.',
    done: 'Service Agreement signed and down payment received.',
    items: [
      ['Set the price from value, not hours', { g: ['pricing'], k: 'roi' }],
      [
        'Write the Quotation: their problem in their words, plus a Not Included list',
        { t: ['quotation'], g: ['proposal'] }
      ],
      ['Walk them through it on a call; never send the price cold', { g: ['pricing'] }],
      ['Handle objections by changing scope, not price', { g: ['objections'] }],
      ['Send the Service Agreement for signature', { t: ['agreement'] }],
      ['Invoice the down payment', { t: ['invoice'] }],
      ['Confirm payment and send the receipt', { t: ['receipt'] }]
    ]
  },
  {
    id: 'kickoff',
    name: 'Kickoff & Access',
    time: 'Week 1',
    goal: 'Get the client set up so the build can start without waiting.',
    done: 'Every connection tested and build dates confirmed.',
    items: [
      ['Send the welcome email', { t: ['kickoff'] }],
      ['Run the kickoff call', { g: ['kickoff'] }],
      ['Send the Access Checklist', { t: ['access'], g: ['access'] }],
      ['Test every connection on day one', { g: ['access'] }],
      ['Set up workflow names, folders and the backup location', { g: ['build'] }],
      ['Confirm the update channel and schedule', { g: ['kickoff'] }]
    ]
  },
  {
    id: 'build',
    name: 'Build & Test',
    time: '1–4 weeks',
    goal: 'Build each module so it works with real data and fails safely.',
    done: 'Every module passes testing and is signed off.',
    items: [
      ['Sketch each flow first: trigger, steps, decisions, outputs', { g: ['build'] }],
      ['Build against test accounts and sample data', { g: ['build'] }],
      ['Add error handling, retries and failure alerts', { g: ['build'] }],
      ['Add a human review step wherever a mistake is costly', { g: ['build'] }],
      ['Run the testing checklist on every module', { g: ['testing'] }],
      ["Test with the client's own unusual cases", { g: ['testing'] }],
      ['Demo each module and get written sign-off', { g: ['demo'] }],
      ['Log anything new as a Change Request', { t: ['change'], g: ['scope'] }],
      ['Invoice each milestone on sign-off', { t: ['invoice'] }]
    ]
  },
  {
    id: 'handover',
    name: 'Handover',
    time: 'Final week',
    goal: "Hand over a system the client's team can run and extend without me.",
    done: 'Handover Acceptance signed and final payment received.',
    items: [
      ["Write the User Guide for the client's staff", { t: ['userguide'] }],
      ['Write the Handover SOP for whoever maintains it', { t: ['sop'] }],
      ['Write the Technical Documentation (IT team or sensitive data)', { t: ['techdoc'] }],
      ["Export workflows and backups to the client's folder", { g: ['handover'] }],
      ['Run the recorded handover and training session', { t: ['training'], g: ['handover'] }],
      ["Have the client's team demonstrate each skill on the checklist", { t: ['training'] }],
      ['Move credentials to client accounts and remove my access', { g: ['access'] }],
      ['Send the Completion Report for sign-off', { t: ['completion'] }],
      ['Send the final invoice; follow the reminder sequence if late', { t: ['invoice', 'reminders'], g: ['collect'] }]
    ]
  },
  {
    id: 'grow',
    name: 'Support & Grow',
    time: 'Support period, then monthly',
    goal: 'Keep it working, prove the results, and turn one project into a long-term client.',
    done: 'Retainer decided, testimonial collected, case study published.',
    items: [
      ['Check in on day 2, day 7 and day 30', { g: ['checkin'] }],
      ['Log every fix during the support period', { g: ['checkin'] }],
      ['Send the Feedback & Testimonial form at day 30', { t: ['feedback'], g: ['referral'] }],
      ['Offer the retainer before support ends', { t: ['retainer'], g: ['retainer'] }],
      ['Send the Monthly Support Report each month', { t: ['monthly'] }],
      ['Propose the next phase from the audit plan', { g: ['expand'] }],
      ['Write and publish the Case Study', { t: ['casestudy'], g: ['referral'] }],
      ['Ask for a referral', { g: ['referral'] }]
    ]
  }
]

export type GuideSection = {
  h: string
  p?: string
  ul?: string[]
  ol?: string[]
  qs?: string[]
  email?: string
  pairs?: [string, string][]
}

export type GuideCategory = 'Interview' | 'Sales' | 'Audit' | 'Delivery' | 'Growth'

export type Guide = {
  id: string
  cat: GuideCategory
  ph: string
  time?: string
  tool?: ToolKey
  title: string
  sum: string
  s: GuideSection[]
}

export const GUIDE_CATEGORIES: ('All' | GuideCategory)[] = ['All', 'Interview', 'Sales', 'Audit', 'Delivery', 'Growth']

export const GUIDES: Guide[] = [
  {
    id: 'call',
    cat: 'Interview',
    ph: 'discover',
    time: '30 min',
    title: 'Discovery Call Script',
    sum: "The free 30-minute call. Learn one process well enough to say whether it's worth automating, on which platform, and roughly what it takes. Let them talk for most of it.",
    s: [
      {
        h: 'Before the call',
        ul: [
          'Read their Discovery Questionnaire answers.',
          'Check their website and the tools they mentioned.',
          'Prepare two or three questions specific to their industry.',
          'Keep the ROI calculator open.'
        ]
      },
      {
        h: '1 · Open (2 min)',
        qs: [
          "Thanks for the time. My goal today is to understand the process that's eating your week, and tell you honestly whether it's worth automating. Does that work?",
          'Before we start, what made you reach out now?'
        ]
      },
      {
        h: '2 · Situation (8 min)',
        qs: [
          "Walk me through what happens from the moment a [lead / invoice / request] comes in until it's done.",
          'Who touches it, and in which tools?',
          'How many of these do you handle in a week? Is there a busy season?'
        ]
      },
      {
        h: '3 · Pain and impact (10 min)',
        qs: [
          'Where does it slow down or go wrong?',
          'Roughly how many hours a week does the team spend on it?',
          'What does one mistake or one missed [lead] cost you?',
          'What have you already tried to fix it?',
          'What happens if nothing changes in the next six months?'
        ]
      },
      {
        h: '4 · Fit and decision (5 min)',
        qs: [
          'If this worked perfectly, what would be different 90 days from now?',
          'Who else needs to be part of the decision?',
          'Do you have a budget range in mind for solving this?'
        ]
      },
      {
        h: '5 · Next step (5 min)',
        qs: [
          "Here's what I'm hearing… (play it back in their own words)",
          'My recommendation is [an audit first / a fixed-price build], because…',
          "I'll send a summary and a fixed quote within 48 hours. Can we book 20 minutes on [day] to go through it?"
        ]
      },
      {
        h: 'Listen for',
        ul: [
          'Their exact words for the problem. Quote them in the Quotation.',
          'Numbers: volumes, hours, error rates, response times.',
          "Signs it isn't a fit: the process changes every week, nobody owns it, or the volume is too low to pay back."
        ]
      },
      {
        h: 'Avoid',
        ul: [
          'Talking about tools or price before they have described the problem.',
          "Promising a solution before you've seen the process."
        ]
      }
    ]
  },
  {
    id: 'int-owner',
    cat: 'Interview',
    ph: 'audit',
    time: '45–60 min',
    title: 'Owner & Leadership Interview',
    sum: 'Sets the direction for the audit: what the business is trying to achieve and what success looks like in numbers. Every recommendation in the report should trace back to this conversation.',
    s: [
      {
        h: 'Goals',
        qs: [
          "What are the business's top three priorities this year?",
          'Where do you want the business to be in 12 months?',
          'What is holding growth back right now?'
        ]
      },
      {
        h: 'Operations',
        qs: [
          'Which part of the business takes more of your time than it should?',
          'Where do things fall through the cracks?',
          'Which roles are hardest to hire for or keep?'
        ]
      },
      {
        h: 'Success and limits',
        qs: [
          'How will you judge whether this audit was worth it?',
          'Which numbers matter most: hours saved, response time, errors, revenue?',
          'Is there anything I must not touch, or rules we must follow (data privacy, approvals)?',
          'How does your team usually react to new systems?'
        ]
      },
      {
        h: 'People',
        qs: [
          'Who should I interview, and who will be my day-to-day contact?',
          "Who will look after the system once it's built?"
        ]
      },
      {
        h: 'Listen for',
        ul: [
          'Priorities to tie every recommendation to.',
          'Budget and timing signals.',
          'Who wants this, and who might resist it.'
        ]
      }
    ]
  },
  {
    id: 'int-process',
    cat: 'Interview',
    ph: 'audit',
    time: '45 min',
    title: 'Process Owner Interview',
    sum: 'Map one process in detail with the person who runs it. Follow a single real record from start to finish.',
    s: [
      {
        h: 'The process',
        qs: [
          'What starts it: a form, an email, a call, a schedule?',
          "Walk me through each step until it's finished.",
          'Who does each step, and in which tool?',
          'Where does information get copied from one place to another?'
        ]
      },
      {
        h: 'Volume and time',
        qs: [
          'How many per day or week? When is it busiest?',
          'How long does each step take?',
          'How long from start to finish, including waiting?'
        ]
      },
      {
        h: 'Exceptions',
        qs: [
          'What are the unusual cases, and how often do they happen?',
          'What goes wrong most often, and how do you fix it?',
          "Which steps need someone's judgment or approval?"
        ]
      },
      {
        h: 'Measures',
        qs: [
          "How do you know it's going well? What do you track?",
          'Can you share 5–10 real examples I can use for testing?'
        ]
      },
      {
        h: 'Listen for',
        ul: [
          'Copy-paste between tools.',
          'Waiting on approvals.',
          "Re-checking because people don't trust the data.",
          'Steps only one person knows how to do.'
        ]
      }
    ]
  },
  {
    id: 'int-user',
    cat: 'Interview',
    ph: 'audit',
    time: '30 min',
    title: 'Frontline Staff Interview',
    sum: 'Hear how the work really happens, which is often different from how the process diagram says it happens.',
    s: [
      {
        h: 'Day to day',
        qs: [
          'Walk me through a typical day.',
          'Which tasks do you repeat the most?',
          'Can you show me how you do [task] right now? (screen share)'
        ]
      },
      {
        h: 'Friction',
        qs: [
          'What is the most frustrating part of your job?',
          'Where do you use workarounds or your own spreadsheets?',
          "What do you double-check because you don't trust it?"
        ]
      },
      {
        h: 'Ideas',
        qs: [
          'If you had a magic wand, what would you never do again?',
          'Is there anything that should never be automated? Why?'
        ]
      },
      {
        h: 'Tips',
        ul: [
          'Open by saying the goal is removing boring work, not people.',
          'Ask to watch, not only to hear it described.',
          'Keep their names out of the report unless they agree.'
        ]
      }
    ]
  },
  {
    id: 'int-it',
    cat: 'Interview',
    ph: 'audit',
    time: '30 min',
    title: 'Tools & IT Interview',
    sum: 'Find out what can connect to what, how access is granted, and what rules apply to data.',
    s: [
      {
        h: 'Systems',
        qs: [
          'Which tools are in use, and on which plans?',
          'Who are the admins for each?',
          'Do these tools have APIs or integrations turned on?'
        ]
      },
      {
        h: 'Data and security',
        qs: [
          'Where does customer and financial data live?',
          'Are there rules about data leaving the company or going to AI services?',
          'How do you prefer to grant access: user invites, service accounts or API keys?'
        ]
      },
      {
        h: 'Operations',
        qs: [
          'Is there a test or sandbox account?',
          'Who would maintain workflows after handover?',
          'Are any tool changes planned in the next six months?'
        ]
      },
      {
        h: 'Listen for',
        ul: [
          'Plan limits: API calls, seats, task counts.',
          'A requirement to keep data on their own servers, which points to self-hosted n8n.'
        ]
      }
    ]
  },
  {
    id: 'auditplan',
    cat: 'Audit',
    ph: 'audit',
    time: '5 days',
    title: 'The One-Week Audit Plan',
    sum: 'A fixed-fee week with a clear deliverable. Interviews early in the week, analysis in the middle, the report and presentation at the end.',
    s: [
      {
        h: 'Day by day',
        ol: [
          'Day 1: confirm scope and goals with the owner, book interviews, request sample records and read-only access.',
          'Days 2–3: run the interviews; personalise each guide with what you learned in the one before.',
          'Day 3: map the process and total the hours.',
          'Day 4: list opportunities, run the Fit Test, score the matrix, calculate ROI, choose the platform.',
          'Day 5: write the Audit Report and present it live.'
        ]
      },
      {
        h: 'What the client gets',
        ul: [
          'How the work is done today, written down.',
          "A ranked list of what is worth automating, and what isn't.",
          'Which platform to build it on.',
          'A plan in order of priority, with ROI and payback.'
        ]
      },
      {
        h: 'Tip',
        p: 'Keep the audit fee separate from the build. If they go ahead within 30 days, you can credit part of it against Phase 1.'
      }
    ]
  },
  {
    id: 'map',
    cat: 'Audit',
    ph: 'audit',
    title: 'Process Mapping',
    sum: 'Follow one real record from trigger to finish and write down what actually happens, not what should happen.',
    s: [
      {
        h: 'Capture for every step',
        ul: ['Step name', 'Who does it', 'Which tool', 'Time per item', 'Volume per week', 'What can go wrong']
      },
      {
        h: 'How to do it',
        ol: [
          'Start with the trigger.',
          'Walk the normal path end to end.',
          'Go back and add exceptions and approvals.',
          'Mark every copy-paste, wait and re-check. These are your opportunities.',
          'Total the hours per week: time per item × volume.'
        ]
      },
      {
        h: 'Tip',
        p: "Draw it in Whimsical or on paper, then put a screenshot in the Audit Report's process map box."
      }
    ]
  },
  {
    id: 'fit',
    cat: 'Audit',
    ph: 'audit',
    title: 'Automation Fit Test',
    sum: 'Four questions for every task. Three or four yes answers make a strong candidate.',
    s: [
      {
        h: 'The four questions',
        ol: [
          'Is the input structured? Forms, emails and database rows: yes. Vague verbal requests: no.',
          'Is the output predictable? Data extraction and standard replies: yes. Creative strategy: no.',
          'Are the decisions rule-based? If/then logic: yes. Complex judgment: keep a person in the loop.',
          'Does it happen often? Daily or weekly: yes. Quarterly: rarely worth it.'
        ]
      },
      {
        h: 'Also check',
        ul: [
          'Is the process stable, or does it change every month?',
          'Does someone own it?',
          'What does a mistake cost? Costly mistakes need a human review step.'
        ]
      }
    ]
  },
  {
    id: 'matrix',
    cat: 'Audit',
    ph: 'audit',
    tool: 'matrix',
    title: 'Opportunity Matrix',
    sum: 'Score every opportunity, then plot it. Build quick wins first to earn trust, then the big swings.',
    s: [
      {
        h: 'Scoring, 1 to 5 each',
        ul: [
          'Impact: time or money saved, and how much it matters to their goals.',
          'Difficulty: integrations, data quality, edge cases. 5 is hardest.',
          'Confidence: a proven pattern scores 5; something experimental scores 1.',
          'Score = Impact × (6 − Difficulty) × Confidence.'
        ]
      },
      {
        h: 'The four quadrants',
        ul: [
          'Quick Wins: high impact, low difficulty. Start here.',
          'Big Swings: high impact, high difficulty. Phase 2 or 3, once trust is built.',
          'Fill-ins: low impact, low difficulty. Bundle in if cheap.',
          'Money Pits: low impact, high difficulty. Leave out, and say why in the report.'
        ]
      }
    ]
  },
  {
    id: 'roi',
    cat: 'Audit',
    ph: 'audit',
    tool: 'roi',
    title: 'ROI & Value Math',
    sum: 'Turn hours into money the way a finance team would, so the owner can check every line.',
    s: [
      {
        h: 'The math',
        ol: [
          'Hours saved per week × staff cost per hour × 50 weeks = yearly time value.',
          'Add the value of fewer errors or faster response, such as leads no longer lost.',
          'Subtract yearly running costs: subscriptions and AI usage.',
          'The result is the net yearly value. Payback = build price ÷ monthly net value.'
        ]
      },
      {
        h: 'Rules',
        ul: [
          "Use the client's own numbers, and round down.",
          'Show each step so they can check it.',
          'Present it as a business case. Your accounting background is the edge here.'
        ]
      }
    ]
  },
  {
    id: 'platform',
    cat: 'Audit',
    ph: 'audit',
    title: 'Choosing the Platform',
    sum: 'Recommend one platform after the audit, based on their tools, volume and who maintains it afterwards.',
    s: [
      {
        h: 'Options',
        ul: [
          'n8n (default): can run on their own servers for sensitive data, handles many decisions and custom steps, no per-task charge as volume grows.',
          'Zapier: simple handoffs between familiar apps, especially if the team already uses it.',
          'Make: visual flows with several routes that move larger amounts of data.',
          'GoHighLevel: when the customer list, sales tracking and campaigns are the centre of the work.'
        ]
      },
      {
        h: 'Decide on',
        ul: [
          'Which tools they already use',
          'Volume and cost per task',
          'How complex the logic is',
          'Who maintains it after handover',
          'Where the data must live'
        ]
      }
    ]
  },
  {
    id: 'present',
    cat: 'Audit',
    ph: 'audit',
    time: '45–60 min',
    title: 'Presenting the Audit',
    sum: 'Present live and end with one decision. Never only email the PDF.',
    s: [
      {
        h: 'Order',
        ol: [
          'Their business as it runs today: the process map.',
          'The friction points and what they cost.',
          'The Opportunity Matrix.',
          'ROI for each top opportunity.',
          'The recommended platform.',
          'The plan, in phases.',
          'The next step: a fixed quote for Phase 1 within 48 hours.'
        ]
      },
      {
        h: 'Tips',
        ul: [
          'Let them correct the map. It builds buy-in.',
          'Use their words for the problems.',
          'Show what you left out and why. It builds trust.'
        ]
      }
    ]
  },
  {
    id: 'offers',
    cat: 'Sales',
    ph: 'discover',
    title: 'Choosing the Offer',
    sum: 'Three offers from the website. Pick the one that fits where the client is.',
    s: [
      {
        h: 'The offers',
        ul: [
          'Automation Audit (1 week, fixed fee): they know something eats the week but not what to automate first.',
          'Fixed-Price Build (1–4 weeks): one clear process, ready to build.',
          'Ongoing Retainer (monthly): workflows already running that need upkeep and improvements.'
        ]
      },
      {
        h: 'Rule of thumb',
        p: "If you can't describe the process in three sentences after the call, sell the audit first."
      }
    ]
  },
  {
    id: 'followup',
    cat: 'Sales',
    ph: 'discover',
    title: 'Post-Call Summary Email',
    sum: 'Send within 48 hours. Play back the problem in their words, then give one recommendation and one next step.',
    s: [
      {
        h: 'Email',
        email:
          "Subject: Summary of our call + next step\n\nHi {Name},\n\nThanks for walking me through {process}. Here's what I heard:\n\n• Today: {how it works now, in their words}\n• The cost: about {X} hours a week, plus {errors / missed leads}\n• The goal: {what success looks like in 90 days}\n\nMy recommendation: {an Automation Audit first / a fixed-price build}, because {reason}.\n\n{The quote is attached. / I'll send the quote by {date}.}\n\nDoes {day, time} work for a 20-minute call to walk through it?\n\nBest,\nRamon\nAI Automation Specialist · ramonvallejera.com"
      }
    ]
  },
  {
    id: 'pricing',
    cat: 'Sales',
    ph: 'propose',
    tool: 'roi',
    title: 'Value-Based Pricing',
    sum: 'Price from the value the system creates, not the hours it takes to build. The PRICE framework keeps it consistent.',
    s: [
      {
        h: 'PRICE',
        ul: [
          'Prepare: discovery done, process mapped, numbers in hand.',
          'Research: what the alternatives cost them, such as a hire, a VA or doing nothing.',
          'Identify ROI: calculate the first-year value. Aim for the client to see about a 10× return.',
          'Communicate: present the transformation and the ROI before the price.',
          'Expand: plan maintenance, improvements and the next phase from day one.'
        ]
      },
      {
        h: 'Setting the number',
        ul: [
          'Start at about 10% of first-year value (a 10× return).',
          'Adjust to 10–20% for complexity, urgency and risk.',
          'Check your floor: your build hours × your target rate must be below the price.',
          'Example: 12 hours a week at $25 an hour is $15,000 a year, so price around $1,500–3,000.'
        ]
      },
      { h: 'Rule', p: 'If they push back, reduce the scope, not the price.' }
    ]
  },
  {
    id: 'proposal',
    cat: 'Sales',
    ph: 'propose',
    title: 'Writing the Quotation',
    sum: 'A quotation that sells: their problem first, outcomes second, price last.',
    s: [
      {
        h: 'Checklist',
        ul: [
          'Open with their problem in their own words (the “Your Situation” box).',
          'State two outcomes, not features.',
          'Scope by module, with deliverables.',
          'List what is Not Included.',
          'Show the time and cost savings and the payback period.',
          'Milestone payments, with the down payment before work starts.',
          'Valid for 14 days, with one clear next step.'
        ]
      }
    ]
  },
  {
    id: 'objections',
    cat: 'Sales',
    ph: 'propose',
    title: 'Handling Objections',
    sum: 'Answer the concern, then go back to the numbers.',
    s: [
      {
        h: 'Common objections',
        pairs: [
          [
            "“It's too expensive.”",
            "Go back to the ROI math. If it's still too much, offer a smaller first version with fewer modules. Don't discount the same scope."
          ],
          [
            "“Can't we just set up Zapier ourselves?”",
            "For simple handoffs, yes. You're paying for the design, error handling, testing and a system that doesn't break quietly."
          ],
          [
            '“What if the AI makes mistakes?”',
            'Anything costly goes to a person for review, and every failure sends an alert. Nothing is hidden.'
          ],
          [
            '“We need to think about it.”',
            'Ask what they still need to decide, and book the follow-up before the call ends.'
          ],
          [
            '“Can you start without a down payment?”',
            'No. The down payment reserves the build slot and covers the design work.'
          ]
        ]
      }
    ]
  },
  {
    id: 'kickoff',
    cat: 'Delivery',
    ph: 'kickoff',
    time: '30 min',
    title: 'Kickoff Call',
    sum: 'Everyone leaves knowing the goal, the dates and what I need from them.',
    s: [
      {
        h: 'Agenda',
        ol: [
          'Introductions and roles (5 min)',
          'Goals and success measures (5 min)',
          'Walk through the current process on screen (10 min)',
          'Go through the Access Checklist (5 min)',
          'Timeline, update schedule and first deliverable (5 min)'
        ]
      },
      { h: 'After', ul: ['Send a recap within 24 hours.', 'Put the milestone demos in the calendar.'] }
    ]
  },
  {
    id: 'access',
    cat: 'Delivery',
    ph: 'kickoff',
    title: 'Secure Access',
    sum: 'Least privilege in, clean exit out. The client owns every account.',
    s: [
      {
        h: 'Rules',
        ul: [
          'Ask for user invites or sign-in connections, not shared passwords.',
          'API keys: one per project, shared through a password manager or a one-time link.',
          'Request only the permissions each workflow needs.',
          "Keep credentials in the platform's credential store, never in documents or chat.",
          'Test every connection on day one.',
          'At handover, move credentials to client-owned accounts and remove my access, or limit it to support.'
        ]
      }
    ]
  },
  {
    id: 'build',
    cat: 'Delivery',
    ph: 'build',
    title: 'Build Standards',
    sum: 'Every workflow should be easy to read, fail safely and be recoverable.',
    s: [
      {
        h: 'Standards',
        ul: [
          'Name workflows Client – Process – Step, e.g. “Acme – Invoices – Intake”.',
          'One workflow, one job. Use sub-workflows for shared steps.',
          'An error workflow on every live workflow, alerting by Slack or email.',
          'Retries with waits on outside calls. Check for duplicates before creating records.',
          'A human review step before anything costly: payments, customer messages, deletions.',
          'AI steps return structured output that is validated; unclear results go to a person.',
          'Notes on complex steps. No secrets in step text.',
          "Export the workflow files to the client's backup folder after each milestone."
        ]
      }
    ]
  },
  {
    id: 'testing',
    cat: 'Delivery',
    ph: 'build',
    title: 'Testing Checklist',
    sum: 'Test the ugly cases, not just the normal one. Keep a log for the Completion Report.',
    s: [
      {
        h: 'Test every module for',
        ul: [
          'Standard case',
          'Missing field',
          'Duplicate entry',
          'App not responding or timing out',
          'Wrong format: dates, currency, phone numbers',
          'A burst of high volume',
          'Unexpected AI output',
          'Expired credentials',
          "The client's own unusual cases from the audit",
          'The failure alert actually arriving'
        ]
      },
      { h: 'Test log', p: 'For each case record the input, the expected result, the actual result and pass or fail.' }
    ]
  },
  {
    id: 'demo',
    cat: 'Delivery',
    ph: 'build',
    title: 'Module Demo & Sign-off',
    sum: 'Show it, let them try it, get it in writing, invoice the same day.',
    s: [
      {
        h: 'Steps',
        ol: [
          'Show it working on a real example.',
          'Show what happens when something goes wrong.',
          'Let them try it.',
          'List any fixes that are within scope.',
          'Get written sign-off. An email is fine.',
          'Send the milestone invoice the same day.'
        ]
      }
    ]
  },
  {
    id: 'scope',
    cat: 'Delivery',
    ph: 'build',
    title: 'Handling Scope Changes',
    sum: 'Say yes to the idea and no to free work.',
    s: [
      {
        h: 'Rules',
        ul: [
          'A small fix inside the agreed scope: just do it.',
          'A new feature, integration or changed rule: a Change Request with cost and timeline.',
          'No work on a change until the Change Request is signed.'
        ]
      },
      {
        h: 'What to say',
        p: "“Happy to add that. It's outside the current scope, so I'll send a short change request with the cost and timing.”"
      }
    ]
  },
  {
    id: 'handover',
    cat: 'Delivery',
    ph: 'handover',
    time: '60–70 min',
    title: 'Handover Session',
    sum: "The client's team should leave able to run the system without me. The signed acceptance starts the support period.",
    s: [
      {
        h: 'Steps',
        ol: [
          'Send the User Guide, SOP and Technical Documentation two or three days before.',
          'Record the session.',
          'Follow one real item through the whole system.',
          "The client's team performs each task while I guide.",
          'Cover alerts, approvals and pausing a workflow.',
          'Confirm the ownership transfer.',
          'Get the Handover Acceptance signed.'
        ]
      }
    ]
  },
  {
    id: 'collect',
    cat: 'Delivery',
    ph: 'handover',
    title: 'Getting Paid on Time',
    sum: 'Invoice on sign-off, confirm receipt, follow up on a schedule.',
    s: [
      {
        h: 'Sequence',
        ol: [
          'Invoice the day a milestone is signed off.',
          'Send the Payment Receipt as soon as it arrives.',
          '3 days before due: friendly reminder.',
          'On the due date: due-today email.',
          '7 days late: overdue email.',
          'At the agreed limit: final notice, and work pauses under the Late Payments clause.'
        ]
      }
    ]
  },
  {
    id: 'checkin',
    cat: 'Growth',
    ph: 'grow',
    title: 'Post-Launch Check-ins',
    sum: 'Short, planned check-ins catch problems early and collect the numbers for the case study.',
    s: [
      {
        h: 'Schedule',
        ul: [
          'Day 2: a quick message asking if anything looks odd.',
          'Day 7: review the execution logs together and fix small issues.',
          'Day 30: compare the results with the audit estimates: hours saved, response time, errors.',
          'Before support ends: the retainer conversation.'
        ]
      }
    ]
  },
  {
    id: 'retainer',
    cat: 'Growth',
    ph: 'grow',
    title: 'Offering the Retainer',
    sum: 'Offer it in week three of the support period, after they have seen results.',
    s: [
      {
        h: 'How',
        ul: [
          'Frame it as keeping the system working as their tools change: monitoring, fixes, updates and improvements.',
          'A flat monthly fee with included hours and response times.',
          'Show them what the Monthly Support Report will look like.'
        ]
      },
      {
        h: 'What to say',
        p: '“Your tools will keep changing. With the retainer I catch problems before your team does, and we keep improving the system each month.”'
      }
    ]
  },
  {
    id: 'expand',
    cat: 'Growth',
    ph: 'grow',
    title: 'Growing the Account',
    sum: 'The audit plan is your pipeline. Phase 2 is the next proposal.',
    s: [
      {
        h: 'Ways in',
        ul: [
          'Propose the next phase from the audit plan once Phase 1 is paying back.',
          'Watch the Monthly Support Report for new bottlenecks.',
          "Hold a quarterly review: what changed, what's next.",
          'Offer training for new staff.'
        ]
      }
    ]
  },
  {
    id: 'referral',
    cat: 'Growth',
    ph: 'grow',
    title: 'Testimonials & Referrals',
    sum: 'Ask at day 30, when the results are visible.',
    s: [
      {
        h: 'Steps',
        ul: [
          'Send the Feedback & Testimonial form and agree on how their name can be used.',
          'Turn the results into a Case Study for ramonvallejera.com and LinkedIn.',
          'Ask for the referral.'
        ]
      },
      { h: 'What to say', p: '“Who else do you know who is buried in the same kind of admin?”' }
    ]
  }
]

export const GUIDE_BY_ID: Record<string, Guide> = Object.fromEntries(GUIDES.map(g => [g.id, g]))

export const REFERENCES: { title: string; href: string; note: string }[] = [
  {
    title: 'How to Perform a $60,000 AI Audit',
    href: 'https://www.youtube.com/watch?v=noivN2hIXLY',
    note: 'Liam Ottley (Morningside AI): stakeholder interviews, opportunity matrix, quick wins vs. big swings'
  },
  {
    title: 'How to Price AI Workflows (Without Losing Clients)',
    href: 'https://www.youtube.com/watch?v=wIcw0T9NhZM',
    note: 'Nate Herk: value-based pricing, the 10× return rule, the PRICE framework'
  },
  {
    title: 'How I Would Build a $1M AI Agency (If I Had to Start Over)',
    href: 'https://www.youtube.com/watch?v=Y0bokTp0MFk',
    note: 'Michele Torti'
  },
  {
    title: '100+ Hours of AI Consulting: Everything We Learned',
    href: 'https://www.youtube.com/watch?v=4UOqP9-q8ak',
    note: 'Nick Puru'
  },
  {
    title: 'How to Run an AI Audit That Actually Delivers ROI',
    href: 'https://newsletter.andrewdunn.co/p/how-to-run-an-ai-audit-that-actually-delivers-roi-not-just-hype',
    note: 'Andrew Dunn: the four-question fit test and 2×2 quadrants'
  },
  {
    title: 'The AI Audit',
    href: 'https://audit.boomautomations.com/',
    note: 'Boom Automations: Impact × Effort × Confidence scoring'
  }
]

/** Opportunity Matrix row, stored per client. Difficulty 5 is hardest. */
export type Opportunity = { name: string; hrs: number; imp: number; dif: number; con: number }

export const oppScore = (o: Opportunity) => o.imp * (6 - o.dif) * o.con

export type Quadrant = 'qw' | 'bs' | 'fi' | 'mp'

export const QUADRANT_LABEL: Record<Quadrant, string> = {
  qw: 'Quick Win',
  bs: 'Big Swing',
  fi: 'Fill-in',
  mp: 'Money Pit'
}

export function quadrant(o: Opportunity): Quadrant {
  const high = o.imp >= 3
  const easy = o.dif <= 3

  return high && easy ? 'qw' : high ? 'bs' : easy ? 'fi' : 'mp'
}

/** ROI calculator inputs, kept as strings so a half-typed number survives a save. */
export type RoiInputs = {
  cur: string
  hrs: string
  rate: string
  wks: string
  oth: string
  run: string
  price: string
  bh: string
}

export const ROI_DEFAULTS: RoiInputs = {
  cur: 'USD',
  hrs: '12',
  rate: '25',
  wks: '50',
  oth: '0',
  run: '50',
  price: '',
  bh: ''
}

/** One client engagement, as stored in Supabase. */
export type Engagement = {
  id: string
  client: string
  project: string
  checks: Record<string, boolean>
  opps: Opportunity[]
  roi: Partial<RoiInputs>
  created_at: string
}

export const itemId = (phaseId: string, index: number) => `${phaseId}-${index}`
