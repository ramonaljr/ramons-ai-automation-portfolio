import layout from '@/content/demos/ai-invoice-processing-approval.layout.json'
import { dayFrom, shortDay, usd } from '@/lib/demos/sample'
import type { DemoBundle, DemoLayout, DemoOutcome, DemoScenario } from '@/lib/demos/types'

/**
 * Subcontractor invoices for a construction company's accounts payable.
 *
 * The Gmail trigger hands each email to its own run of "Process One Invoice
 * Email", so every scenario starts at both. Field names are the build's own:
 * the AI's extraction schema, the checks' return, the Audit Log columns.
 * Vendors, jobs and amounts are made up.
 */

type Invoice = {
  vendorName: string
  invoiceNumber: string
  poNumber: string
  jobNumber: string
  costCode: string
  claimType: string
  claimLabel: string
  invoiceDate: string
  dueDate: string
  claimedToDate: number
  previouslyCertified: number
  thisClaim: number
  retentionPercent: number
  tax: number
  lienWaiverAttached: boolean
  riskFlags: string[]
}

const CHANNEL = 'accounts-payable'

function figures(invoice: Invoice) {
  const retentionAmount = Math.round(invoice.thisClaim * invoice.retentionPercent) / 100
  const totalAmount = invoice.thisClaim + invoice.tax

  return { retentionAmount, totalAmount, netPayable: totalAmount - retentionAmount }
}

/** Gmail trigger to the AI's reading: the same for every invoice that is new. */
function intake(invoice: Invoice, email: { id: string; from: string; file: string }) {
  const { retentionAmount, totalAmount } = figures(invoice)
  const invoiceKey = `${email.id}::${email.file}`
  const text = `PAYMENT APPLICATION ${invoice.invoiceNumber}\n${invoice.vendorName}\nContract ${invoice.poNumber} · Job ${invoice.jobNumber} · ${invoice.costCode}\nClaimed to date ${usd(invoice.claimedToDate)}\nPreviously certified ${usd(invoice.previouslyCertified)}\nThis claim ${usd(invoice.thisClaim)}\nRetention ${invoice.retentionPercent}%\nTax ${usd(invoice.tax)}\nTotal due ${usd(totalAmount)}`

  return {
    invoiceKey,
    trigger: {
      'New Invoice Email': {
        id: email.id,
        from: email.from,
        subject: `Payment application ${invoice.invoiceNumber}`,
        attachment_0: { fileName: email.file, mimeType: 'application/pdf' }
      },
      'Hand Each Email To Its Own Run': { id: email.id, from: email.from },
      'Process One Invoice Email': {
        id: email.id,
        from: email.from,
        subject: `Payment application ${invoice.invoiceNumber}`
      },
      'Find PDF Attachment': { id: email.id, invoicePdf: { fileName: email.file, mimeType: 'application/pdf' } },
      'Has PDF Attachment?': { id: email.id },
      'Extract PDF Text': { numpages: 2, text },
      'Text Extracted?': { text },
      'Create Invoice ID': { invoiceKey, messageId: email.id, sourceFrom: email.from, invoiceText: text }
    },
    read: {
      'Search Invoice Log': {},
      'Seen This Invoice Before?': {},
      'OpenAI Chat Model': { model: 'gpt-4o-mini', tokenUsage: { promptTokens: 1610, completionTokens: 212 } },
      'AI Reads Invoice': {
        output: {
          vendorName: invoice.vendorName,
          invoiceNumber: invoice.invoiceNumber,
          poNumber: invoice.poNumber,
          jobNumber: invoice.jobNumber,
          costCode: invoice.costCode,
          claimType: invoice.claimType,
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.dueDate,
          currency: 'USD',
          claimedToDate: invoice.claimedToDate,
          previouslyCertified: invoice.previouslyCertified,
          thisClaim: invoice.thisClaim,
          retentionPercent: invoice.retentionPercent,
          retentionAmount,
          tax: invoice.tax,
          totalAmount,
          lienWaiverAttached: invoice.lienWaiverAttached,
          confidence: 0.94
        }
      },
      'AI Sure Of The Details?': { output: { confidence: 0.94 } },
      'Search Log By Invoice Number': {},
      'Invoice Number Already Posted?': {},
      'Find Purchase Order Record': {
        id: 'recPO8891',
        fields: { poNumber: invoice.poNumber, vendorName: invoice.vendorName, status: 'open', qboAccountId: '84' }
      },
      'Find Purchase Order': { poNumber: invoice.poNumber, vendorName: invoice.vendorName, status: 'open' },
      'Find Delivery Record (Airtable)': {},
      'Find Delivery Record': {}
    }
  }
}

function checked(invoice: Invoice, invoiceKey: string, messageId: string) {
  const { retentionAmount, totalAmount, netPayable } = figures(invoice)

  return {
    invoiceKey,
    messageId,
    vendorName: invoice.vendorName,
    invoiceNumber: invoice.invoiceNumber,
    poNumber: invoice.poNumber,
    jobNumber: invoice.jobNumber,
    costCode: invoice.costCode,
    claimType: invoice.claimType,
    claimLabel: invoice.claimLabel,
    isProgressClaim: invoice.claimType === 'progress_claim',
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    currency: 'USD',
    totalAmount,
    claimedToDate: invoice.claimedToDate,
    previouslyCertified: invoice.previouslyCertified,
    thisClaim: invoice.thisClaim,
    retentionPercent: invoice.retentionPercent,
    retentionAmount,
    netPayable,
    lienWaiverAttached: invoice.lienWaiverAttached,
    riskFlags: invoice.riskFlags,
    riskCount: invoice.riskFlags.length,
    routing: invoice.riskFlags.length > 0 ? 'exception' : 'clean'
  }
}

const AUDIT_COLUMNS = ['processedAt', 'vendorName', 'invoiceNumber', 'jobNumber', 'netPayable', 'outcome', 'riskFlags']

function scenarios(now: Date): DemoScenario[] {
  const today = dayFrom(now)
  const processed = now.toISOString().slice(0, 16).replace('T', ' ')

  const earlierRows = [
    [`${dayFrom(now, -1)} 14:02`, 'Harlan Steel Supply', 'INV-5521', 'BW-2241', 18620, 'posted', ''],
    [`${dayFrom(now, -1)} 16:40`, 'Pace Plant Hire', 'PH-0912', 'BW-2238', 6400, 'posted', '']
  ]

  // ── Clean progress claim ─────────────────────────────────────────────────

  const kelso: Invoice = {
    vendorName: 'Kelso Groundworks Ltd',
    invoiceNumber: 'APP-14',
    poNumber: 'SC-8891',
    jobNumber: 'BW-2241',
    costCode: '02-300 Earthworks',
    claimType: 'progress_claim',
    claimLabel: 'Progress claim',
    invoiceDate: dayFrom(now, -2),
    dueDate: dayFrom(now, 28),
    claimedToDate: 184000,
    previouslyCertified: 142000,
    thisClaim: 42000,
    retentionPercent: 5,
    tax: 3990,
    lienWaiverAttached: true,
    riskFlags: []
  }

  const kelsoEmail = { id: '19b0a7c4e2d1f366', from: 'accounts@kelsogroundworks.example', file: 'APP-14_Kelso.pdf' }
  const kelsoIn = intake(kelso, kelsoEmail)
  const kelsoChecked = checked(kelso, kelsoIn.invoiceKey, kelsoEmail.id)
  const kelsoSums = figures(kelso)

  const approvalMessage = (invoice: Invoice) => {
    const sums = figures(invoice)

    return [
      ':white_check_mark: *Invoice ready for approval - all checks passed*',
      '',
      `*${invoice.vendorName}* | ${invoice.claimLabel}`,
      `Invoice #: ${invoice.invoiceNumber} | PO/Contract #: ${invoice.poNumber}`,
      `Job #: ${invoice.jobNumber} | Cost code: ${invoice.costCode}`,
      '',
      `Invoice total: USD ${sums.totalAmount}`,
      `Held back (retention): ${invoice.retentionPercent}% (${sums.retentionAmount})`,
      `*Amount to pay: USD ${sums.netPayable}*`,
      `Due: ${invoice.dueDate}`,
      '',
      'Checked: matches the PO, retention held back, lien waiver attached, billing math adds up.'
    ]
  }

  const clean: DemoScenario = {
    id: 'clean',
    label: 'Kelso Groundworks · clean',
    hint: 'Every check passes. Approved in Slack, posted to QuickBooks, logged.',
    start: ['New Invoice Email', 'Process One Invoice Email'],
    branch: {
      'Seen This Invoice Before?': 1,
      'Invoice Number Already Posted?': 1,
      'Any Issues Found?': 1
    },
    waits: { 'Approve Clean Invoice': 'Waiting for someone in Slack to approve' },
    output: {
      ...kelsoIn.trigger,
      ...kelsoIn.read,
      'Check Invoice & Flag Issues': kelsoChecked,
      'Any Issues Found?': kelsoChecked,
      'Approve Clean Invoice': { data: { approved: true } },
      'Answered In Time?': { data: { approved: true } },
      'Approved?': { data: { approved: true } },
      'Expense Account Known?': { data: { approved: true } },
      'Find QuickBooks Vendor': { Id: '58', DisplayName: kelso.vendorName, Active: true },
      'Vendor In QuickBooks?': { Id: '58' },
      'Add Bill To QuickBooks': {
        Id: '1342',
        VendorRef: { value: '58', name: kelso.vendorName },
        TxnDate: kelso.invoiceDate,
        DueDate: kelso.dueDate,
        TotalAmt: kelsoSums.netPayable,
        Balance: kelsoSums.netPayable
      },
      'Save To Invoice Log': {
        processedAt: now.toISOString(),
        vendorName: kelso.vendorName,
        invoiceNumber: kelso.invoiceNumber,
        jobNumber: kelso.jobNumber,
        netPayable: kelsoSums.netPayable,
        outcome: 'posted',
        riskFlags: ''
      },
      'Mark Email As Read': { id: kelsoEmail.id, labelIds: ['INBOX'] }
    },
    outcomes: [
      {
        kind: 'slack',
        node: 'Approve Clean Invoice',
        channel: CHANNEL,
        app: 'n8n',
        time: 'just now',
        text: approvalMessage(kelso),
        buttons: ['Approve', 'Reject']
      },
      {
        kind: 'record',
        node: 'Add Bill To QuickBooks',
        app: 'QuickBooks',
        title: `Bill · ${kelso.vendorName}`,
        badge: 'Open',
        fields: [
          { label: 'Bill no.', value: kelso.invoiceNumber },
          { label: 'Bill date', value: shortDay(kelso.invoiceDate) },
          { label: 'Due date', value: shortDay(kelso.dueDate) },
          { label: 'Amount', value: usd(kelsoSums.netPayable) },
          { label: 'Retention held', value: usd(kelsoSums.retentionAmount) },
          { label: 'Job', value: kelso.jobNumber }
        ]
      },
      {
        kind: 'sheets',
        node: 'Save To Invoice Log',
        file: 'AP Invoice Automation',
        table: 'Audit Log',
        columns: AUDIT_COLUMNS,
        rows: [
          ...earlierRows,
          [processed, kelso.vendorName, kelso.invoiceNumber, kelso.jobNumber, kelsoSums.netPayable, 'posted', '']
        ],
        highlight: 2
      }
    ]
  }

  // ── Exception: lien waiver missing, rejected ─────────────────────────────

  const ridgeline: Invoice = {
    vendorName: 'Ridgeline Concrete Co',
    invoiceNumber: 'RC-2207',
    poNumber: 'SC-8904',
    jobNumber: 'BW-2241',
    costCode: '03-100 Concrete',
    claimType: 'progress_claim',
    claimLabel: 'Progress claim',
    invoiceDate: dayFrom(now, -1),
    dueDate: dayFrom(now, 29),
    claimedToDate: 96000,
    previouslyCertified: 61000,
    thisClaim: 35000,
    retentionPercent: 5,
    tax: 0,
    lienWaiverAttached: false,
    riskFlags: ['Lien waiver missing']
  }

  const ridgeEmail = { id: '19b0b2d81f4c0a9e', from: 'billing@ridgelineconcrete.example', file: 'RC-2207.pdf' }
  const ridgeIn = intake(ridgeline, ridgeEmail)
  const ridgeChecked = checked(ridgeline, ridgeIn.invoiceKey, ridgeEmail.id)
  const ridgeSums = figures(ridgeline)

  const exception: DemoScenario = {
    id: 'exception',
    label: 'Ridgeline Concrete · flagged',
    hint: 'No lien waiver. Sent for review with the issue spelled out; rejected.',
    start: ['New Invoice Email', 'Process One Invoice Email'],
    branch: {
      'Seen This Invoice Before?': 1,
      'Invoice Number Already Posted?': 1,
      'Any Issues Found?': 0,
      'Approved?': 1
    },
    waits: { 'Review Invoice With Issues': 'Waiting for someone in Slack to approve or reject' },
    output: {
      ...ridgeIn.trigger,
      ...ridgeIn.read,
      'Check Invoice & Flag Issues': ridgeChecked,
      'Any Issues Found?': ridgeChecked,
      'Review Invoice With Issues': { data: { approved: false } },
      'Answered In Time?': { data: { approved: false } },
      'Approved?': { data: { approved: false } },
      'Alert - Invoice Rejected': { ok: true, channel: CHANNEL, ts: '1762650321.004100' },
      'Save To Invoice Log': {
        processedAt: now.toISOString(),
        vendorName: ridgeline.vendorName,
        invoiceNumber: ridgeline.invoiceNumber,
        jobNumber: ridgeline.jobNumber,
        netPayable: ridgeSums.netPayable,
        outcome: 'rejected',
        riskFlags: 'Lien waiver missing'
      },
      'Mark Email As Read': { id: ridgeEmail.id, labelIds: ['INBOX'] }
    },
    outcomes: [
      {
        kind: 'slack',
        node: 'Review Invoice With Issues',
        channel: CHANNEL,
        app: 'n8n',
        time: 'just now',
        text: [
          ':warning: *Invoice needs review - issues found*',
          '',
          `*${ridgeline.vendorName}* | ${ridgeline.claimLabel}`,
          `Invoice #: ${ridgeline.invoiceNumber} | PO/Contract #: ${ridgeline.poNumber}`,
          `Job #: *${ridgeline.jobNumber}* | Cost code: ${ridgeline.costCode}`,
          '',
          `Billed so far: USD ${ridgeline.claimedToDate}`,
          `Already approved before: ${ridgeline.previouslyCertified}`,
          `This bill: ${ridgeline.thisClaim}`,
          '',
          `Held back (retention): ${ridgeline.retentionPercent}% (${ridgeSums.retentionAmount})`,
          `*Amount to pay: USD ${ridgeSums.netPayable}*`,
          'Lien waiver (signed payment release): ❌ MISSING',
          '',
          '*Issues:* Lien waiver missing',
          '',
          'Approve to add this bill to QuickBooks anyway, or reject it.'
        ],
        buttons: ['Approve', 'Reject']
      },
      {
        kind: 'slack',
        node: 'Alert - Invoice Rejected',
        channel: CHANNEL,
        app: 'n8n',
        time: 'just now',
        text: [
          ':x: *Invoice rejected - not added to QuickBooks*',
          `${ridgeline.vendorName} | ${ridgeline.claimLabel}`,
          `Invoice #: ${ridgeline.invoiceNumber}`,
          `Job #: ${ridgeline.jobNumber}`,
          `Amount to pay was: USD ${ridgeSums.netPayable}`,
          'Issues: Lien waiver missing'
        ]
      },
      {
        kind: 'sheets',
        node: 'Save To Invoice Log',
        file: 'AP Invoice Automation',
        table: 'Audit Log',
        columns: AUDIT_COLUMNS,
        rows: [
          ...earlierRows,
          [
            processed,
            ridgeline.vendorName,
            ridgeline.invoiceNumber,
            ridgeline.jobNumber,
            ridgeSums.netPayable,
            'rejected',
            'Lien waiver missing'
          ]
        ],
        highlight: 2
      }
    ]
  }

  // ── Duplicate: the same email and file again ────────────────────────────

  const again = intake(kelso, kelsoEmail)

  const duplicate: DemoScenario = {
    id: 'duplicate',
    label: 'Kelso Groundworks · sent twice',
    hint: 'The same invoice arrives again. Skipped before the AI reads it.',
    start: ['New Invoice Email', 'Process One Invoice Email'],
    output: {
      ...again.trigger,
      'Search Invoice Log': { invoiceKey: again.invoiceKey, outcome: 'posted', processedAt: `${today}T09:12:44Z` },
      'Seen This Invoice Before?': { invoiceKey: again.invoiceKey },
      'Alert - Duplicate Invoice': { ok: true, channel: CHANNEL, ts: '1762650388.001900' },
      'Mark Skipped Email As Read': { id: kelsoEmail.id, labelIds: ['INBOX'] }
    },
    outcomes: [
      {
        kind: 'slack',
        node: 'Alert - Duplicate Invoice',
        channel: CHANNEL,
        app: 'n8n',
        time: 'just now',
        text: [
          ':no_entry: *Duplicate invoice skipped*',
          `From: ${kelsoEmail.from}`,
          'This email and file were already processed.'
        ]
      } satisfies DemoOutcome
    ]
  }

  return [clean, exception, duplicate]
}

export const aiInvoiceProcessingApproval: DemoBundle = {
  layout: layout as DemoLayout,
  scenarios
}
