import layout from '@/content/demos/hotel-employee-onboarding.layout.json'
import { at, clock, longDay, shift, workday } from '@/lib/demos/sample'
import type { DemoBundle, DemoLayout, DemoScenario } from '@/lib/demos/types'

/**
 * Onboarding for Casa Marindo Hotel Group, the client named in the build.
 *
 * Three ways in: HR's new-hire form, the new hire's document upload form, and
 * the HR policy assistant's chat. Field names are the build's own (the forms'
 * fields, the plan's return, the Airtable columns); the task and document
 * lists are the plan's rules for a Front Desk Agent. People are made up.
 */

const COMPANY = 'Casa Marindo Hotel Group'
const BASE = 'Casa Marindo Onboarding'

const TASKS = [
  { title: 'Create hotel system (PMS) login and set permissions', owner: 'IT', offset: -3 },
  { title: 'Issue key card and set which doors it opens', owner: 'IT', offset: -2 },
  { title: 'Order uniform in the confirmed size', owner: 'HR', offset: -5 },
  { title: 'Add to payroll and benefits', owner: 'HR', offset: -2 },
  { title: 'Add to shift schedule', owner: 'Manager', offset: -2 },
  { title: 'Assign an onboarding buddy on the same shifts', owner: 'Manager', offset: -2 },
  { title: 'Hotel tour and fire exit walkthrough', owner: 'HR', offset: 0 },
  { title: 'Health and safety training', owner: 'HR', offset: 0 },
  {
    title: 'Give front desk access in hotel system (check-in, guest bills, room assignments)',
    owner: 'IT',
    offset: -1
  },
  { title: 'Set up phone extension and headset', owner: 'IT', offset: -1 },
  { title: 'Cash drawer and end-of-shift cash-up training', owner: 'Manager', offset: 1 },
  { title: 'Briefing on handling guest complaints', owner: 'Manager', offset: 2 }
]

const DOCUMENTS = ['Government ID', 'Right to work document', 'Tax form', 'Bank details', 'Signed contract']

function scenarios(now: Date): DemoScenario[] {
  const startDate = workday(now, 8)
  const startsOn = longDay(startDate)
  const sent = clock(new Date(now.getTime() + 60_000))

  const hire = {
    fullName: 'Elena Duarte',
    personalEmail: 'elena.duarte@example.com',
    workEmail: 'elena.duarte@casamarindo.example',
    role: 'Front Desk Agent',
    department: 'Front Office',
    property: 'Casa Marindo Bayfront',
    managerEmail: 'j.moreno@casamarindo.example',
    location: 'San Diego',
    startDate,
    employmentType: 'Full-time',
    uniformSize: 'M'
  }

  const folderUrl = 'https://drive.google.com/drive/folders/1ElenaDuarteOnboarding'

  const tasks = TASKS.map(task => ({
    taskKey: `${hire.personalEmail}:${task.title}`,
    title: task.title,
    owner: task.owner,
    dueDate: shift(startDate, task.offset),
    employeeEmail: hire.personalEmail
  }))

  const documents = DOCUMENTS.map(documentName => ({
    documentKey: `${hire.personalEmail}:${documentName}`,
    documentName,
    employeeEmail: hire.personalEmail,
    status: 'requested'
  }))

  const plan = {
    ...hire,
    taskCount: tasks.length,
    documentCount: documents.length,
    planTasks: tasks,
    planDocuments: documents
  }

  const welcome = `Hi ${hire.fullName},\n\nWelcome to ${COMPANY}. We're looking forward to you joining ${hire.department} at ${hire.property} as ${hire.role} on ${startDate}.\n\nBefore your first shift, please upload these ${documents.length} documents:\n${DOCUMENTS.map(d => `- ${d}`).join('\n')}\n\nUpload them here, one at a time, using this email address:\nhttps://your-n8n-instance.example.com/form/onboarding-document-upload\n\nYour uniform has been ordered in size ${hire.uniformSize}. Your hotel tour and fire exit walkthrough are already in the calendar, and your shift manager has been told you're coming.\n\nSee you soon,\nThe People Team\n${COMPANY}`

  const newHire: DemoScenario = {
    id: 'new-hire',
    label: 'New hire · Front Desk Agent',
    hint: 'One form from HR: folder, record, orientation, IT and manager told, welcome email, tasks and documents.',
    output: {
      'New Hire Intake Form': {
        'Full name': hire.fullName,
        'Personal email': hire.personalEmail,
        'Proposed work email': hire.workEmail,
        Role: hire.role,
        Department: hire.department,
        Property: hire.property,
        'Shift manager email': hire.managerEmail,
        City: hire.location,
        'Start date': startDate,
        'Employment type': hire.employmentType,
        'Uniform size': hire.uniformSize,
        submittedAt: now.toISOString()
      },
      'Clean Up New Hire Details': { ...hire, submittedAt: now.toISOString() },
      'Details Complete?': hire,
      'Generate Onboarding Plan': plan,
      'Create Onboarding Folder': {
        id: '1ElenaDuarteOnboarding',
        name: `${hire.fullName} - Onboarding`,
        webViewLink: folderUrl
      },
      'Create Employee Record': {
        id: 'recElenaDuarte01',
        fields: { ...hire, taskCount: 12, documentCount: 5, folderUrl, status: 'onboarding' }
      },
      'Book Day 1 Orientation': {
        id: 'demo3orientation',
        status: 'confirmed',
        summary: `Day 1 Orientation - ${hire.fullName}`,
        start: { dateTime: at(startDate, '09:00') },
        end: { dateTime: at(startDate, '10:30') }
      },
      'Notify IT And Manager': { ok: true, channel: 'onboarding', ts: '1762653001.000100' },
      'Send Welcome Email': { id: '19b0c5a9e1f04d77', labelIds: ['SENT'] },
      'Log Onboarding Started': {
        submittedAt: now.toISOString(),
        fullName: hire.fullName,
        role: hire.role,
        startDate,
        taskCount: 12,
        documentCount: 5
      },
      'One Row Per Task': tasks,
      'Save Tasks To Airtable': tasks,
      'Find Received Document Records': {},
      'Find Received Documents': { received: [] },
      'Documents Still Needed': documents,
      'Save Document Checklist To Airtable': documents
    },
    outcomes: [
      {
        kind: 'slack',
        node: 'Notify IT And Manager',
        channel: 'onboarding',
        app: 'n8n',
        time: 'just now',
        text: [
          `:hotel: *New hire onboarding started - ${COMPANY}*`,
          '',
          `*${hire.fullName}* - ${hire.role}, ${hire.department}`,
          `Hotel: *${hire.property}*`,
          `Start date: *${startDate}*`,
          `Shift manager: ${hire.managerEmail}`,
          `Uniform size: ${hire.uniformSize}`,
          '',
          '*12 tasks* created - hotel system access, key card, uniform, shift schedule, certificates',
          '*5 documents* requested from the new hire',
          '',
          'IT: tick *itProvisioned* in Airtable once hotel system access and the key card are set up.'
        ]
      },
      {
        kind: 'email',
        node: 'Send Welcome Email',
        from: 'The People Team',
        to: hire.personalEmail,
        subject: `Welcome to the team, ${hire.fullName}`,
        body: welcome,
        time: sent
      },
      {
        kind: 'calendar',
        node: 'Book Day 1 Orientation',
        title: `Day 1 Orientation - ${hire.fullName}`,
        date: startsOn,
        time: '9:00 – 10:30am',
        guests: ['People Team (organizer)', hire.personalEmail, hire.managerEmail],
        note: `Welcome session for ${hire.fullName} joining ${hire.department} as ${hire.role}.`
      },
      {
        kind: 'airtable',
        node: 'Create Employee Record',
        file: BASE,
        table: 'Employees',
        columns: ['fullName', 'role', 'property', 'startDate', 'taskCount', 'documentCount', 'status'],
        rows: [
          ['Marco Bellini', 'F&B Server', 'Casa Marindo Bayfront', shift(startDate, -14), 12, 7, 'onboarding'],
          [hire.fullName, hire.role, hire.property, startDate, 12, 5, 'onboarding']
        ],
        highlight: 1
      }
    ]
  }

  const uploaded = {
    'Your personal email': hire.personalEmail,
    'Which document is this?': 'Government ID',
    File: 'elena-duarte-passport.pdf'
  }

  const upload: DemoScenario = {
    id: 'upload',
    label: 'Upload · Government ID',
    hint: 'Elena uploads her ID: filed in her Drive folder, ticked off in Airtable, HR told.',
    output: {
      'Document Upload Form': {
        employeeEmail: hire.personalEmail,
        documentName: 'Government ID',
        document: { fileName: uploaded.File, mimeType: 'application/pdf', fileSize: '412 kB' },
        submittedAt: now.toISOString()
      },
      'Find New Hire': { id: 'recElenaDuarte01', fields: { personalEmail: hire.personalEmail, folderUrl } },
      'Known New Hire?': { id: 'recElenaDuarte01' },
      'Attach Uploaded File': { documentName: 'Government ID', fileName: 'Elena Duarte - Government ID.pdf' },
      'Save Document To Drive': {
        id: '1ElenaGovId',
        name: 'Elena Duarte - Government ID.pdf',
        webViewLink: 'https://drive.google.com/file/d/1ElenaGovId/view'
      },
      'Mark Document Received': {
        documentKey: `${hire.personalEmail}:Government ID`,
        documentName: 'Government ID',
        status: 'received',
        receivedAt: now.toISOString()
      },
      'Notify HR - Document Received': { ok: true, channel: 'onboarding', ts: '1762653201.000200' }
    },
    outcomes: [
      {
        kind: 'form',
        node: 'Document Upload Form',
        title: `${COMPANY} - Upload an onboarding document`,
        fields: Object.entries(uploaded).map(([label, value]) => ({ label, value }))
      },
      {
        kind: 'slack',
        node: 'Notify HR - Document Received',
        channel: 'onboarding',
        app: 'n8n',
        time: 'just now',
        text: [':inbox_tray: *Onboarding document received*', `Government ID from ${hire.personalEmail}`]
      },
      {
        kind: 'airtable',
        node: 'Mark Document Received',
        file: BASE,
        table: 'Onboarding Documents',
        columns: ['documentName', 'employeeEmail', 'status'],
        rows: DOCUMENTS.map(name => [name, hire.personalEmail, name === 'Government ID' ? 'received' : 'requested']),
        highlight: 0
      }
    ]
  }

  const question = 'How many days of annual leave do I get in my first year?'

  const answer =
    'Full-time staff accrue 15 days of paid annual leave a year, from their start date. The Leave Policy says: "Leave accrues monthly and can be taken once probation ends." (Source: Casa Marindo Leave Policy, section 2.1)'

  const assistant: DemoScenario = {
    id: 'assistant',
    label: 'HR assistant · leave question',
    hint: 'Answers from the policy documents only, quoting the wording and naming the source.',
    output: {
      'HR Assistant Chat': { sessionId: 'demo-session-elena', action: 'sendMessage', chatInput: question },
      'AI Model - HR Assistant': { model: 'gpt-4o-mini', tokenUsage: { promptTokens: 1544, completionTokens: 86 } },
      'Chat Memory': { sessionId: 'demo-session-elena', messages: 2 },
      'Search HR Policies': [
        {
          pageContent: 'Annual leave. Full-time staff accrue 15 days of paid annual leave a year...',
          source: 'Leave Policy'
        }
      ],
      'HR Assistant (AI)': { output: answer }
    },
    outcomes: [
      {
        kind: 'chat',
        node: 'HR Assistant (AI)',
        app: 'n8n chat',
        title: 'HR Assistant',
        lines: [
          { from: 'person', text: question },
          { from: 'agent', text: answer }
        ]
      }
    ]
  }

  return [newHire, upload, assistant]
}

export const hotelEmployeeOnboarding: DemoBundle = {
  layout: layout as DemoLayout,
  scenarios
}
