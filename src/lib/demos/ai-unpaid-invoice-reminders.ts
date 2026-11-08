import layout from '@/content/demos/ai-unpaid-invoice-reminders.layout.json'
import { clock, dayFrom } from '@/lib/demos/sample'
import type { DemoBundle, DemoLayout, DemoScenario } from '@/lib/demos/types'

/**
 * Collections for TalentBridge Staffing, the client named in the build.
 *
 * The daily run reads unpaid invoices from QuickBooks, works out each one's
 * stage from days overdue, and routes it: close it, remind, or final notice.
 * Replies come back through the Gmail trigger and are classified by AI; a
 * dispute stops reminders. Field names are the build's own (the decision
 * step's return, the collection_state columns, the dashboard's fields).
 * Customers and amounts are made up.
 */

const SENDER = 'TalentBridge Staffing Accounts'
const DASHBOARD = { file: 'TalentBridge AR Dashboard', table: 'Invoice Dashboard' }

const COLUMNS = [
  'invoiceNumber',
  'customerName',
  'amountDue',
  'daysOverdue',
  'collectionStage',
  'lastContacted',
  'outcome'
]

type Invoice = {
  invoiceId: string
  invoiceNumber: string
  customerName: string
  contactName: string
  contactEmail: string
  accountOwner: string
  amountDue: number
  daysOverdue: number
  collectionStage: string
  timesContacted: number
  openDealsCount: number
}

const decision = (invoice: Invoice, now: Date, action: string) => ({
  action,
  invoiceId: invoice.invoiceId,
  invoiceNumber: invoice.invoiceNumber,
  customerName: invoice.customerName,
  contactEmail: invoice.contactEmail,
  accountOwner: invoice.accountOwner,
  currency: 'USD',
  amountDue: invoice.amountDue,
  dueDate: dayFrom(now, -invoice.daysOverdue),
  daysOverdue: invoice.daysOverdue,
  collectionStage: invoice.collectionStage,
  timesContacted: invoice.timesContacted,
  promiseBroken: false,
  openDealsCount: invoice.openDealsCount,
  emailSubject:
    action === 'close_paid'
      ? ''
      : `TalentBridge Staffing - invoice ${invoice.invoiceNumber} is ${invoice.daysOverdue} days overdue`
})

/** QuickBooks through to the decision: the same front half for every daily run. */
function daily(now: Date, invoices: Invoice[], actions: string[]) {
  return {
    'Every Day At 8:00': { timestamp: now.toISOString() },
    'QuickBooks - Unpaid Invoices': invoices.map(i => ({
      Id: i.invoiceId,
      DocNumber: i.invoiceNumber,
      Balance: i.amountDue,
      DueDate: dayFrom(now, -i.daysOverdue),
      CustomerRef: { name: i.customerName }
    })),
    'QuickBooks - Customers': invoices.map(i => ({
      DisplayName: i.customerName,
      PrimaryEmailAddr: { Address: i.contactEmail }
    })),
    'Pipedrive - Customer Context': invoices.map(i => ({
      org: i.customerName,
      owner: i.accountOwner,
      open_deals_count: i.openDealsCount
    })),
    'Postgres - Load Collection State': invoices.map(i => ({
      invoice_id: i.invoiceId,
      invoice_number: i.invoiceNumber,
      customer_name: i.customerName,
      collection_stage: i.collectionStage,
      days_overdue: i.daysOverdue,
      times_contacted: i.timesContacted
    })),
    'Decide Who To Remind Today': invoices.map((invoice, index) => decision(invoice, now, actions[index])),
    'Route By Action': invoices.map((invoice, index) => decision(invoice, now, actions[index]))
  }
}

const reminderBody = (invoice: Invoice, dueDate: string, final: boolean) =>
  final
    ? `Hi ${invoice.contactName},\n\nInvoice ${invoice.invoiceNumber} for $${invoice.amountDue.toLocaleString('en-US')} was due on ${dueDate} and is now ${invoice.daysOverdue} days overdue. We have written ${invoice.timesContacted} times without a reply.\n\nThis is our final notice. Please arrange payment or reply this week; after that, ${invoice.accountOwner} will contact you directly.\n\nAccounts - TalentBridge Staffing`
    : `Hi ${invoice.contactName},\n\nA quick note that invoice ${invoice.invoiceNumber} for $${invoice.amountDue.toLocaleString('en-US')} was due on ${dueDate} and is now ${invoice.daysOverdue} days overdue.\n\nIf it is already in your payment run, thank you, and please ignore this. If anything on it looks wrong, just reply and we will look into it.\n\nAccounts - TalentBridge Staffing`

function scenarios(now: Date): DemoScenario[] {
  const today = dayFrom(now)
  const sent = clock(new Date(now.getTime() + 60_000))

  const paid: Invoice = {
    invoiceId: '1180',
    invoiceNumber: 'TB-1180',
    customerName: 'Lakeside Logistics',
    contactName: 'Amy',
    contactEmail: 'ap@lakesidelogistics.example',
    accountOwner: 'Dana Whitfield',
    amountDue: 0,
    daysOverdue: 0,
    collectionStage: 'closed',
    timesContacted: 1,
    openDealsCount: 1
  }

  const northgate: Invoice = {
    invoiceId: '1204',
    invoiceNumber: 'TB-1204',
    customerName: 'Northgate Clinics',
    contactName: 'Priya',
    contactEmail: 'priya.shah@northgateclinics.example',
    accountOwner: 'Dana Whitfield',
    amountDue: 8640,
    daysOverdue: 9,
    collectionStage: 'od_8_14',
    timesContacted: 1,
    openDealsCount: 2
  }

  const earlierRow = ['TB-1171', 'Brightwater Hotels', 12480, 4, 'od_1_7', dayFrom(now, -1), 'chased']

  const chase: DemoScenario = {
    id: 'chase',
    label: 'Daily 8:00 · reminder',
    hint: 'One invoice was paid overnight and is closed; one is 9 days overdue and gets a reminder.',
    branch: { 'Route By Action': [0, 2] },
    output: {
      ...daily(now, [paid, northgate], ['close_paid', 'chase']),
      'Postgres - Mark Invoice Paid': { invoice_id: paid.invoiceId, collection_stage: 'closed' },
      'AI Model - Write Email': { model: 'gpt-4o-mini', tokenUsage: { promptTokens: 642, completionTokens: 118 } },
      'AI Writes Reminder Email': { text: reminderBody(northgate, dayFrom(now, -9), false) },
      'Gmail - Send Reminder': { id: '19b0c3e1a77d2f04', threadId: '19b0c3e1a77d2f04', labelIds: ['SENT'] },
      'Postgres - Save Contact Made': {
        invoice_id: northgate.invoiceId,
        collection_stage: 'od_8_14',
        last_contacted: now.toISOString(),
        times_contacted: 2,
        next_action_date: dayFrom(now, 3)
      },
      'Airtable - Update Dashboard': [
        { fields: { invoiceNumber: paid.invoiceNumber, outcome: 'paid', collectionStage: 'closed' } },
        { fields: { invoiceNumber: northgate.invoiceNumber, outcome: 'chased', collectionStage: 'od_8_14' } }
      ]
    },
    outcomes: [
      {
        kind: 'email',
        node: 'Gmail - Send Reminder',
        from: SENDER,
        to: northgate.contactEmail,
        subject: `TalentBridge Staffing - invoice ${northgate.invoiceNumber} is 9 days overdue`,
        body: reminderBody(northgate, dayFrom(now, -9), false),
        time: sent
      },
      {
        kind: 'airtable',
        node: 'Airtable - Update Dashboard',
        ...DASHBOARD,
        columns: COLUMNS,
        rows: [
          earlierRow,
          [paid.invoiceNumber, paid.customerName, 0, 0, 'closed', today, 'paid'],
          [northgate.invoiceNumber, northgate.customerName, 8640, 9, 'od_8_14', today, 'chased']
        ],
        highlight: 2
      }
    ]
  }

  const harbor: Invoice = {
    invoiceId: '1139',
    invoiceNumber: 'TB-1139',
    customerName: 'Harbor Point Manufacturing',
    contactName: 'Greg',
    contactEmail: 'greg.olsen@harborpoint.example',
    accountOwner: 'Marcus Lee',
    amountDue: 21350,
    daysOverdue: 34,
    collectionStage: 'od_30_plus',
    timesContacted: 4,
    openDealsCount: 1
  }

  const finalNotice: DemoScenario = {
    id: 'final',
    label: 'Daily 8:00 · final notice',
    hint: '34 days overdue: the account owner is warned in Slack first, then the one final notice goes out.',
    branch: { 'Route By Action': 3 },
    output: {
      ...daily(now, [harbor], ['final_notice']),
      'Slack - Alert Owner Before Final Notice': { ok: true, channel: 'collections', ts: '1762652101.000300' },
      'Pipedrive - Log Final Notice': {
        id: 55301,
        subject: `Final notice sent: ${harbor.invoiceNumber}`,
        type: 'email'
      },
      'AI Model - Write Email': { model: 'gpt-4o-mini', tokenUsage: { promptTokens: 655, completionTokens: 131 } },
      'AI Writes Reminder Email': { text: reminderBody(harbor, dayFrom(now, -34), true) },
      'Gmail - Send Reminder': { id: '19b0c3f27c9e1a55', threadId: '19b0c3f27c9e1a55', labelIds: ['SENT'] },
      'Postgres - Save Contact Made': {
        invoice_id: harbor.invoiceId,
        collection_stage: 'final_notice_sent',
        last_contacted: now.toISOString(),
        times_contacted: 5
      },
      'Airtable - Update Dashboard': {
        fields: { invoiceNumber: harbor.invoiceNumber, outcome: 'chased', collectionStage: 'od_30_plus' }
      }
    },
    outcomes: [
      {
        kind: 'slack',
        node: 'Slack - Alert Owner Before Final Notice',
        channel: 'collections',
        app: 'n8n',
        time: 'just now',
        text: [
          ':rotating_light: *Invoice 30+ days overdue - final notice going out*',
          '',
          `*${harbor.customerName}* | account owner: ${harbor.accountOwner}`,
          `Invoice *${harbor.invoiceNumber}* | USD ${harbor.amountDue}`,
          `Due ${dayFrom(now, -34)} - *34 days overdue*`,
          'Already contacted 4 times',
          'Broke a promise to pay: No',
          '',
          'Open deals with this client in Pipedrive: 1 - worth a call before this goes further.',
          'This is the only final notice: after it, reminders stop and the account owner takes over.'
        ]
      },
      {
        kind: 'email',
        node: 'Gmail - Send Reminder',
        from: SENDER,
        to: harbor.contactEmail,
        subject: `TalentBridge Staffing - invoice ${harbor.invoiceNumber} is 34 days overdue`,
        body: reminderBody(harbor, dayFrom(now, -34), true),
        time: sent
      },
      {
        kind: 'airtable',
        node: 'Airtable - Update Dashboard',
        ...DASHBOARD,
        columns: COLUMNS,
        rows: [earlierRow, [harbor.invoiceNumber, harbor.customerName, 21350, 34, 'od_30_plus', today, 'chased']],
        highlight: 1
      }
    ]
  }

  const reason = 'Billed 168 hours for the week of the 3rd; our timesheets show 152.'

  const reply = {
    messageId: '19b0c41d03e6b8a2',
    threadId: '19b0c3e1a77d2f04',
    fromEmail: northgate.contactEmail,
    fromName: 'Priya Shah',
    subject: `Re: TalentBridge Staffing - invoice ${northgate.invoiceNumber} is 9 days overdue`,
    bodyText:
      "We're holding this one. You've billed 168 hours for the week of the 3rd but our signed timesheets show 152. Please send a corrected invoice.",
    receivedAt: now.toISOString()
  }

  const state = {
    invoice_id: northgate.invoiceId,
    invoice_number: northgate.invoiceNumber,
    customer_name: northgate.customerName,
    assigned_owner: northgate.accountOwner,
    collection_stage: 'od_8_14',
    dispute_status: 'none'
  }

  const dispute: DemoScenario = {
    id: 'dispute',
    label: 'Reply · disputes the hours',
    hint: 'The AI reads the reply as a dispute: reminders stop and the account owner is told why.',
    output: {
      'New Customer Reply': { id: reply.messageId, from: `Priya Shah <${reply.fromEmail}>`, subject: reply.subject },
      'Clean Up Reply': reply,
      'AI Model - Read Reply': { model: 'gpt-4o-mini', tokenUsage: { promptTokens: 1190, completionTokens: 74 } },
      'Classify Reply Intent': {
        output: {
          intent: 'invoice_dispute',
          invoiceNumber: northgate.invoiceNumber,
          disputeReason: reason,
          promiseDate: '',
          confidence: 0.95
        }
      },
      'Postgres - Find Invoice In State': state,
      'Invoice Found?': state,
      'Route By Reply Type': state,
      'Postgres - STOP REMINDERS (Dispute)': { ...state, dispute_status: 'open', collection_stage: 'disputed' },
      'Pipedrive - Create Dispute Activity': {
        id: 55318,
        subject: `Invoice dispute: ${northgate.invoiceNumber}`,
        type: 'task'
      },
      'Slack - Dispute Alert': { ok: true, channel: 'collections', ts: '1762652544.000500' },
      'Drive - Save Dispute Emails': {
        id: '1dispNorthgateTB1204',
        name: `Dispute - ${northgate.invoiceNumber} - ${northgate.customerName}.txt`
      },
      'Postgres - Log Reply': {
        invoice_id: northgate.invoiceId,
        event_type: 'reply',
        intent: 'invoice_dispute',
        confidence: 0.95,
        detail: reason
      },
      'Airtable - Update Dashboard (Reply)': {
        fields: { invoiceNumber: northgate.invoiceNumber, lastIntent: 'invoice_dispute', outcome: 'replied' }
      }
    },
    outcomes: [
      {
        kind: 'slack',
        node: 'Slack - Dispute Alert',
        channel: 'collections',
        app: 'n8n',
        time: 'just now',
        text: [
          ':no_entry: *INVOICE DISPUTED - reminders stopped*',
          '',
          `*${northgate.customerName}*`,
          `Invoice *${northgate.invoiceNumber}* | account owner: ${northgate.accountOwner}`,
          '',
          `*Reason given:* ${reason}`,
          '',
          'No more reminders will be sent for this invoice. The emails are saved to Google Drive.'
        ]
      },
      {
        kind: 'record',
        node: 'Postgres - STOP REMINDERS (Dispute)',
        app: 'PostgreSQL',
        title: 'talentbridge.collection_state',
        badge: 'Disputed',
        fields: [
          { label: 'invoice_number', value: northgate.invoiceNumber },
          { label: 'customer_name', value: northgate.customerName },
          { label: 'dispute_status', value: 'open' },
          { label: 'collection_stage', value: 'disputed' },
          { label: 'next_action_date', value: 'NULL (reminders stopped)' },
          { label: 'last_response', value: today }
        ]
      },
      {
        kind: 'airtable',
        node: 'Airtable - Update Dashboard (Reply)',
        ...DASHBOARD,
        columns: ['invoiceNumber', 'customerName', 'accountOwner', 'lastResponse', 'lastIntent', 'outcome'],
        rows: [
          ['TB-1171', 'Brightwater Hotels', 'Marcus Lee', dayFrom(now, -2), 'promise_to_pay', 'replied'],
          [northgate.invoiceNumber, northgate.customerName, northgate.accountOwner, today, 'invoice_dispute', 'replied']
        ],
        highlight: 1
      }
    ]
  }

  return [chase, finalNotice, dispute]
}

export const aiUnpaidInvoiceReminders: DemoBundle = {
  layout: layout as DemoLayout,
  scenarios
}
