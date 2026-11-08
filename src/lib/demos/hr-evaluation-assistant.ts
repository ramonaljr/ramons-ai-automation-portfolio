import layout from '@/content/demos/hr-evaluation-assistant.layout.json'
import type { DemoBundle, DemoLayout, DemoScenario } from '@/lib/demos/types'

/**
 * Applicant screening: two applicants for the Automation Specialist role.
 *
 * The field names are the build's own (the form's labels, the Airtable
 * columns, each structured output parser's schema), so a node's output here
 * reads the way it does in n8n. People, IDs and links are made up.
 */

const ROLE = 'Automation Specialist'
const TIME_ZONE = 'America/Chicago'

const JOB_POSTING = {
  id: 'recJ0bAutoSpec01',
  fields: {
    Role: ROLE,
    Requirements:
      '3+ years building business automations (n8n, Make or Zapier); REST APIs and webhooks; Airtable or another database; clear written English.',
    'Nice to have': 'AI agents in production, JavaScript in Code nodes',
    Location: 'Remote, overlapping US Central hours'
  }
}

/** UTC offset of Central time on a date, as n8n prints it: "-06:00". */
function centralOffset(date: Date) {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, timeZoneName: 'shortOffset' })
    .formatToParts(date)
    .find(part => part.type === 'timeZoneName')?.value

  const hours = Number(name?.replace('GMT', '') || -6)

  return `${hours < 0 ? '-' : '+'}${String(Math.abs(hours)).padStart(2, '0')}:00`
}

/** The next weekday after today, 10:00 AM Central, as the Book Meeting agent would propose it. */
function interviewSlot(now: Date) {
  const day = new Date(now)

  do day.setUTCDate(day.getUTCDate() + 1)
  while (day.getUTCDay() === 0 || day.getUTCDay() === 6)

  const date = day.toISOString().slice(0, 10)
  const offset = centralOffset(day)
  const start = new Date(`${date}T10:00:00${offset}`)
  const end = new Date(start.getTime() + 30 * 60 * 1000)

  return { date, offset, start, end, local: (time: string) => `${date}T${time}:00${offset}` }
}

/** The steps every applicant goes through before the decision. */
function intake(person: {
  first: string
  last: string
  email: string
  phone: number
  years: number
  cvText: string
  applied: Date
}) {
  const name = `${person.first} ${person.last}`
  const file = `${person.first}_${person.last}_CV.pdf`
  const link = `https://drive.google.com/file/d/1${person.first.toLowerCase()}CvDemoFile/view`
  const record = `rec${person.first}${person.last}`.slice(0, 17)

  return {
    record,
    name,
    link,
    output: {
      'On form submission': {
        'First Name': person.first,
        'Last Name': person.last,
        Email: person.email,
        Phone: person.phone,
        'Years of Experience': person.years,
        'Upload your CV': { fileName: file, mimeType: 'application/pdf', fileSize: '182 kB' },
        submittedAt: person.applied.toISOString(),
        formMode: 'production'
      },
      'Upload CV to Google Drive': {
        id: `1${person.first.toLowerCase()}CvDemoFile`,
        name: file,
        mimeType: 'application/pdf',
        webViewLink: link
      },
      'Edit Fields': {
        Name: name,
        Phone: person.phone,
        Email: person.email,
        Experience: person.years,
        'Applied On': person.applied.toISOString().slice(0, 10),
        'CV Link': link
      },
      'Airtable Job Applicants': {
        id: record,
        createdTime: person.applied.toISOString(),
        fields: {
          Name: name,
          'Applying for': [ROLE],
          'Email address': person.email,
          Phone: person.phone,
          'CV Link': link
        }
      },
      'Download file': { fileName: file, mimeType: 'application/pdf', fileSize: '182 kB', binary: 'data' },
      'Extract from File': { numpages: 2, text: person.cvText },
      'Search records in Airtable': JOB_POSTING
    } as Record<string, unknown>
  }
}

function scenarios(now: Date): DemoScenario[] {
  const applied = new Date(now.getTime() - 4 * 60 * 1000)
  const slot = interviewSlot(now)

  const day = slot.start.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: TIME_ZONE
  })

  const sentAt = new Date(now.getTime() + 60 * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: TIME_ZONE
  })

  /** Earlier applicants already in the table, so the new row has company. */
  const earlier: (string | number)[][] = [
    ['Priya Nair', ROLE, 'Interviewing', 0.82, '', 'Four years of Zapier and n8n builds for a fintech ops team.'],
    ['Tom Becker', ROLE, 'No hire', 0.24, '', 'Marketing background; no automation work listed.']
  ]

  const columns = ['Name', 'Applying for', 'Stage', 'JD CV score', 'Phone interview', 'CV Score Notes']

  const maria = intake({
    first: 'Maria',
    last: 'Santos',
    email: 'maria.santos@example.com',
    phone: 5550142,
    years: 5,
    applied,
    cvText:
      'MARIA SANTOS\nAutomation Specialist\n\nEXPERIENCE\nAutomation Lead, Brightline Logistics (2023 to now)\n- Built 40+ n8n workflows: order intake, invoice matching, carrier updates\n- Moved support triage to an AI agent with human review; first reply 6h to 4 min\nOperations Analyst, Northpeak Retail (2021 to 2023)\n- Zapier and Make automations between Shopify, Airtable and Slack\n\nSKILLS\nn8n, Make, Zapier, REST APIs, webhooks, Airtable, PostgreSQL, JavaScript'
  })

  const questions = [
    'Which n8n workflow at Brightline are you proudest of, and what did it replace?',
    'How did you keep the AI support agent from sending a wrong answer to a customer?',
    'Tell us about an automation that failed in production. How did you find out, and what changed?',
    'How do you decide between building in n8n, Make or Zapier for a client?',
    'What would you want to automate first in a recruiting team like ours?'
  ]

  const answers = [
    'Invoice matching. It checks each invoice against the PO and delivery record and only sends exceptions to a person.',
    'Every draft went to a review queue for the first month, and anything under a confidence threshold still does.',
    'A carrier changed its API and orders stopped updating. I added an error workflow that posts to Slack within a minute.',
    'Volume, who maintains it afterwards, and whether it needs code. Simple app-to-app flows go to Zapier.',
    'Screening and scheduling. Those are the steps where good applicants wait longest.'
  ]

  const invite = {
    Subject: `Interview invitation: ${ROLE}`,
    EmailContent: `Hi Maria Santos,\n\nThank you for applying for the ${ROLE} role and for your thoughtful answers. Your work moving support triage to a reviewed AI agent is exactly the kind of judgement we are looking for.\n\nWe would like to invite you to a 30-minute phone interview. You will receive a calendar invite shortly.\n\nBest regards,\nThe Hiring Team`
  }

  const screening =
    '1. Walk me through the invoice-matching workflow: where do exceptions go, and who owns them?\n2. What confidence threshold did you use for the support agent, and how did you choose it?\n3. How do you document a workflow so someone else can maintain it?\n4. Describe your error-handling pattern in n8n.\n5. Which of your answers in the questionnaire would you expand on, and why?'

  const strong: DemoScenario = {
    id: 'strong',
    label: 'Maria Santos · 5 yrs',
    hint: 'Strong match: shortlisted, questioned, invited and booked.',
    waits: { Questionnaire: 'Waiting for Maria to answer the questions' },
    output: {
      ...maria.output,
      'Groq Chat Model': { model: 'llama-3.3-70b-versatile', tokenUsage: { promptTokens: 1184, completionTokens: 31 } },
      'Structured Output Parser': {
        output: { score: 0.88, reason: 'Five years building n8n and Make automations; meets every listed requirement.' }
      },
      'AI Agent': {
        output: { score: 0.88, reason: 'Five years building n8n and Make automations; meets every listed requirement.' }
      },
      If: {
        output: { score: 0.88, reason: 'Five years building n8n and Make automations; meets every listed requirement.' }
      },
      'Potential Hire': {
        id: maria.record,
        fields: {
          Name: maria.name,
          Stage: 'Interviewing',
          'JD CV score': 0.88,
          'CV Score Notes': 'Five years building n8n and Make automations; meets every listed requirement.'
        }
      },
      'Search records in Airtable1': JOB_POSTING,
      'OpenAI Chat Model': { model: 'gpt-4o-mini', tokenUsage: { promptTokens: 1402, completionTokens: 148 } },
      'Structured Output Parser1': { output: { questions } },
      'Generate Questionaire': { output: { questions } },
      Questionnaire: Object.fromEntries(questions.map((question, index) => [question, answers[index]])),
      'Save Questionnaire Answers': {
        id: maria.record,
        fields: {
          'Questionnaires and responses': questions
            .map((question, index) => `${question}\n\n_\n\n${answers[index]}`)
            .join('\n\n')
        }
      },
      get_job_posting: JOB_POSTING,
      'Get a record in Airtable': { id: maria.record, fields: { Name: maria.name, Stage: 'Interviewing' } },
      'Groq Chat Model1': {
        model: 'llama-3.3-70b-versatile',
        tokenUsage: { promptTokens: 1977, completionTokens: 164 }
      },
      'Structured Output Parser2': { output: invite },
      'Personalized Email': { output: invite },
      'Edit Fields1': { subject: invite.Subject, emailContent: invite.EmailContent },
      'Send a message': { id: '19a3f2c8d41e7b05', threadId: '19a3f2c8d41e7b05', labelIds: ['SENT'] },
      'Groq Chat Model2': { model: 'llama-3.3-70b-versatile', tokenUsage: { promptTokens: 866, completionTokens: 38 } },
      'Read Interviewer Calendar': [
        { summary: 'Team stand-up', start: { dateTime: slot.local('09:00') }, end: { dateTime: slot.local('09:15') } },
        { summary: 'Lunch', start: { dateTime: slot.local('12:00') }, end: { dateTime: slot.local('13:00') } }
      ],
      'Structured Output Parser3': { output: { startTime: slot.local('10:00'), endTime: slot.local('10:30') } },
      'Book Meeting': { output: { startTime: slot.local('10:00'), endTime: slot.local('10:30') } },
      'Get Interviewer Week': [
        { summary: 'Team stand-up', start: { dateTime: slot.local('09:00') }, end: { dateTime: slot.local('09:15') } },
        { summary: 'Lunch', start: { dateTime: slot.local('12:00') }, end: { dateTime: slot.local('13:00') } },
        { summary: 'Hiring sync', start: { dateTime: slot.local('15:00') }, end: { dateTime: slot.local('15:30') } }
      ],
      'Confirm Interview Slot': {
        startTime: slot.start.toISOString(),
        endTime: slot.end.toISOString(),
        source: 'agent',
        proposedStartTime: slot.local('10:00')
      },
      'Book Interview': {
        id: 'demo7k2interview',
        status: 'confirmed',
        summary: `Phone interview: ${maria.name}`,
        location: 'Online',
        start: { dateTime: slot.local('10:00'), timeZone: TIME_ZONE },
        end: { dateTime: slot.local('10:30'), timeZone: TIME_ZONE },
        attendees: [{ email: 'maria.santos@example.com', responseStatus: 'needsAction' }]
      },
      'Update Interview Schedule': {
        id: maria.record,
        fields: { Name: maria.name, Stage: 'Interviewing', 'Phone interview': slot.start.toISOString() }
      },
      'Search records in Airtable2': JOB_POSTING,
      'Get a record in Airtable1': { id: maria.record, fields: { Name: maria.name, 'CV Link': maria.link } },
      'OpenAI Chat Model1': { model: 'gpt-4o-mini', tokenUsage: { promptTokens: 2310, completionTokens: 172 } },
      'Screening Questions via Phone': { output: screening },
      'Edit Fields2': { screeningQuestions: screening },
      'Update record': {
        id: maria.record,
        fields: { Name: maria.name, 'Phone interview screening questions': screening }
      }
    },
    outcomes: [
      {
        kind: 'form',
        node: 'Questionnaire',
        title: 'Questionnaire',
        fields: questions.map((question, index) => ({ label: question, value: answers[index] }))
      },
      {
        kind: 'email',
        node: 'Send a message',
        from: 'Hiring Team',
        to: 'maria.santos@example.com',
        subject: invite.Subject,
        body: invite.EmailContent,
        time: sentAt
      },
      {
        kind: 'calendar',
        node: 'Book Interview',
        title: `Phone interview: ${maria.name}`,
        date: day,
        time: '10:00 – 10:30am (Central)',
        location: 'Online',
        guests: ['you@example.com (organizer)', 'maria.santos@example.com']
      },
      {
        kind: 'airtable',
        node: 'Update Interview Schedule',
        file: 'Applicant Tracker',
        table: 'Applicants',
        columns,
        rows: [
          ...earlier,
          [
            maria.name,
            ROLE,
            'Interviewing',
            0.88,
            `${day.split(', ')[1]}, 10:00am`,
            'Five years building n8n and Make automations; meets every listed requirement.'
          ]
        ],
        highlight: 2
      }
    ]
  }

  const daniel = intake({
    first: 'Daniel',
    last: 'Reyes',
    email: 'daniel.reyes@example.com',
    phone: 5550187,
    years: 1,
    applied,
    cvText:
      'DANIEL REYES\nCustomer Service Representative\n\nEXPERIENCE\nCustomer Service Representative, Harbor Telecom (2025 to now)\n- Answered 60+ tickets a day in Zendesk\n- Built two Zapier zaps that copy new tickets into Google Sheets\n\nSKILLS\nZendesk, Google Sheets, Zapier (basic), typing 70 wpm'
  })

  const verdict = {
    score: 0.31,
    reason: 'One year in support with basic Zapier use; the role asks for three years building automations.'
  }

  const weak: DemoScenario = {
    id: 'weak',
    label: 'Daniel Reyes · 1 yr',
    hint: 'Weak match: declined, with the reason on record.',
    branch: { If: 1 },
    output: {
      ...daniel.output,
      'Groq Chat Model': { model: 'llama-3.3-70b-versatile', tokenUsage: { promptTokens: 1096, completionTokens: 34 } },
      'Structured Output Parser': { output: verdict },
      'AI Agent': { output: verdict },
      If: { output: verdict },
      Rejected: {
        id: daniel.record,
        fields: { Name: daniel.name, Stage: 'No hire', 'JD CV score': verdict.score, 'CV Score Notes': verdict.reason }
      }
    },
    outcomes: [
      {
        kind: 'airtable',
        node: 'Rejected',
        file: 'Applicant Tracker',
        table: 'Applicants',
        columns,
        rows: [...earlier, [daniel.name, ROLE, 'No hire', verdict.score, '', verdict.reason]],
        highlight: 2
      }
    ]
  }

  return [strong, weak]
}

export const hrEvaluationAssistant: DemoBundle = {
  layout: layout as DemoLayout,
  scenarios
}
