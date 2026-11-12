import layout from '@/content/demos/ai-customer-support-agent.layout.json'
import { clock, dayFrom, usd } from '@/lib/demos/sample'
import type { DemoBundle, DemoLayout, DemoOutcome, DemoScenario } from '@/lib/demos/types'

/**
 * Fernhill Outdoor Supply's WhatsApp support agent: a WhatsApp message in, the
 * agent's reply out, and the team request it raises when money or an upset
 * customer is involved.
 *
 * One workflow, two ways in: WhatsApp (the top row, which saves any photo to
 * Google Drive first) and the website chat's webhook. Every sample here
 * arrives on WhatsApp, so "On WhatsApp?" sends the answer back with "Reply On
 * WhatsApp" and the webhook's "Send Reply" stays idle.
 *
 * The replies are the agent's own, taken from the build's test set and
 * re-dated so they always read as current. Field names are the build's: the
 * Code nodes' returns and the Airtable columns. Customers, emails and
 * tracking numbers are made up; Fernhill is a fictional sample client.
 */

const BASE = 'Fernhill Outdoor Supply'

/** "14 November", the way the agent writes dates. */
const inWords = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' })

const prepared = (sessionId: string, message: string) => ({
  message,
  channel: 'whatsapp',
  test: false,
  sessionId: `whatsapp:${sessionId}`,
  hasMessage: true
})

/** What Meta's webhook posts to "WhatsApp Message In" for one customer message. */
const whatsappIn = (from: string, message: Record<string, unknown>) => ({
  messaging_product: 'whatsapp',
  metadata: { display_phone_number: '15556772775' },
  contacts: [{ wa_id: from }],
  messages: [{ from, id: `wamid.HBgL${from}FERNHILL`, timestamp: '1763045000', ...message }],
  field: 'messages'
})

/** What the WhatsApp node returns once the reply is sent. */
const whatsappSent = (from: string) => ({
  messaging_product: 'whatsapp',
  contacts: [{ input: from, wa_id: from }],
  messages: [{ id: `wamid.HBgL${from}REPLY` }]
})

/** A photo the customer sent, saved to the team's Drive folder. */
type Photo = { caption: string; file: string; fileId: string }

const PHOTO_FOLDER = 'Fernhill - Customer Photos (WhatsApp)'

/** One retrieved passage from the store policies document. */
const passage = (text: string) => ({ pageContent: text, metadata: { source: 'Fernhill Store Policies' } })

/** The order record as the Look Up Order tool gets it from Airtable. */
const orderRecord = (id: string, fields: Record<string, unknown>) => ({
  id,
  createdTime: '2026-10-02T17:04:11.000Z',
  fields
})

function scenarios(now: Date): DemoScenario[] {
  const time = clock(now)

  // Earlier cases in the Support Cases table, so each run's row sits among others.
  const earlierCases = [
    ['whatsapp:15550105582', 'WhatsApp', 'Product Question', 'Does the Drift pad fit in the 45L pack?', 'Answered'],
    ['whatsapp:15550109064', 'WhatsApp', 'Shipping', 'How long does shipping to Canada take?', 'Answered']
  ]

  const casesTable = (row: (string | number)[]): DemoOutcome => ({
    kind: 'airtable',
    node: 'Log Conversation',
    file: BASE,
    table: 'Support Cases',
    columns: ['Case ID', 'Channel', 'Category', 'Customer Message', 'Status'],
    rows: [row, ...earlierCases],
    highlight: 0
  })

  // The shared path: a WhatsApp message is read (a photo saved to Drive first),
  // the agent answers, the reply goes back on WhatsApp, and it is all logged.
  const chatPath = (
    sessionId: string,
    text: string,
    reply: string,
    tools: string[],
    escalation: string | null,
    photo?: Photo
  ) => {
    const link = photo && `https://drive.google.com/file/d/${photo.fileId}/view`

    // What the agent is asked: the text, or "Describe Photo For Agent"'s note.
    const message = photo
      ? `[The customer sent a photo on WhatsApp. It is saved for the team here: ${link} ] Caption: ${photo.caption}`
      : text

    const read = photo
      ? { from: sessionId, type: 'image', text: '', mediaId: '1187462093310524', caption: photo.caption }
      : { from: sessionId, type: 'text', text, mediaId: '', caption: '' }

    const channel = {
      'WhatsApp Message In': whatsappIn(
        sessionId,
        photo
          ? { type: 'image', image: { id: read.mediaId, mime_type: 'image/jpeg', caption: photo.caption } }
          : { type: 'text', text: { body: text } }
      ),
      'Read Message': read,
      'Is It Text?': read,
      ...(photo && {
        'Is It A Photo?': read,
        'Get Photo Link': {
          messaging_product: 'whatsapp',
          url: `https://lookaside.fbsbx.com/whatsapp_business/attachments/?mid=${read.mediaId}`,
          mime_type: 'image/jpeg',
          file_size: 421_806,
          id: read.mediaId
        },
        'Download Photo': { binary: { data: { mimeType: 'image/jpeg', fileExtension: 'jpg', fileSize: '412 kB' } } },
        'Save Photo To Drive': { id: photo.fileId, name: photo.file, webViewLink: link },
        'Describe Photo For Agent': { from: sessionId, text: message }
      }),
      'Reply On WhatsApp': whatsappSent(sessionId)
    }

    const checked = { reply, failed: false, error: '', tools, escalation }

    return {
      ...channel,
      ...agentPath(sessionId, message, reply, checked)
    }
  }

  // The agent's part of the run, from Prepare Message to the logged conversation.
  const agentPath = (sessionId: string, message: string, reply: string, checked: Record<string, unknown>) => ({
    'Prepare Message': prepared(sessionId, message),
    'OpenAI Chat Model': { model: 'gpt-5.4', temperature: 0.2 },
    'Conversation Memory': { sessionId: `whatsapp:${sessionId}`, messages: 2 },
    'Fernhill Support Agent': { output: reply },
    'Check Reply': checked,
    'On WhatsApp?': checked,
    'Log Conversation': {
      id: `rec${sessionId.slice(-6)}Fh`,
      fields: {
        'Case ID': `whatsapp:${sessionId}`,
        'Session ID': `whatsapp:${sessionId}`,
        Channel: 'WhatsApp',
        'Customer Message': message,
        'Agent Reply': reply,
        'Last Activity': now.toISOString()
      }
    },
    'Reply Failed?': { failed: false }
  })

  // ── 1. Where is my order ────────────────────────────────────────────────
  const delayed = {
    session: '15550104471',
    email: 'chloe.bennett@example.com',
    estimate: dayFrom(now, 2)
  }

  const whereMessage = `FH-1007 was due last week and still nothing. ${delayed.email}`

  const whereReply =
    `Sorry about the delay. I found order FH-1007, and it’s currently delayed with UPS; the tracking number is 1Z84F2A10300001007.\n\n` +
    `The note on the order says there’s a weather-related carrier delay at the Charlotte hub, and the new estimated delivery is ${inWords(delayed.estimate)}. The team is on it.`

  const where: DemoScenario = {
    id: 'order',
    label: 'Chloe · where is my order',
    hint: 'Checks the order number and email together, then answers from the order record.',
    branch: { 'Reply Failed?': 1 },
    output: {
      ...chatPath(delayed.session, whereMessage, whereReply, ['Look_Up_Order'], null),
      'Look Up Order': [
        orderRecord('recFH1007', {
          'Order Number': 'FH-1007',
          'Customer Email': delayed.email,
          Status: 'Delayed',
          Carrier: 'UPS',
          'Tracking Number': '1Z84F2A10300001007',
          'Estimated Delivery': delayed.estimate,
          Notes: 'Weather-related carrier delay at the Charlotte hub.'
        })
      ]
    },
    outcomes: [
      {
        kind: 'chat',
        node: 'Reply On WhatsApp',
        app: 'WhatsApp',
        title: 'Fernhill Outdoor Supply',
        lines: [
          { from: 'person', text: whereMessage },
          { from: 'agent', text: whereReply }
        ]
      },
      casesTable([`whatsapp:${delayed.session}`, 'WhatsApp', 'Order Status', whereMessage, 'Answered'])
    ]
  }

  // ── 2. A product question, answered from the policies ─────────────────────
  const sizingMessage = 'Do the Granite Mid boots run true to size? I wear a 10.'

  const sizingReply =
    'They run a little small, not true to size. Fernhill recommends ordering half a size up, so if you usually wear a 10, I’d go with a 10.5.'

  const sizing: DemoScenario = {
    id: 'product',
    label: 'Boot sizing question',
    hint: 'Searches the store policies document and answers only from what it finds.',
    branch: { 'Reply Failed?': 1 },
    output: {
      ...chatPath('15550103315', sizingMessage, sizingReply, ['Search_Store_Policies'], null),
      'OpenAI Embeddings (Search)': { model: 'text-embedding-3-small' },
      'Search Store Policies': [
        passage(
          'Granite Mid Waterproof Hiking Boot ($165). Waterproof membrane and Vibram sole. Runs half a size small: we recommend ordering half a size up.'
        ),
        passage('Exchanges. We exchange sizes and colours free of charge within 30 days of delivery, subject to stock.')
      ]
    },
    outcomes: [
      {
        kind: 'chat',
        node: 'Reply On WhatsApp',
        app: 'WhatsApp',
        title: 'Fernhill Outdoor Supply',
        lines: [
          { from: 'person', text: sizingMessage },
          { from: 'agent', text: sizingReply }
        ]
      },
      casesTable(['whatsapp:15550103315', 'WhatsApp', 'Product Question', sizingMessage, 'Answered'])
    ]
  }

  // ── 3. Damaged item: a refund a person must approve ───────────────────────
  const damaged = {
    session: '15550102938',
    email: 'ethan.brooks@example.com',
    delivered: dayFrom(now, -6),
    total: 147
  }

  const refundMessage = `The titanium pot in FH-1017 arrived badly dented. I’d like a refund. ${damaged.email}`

  // Sent as a photo, with the message as its caption: the policy asks for one.
  // Named as "Save Photo To Drive" names it: in the workflow's own timezone (Pacific).
  const stamp = new Date(now.getTime() - 3 * 60_000)
    .toLocaleString('sv-SE', { timeZone: 'America/Los_Angeles', hour12: false })
    .replace(/[-:]/g, '')
    .replace(' ', '-')

  const dentedPhoto: Photo = {
    caption: refundMessage,
    file: `whatsapp-${damaged.session.slice(-4)}-${stamp}.jpg`,
    fileId: '1Fh7qK2dentedPotFH1017'
  }

  const toAgentRefund =
    `Logged as case whatsapp:${damaged.session}. A team member must approve this refund request; ` +
    'the customer will get an email at the address on the order within one working day. Do not promise the outcome.'

  const refundReply =
    `I’m sorry your pot arrived dented. Since it was delivered on ${inWords(damaged.delivered)}, this is within the 14-day window for damaged items, and the policy says damaged items can be refunded in full once a team member reviews the request.\n\n` +
    'A team member must approve this refund request; you’ll get an email at the address on the order within one working day.'

  const refundRequest = {
    action: 'request',
    request_type: 'refund',
    order_number: 'FH-1017',
    customer_email: damaged.email,
    category: 'Wrong or Damaged Item',
    reason: 'Titanium Cook Pot 900ml ($49) arrived badly dented.',
    summary: 'Customer asks for a full refund for a damaged Titanium Cook Pot 900ml.',
    session_id: `whatsapp:${damaged.session}`,
    channel: 'WhatsApp',
    test: false,
    order_total: damaged.total,
    order_status: 'Delivered',
    details: 'Delivered within the 14-day damaged-item window.'
  }

  const refundRules = {
    caseId: `whatsapp:${damaged.session}`,
    sessionId: `whatsapp:${damaged.session}`,
    channel: 'WhatsApp',
    requestType: 'refund',
    orderNumber: 'FH-1017',
    customerEmail: damaged.email,
    orderTotal: damaged.total,
    orderStatus: 'Delivered',
    category: 'Wrong or Damaged Item',
    details: `REFUND: ${refundRequest.reason}\nSummary: ${refundRequest.summary}`,
    decision: 'Needs Approval',
    status: 'Waiting Approval',
    toAgent: toAgentRefund,
    verified: true,
    test: false
  }

  const approvedEmail = {
    approved: true,
    subject: 'Your refund for order FH-1017 is approved',
    body:
      'Hi,\n\nGood news: a member of our team has approved your refund for order FH-1017. We will send the next steps (and a return label, if one is needed) shortly. Refunds reach the original payment method within 5 to 7 working days.\n\n' +
      'No need to send the pot back.\n\nThanks for shopping with us,\nFernhill Outdoor Supply',
    to: damaged.email,
    safe: true,
    status: 'Approved',
    now: now.toISOString()
  }

  const refund: DemoScenario = {
    id: 'refund',
    label: 'Ethan · photo of a damaged pot',
    hint: 'The photo is saved to Google Drive; the refund waits for a yes in Slack, then the customer is emailed.',
    start: ['WhatsApp Message In', 'Team Request In'],
    branch: {
      'Is It Text?': 1,
      'Reply Failed?': 1,
      'Waiting On Approval?': [1, 0],
      'Route The Request': 1,
      'Test Address Only?': 0
    },
    waits: { 'Ask Team To Approve': 'Waiting for someone in Slack to approve or reject' },
    output: {
      ...chatPath(
        damaged.session,
        refundMessage,
        refundReply,
        ['Look_Up_Order', 'Search_Store_Policies', 'Request_Team_Action'],
        'approval',
        dentedPhoto
      ),
      'Look Up Order': [
        orderRecord('recFH1017', {
          'Order Number': 'FH-1017',
          'Customer Email': damaged.email,
          Status: 'Delivered',
          'Delivered Date': damaged.delivered,
          'Order Total': damaged.total
        })
      ],
      'OpenAI Embeddings (Search)': { model: 'text-embedding-3-small' },
      'Search Store Policies': [
        passage(
          'Wrong, damaged or faulty items. Contact us within 14 days of delivery with the order number and a photo. We send a replacement at no cost, or refund it in full. A team member approves it.'
        )
      ],
      'Request Team Action': { response: toAgentRefund, decision: 'approval' },
      'Team Request In': refundRequest,
      'Waiting On Approval?': refundRequest,
      'Verify Order': orderRecord('recFH1017', {
        'Order Number': 'FH-1017',
        'Customer Email': damaged.email,
        Status: 'Delivered',
        'Order Total': damaged.total
      }),
      'Apply Rules': refundRules,
      'Route The Request': refundRules,
      "Start Approval (Don't Wait)": { ...refundRequest, action: 'await_approval' },
      'Log Case': {
        id: 'recCaseE5b7a1',
        fields: {
          'Case ID': refundRules.caseId,
          Category: refundRules.category,
          Decision: 'Needs Approval',
          Status: 'Waiting Approval',
          'Order Number': 'FH-1017',
          'Order Total': damaged.total
        }
      },
      'Tell The Agent': { response: toAgentRefund, decision: 'approval' },
      'Ask Team To Approve': {
        data: { Decision: 'Approve', 'Note for the customer (optional)': 'No need to send the pot back.' }
      },
      'Compose Customer Email': approvedEmail,
      'Record Decision': {
        id: 'recCaseE5b7a1',
        fields: { 'Case ID': refundRules.caseId, Decision: 'Approved', Status: 'Resolved', 'Approved By': 'Slack form' }
      },
      'Test Address Only?': approvedEmail,
      'Email Customer The Decision': { id: '19a6f0c4be2d7e31', labelIds: ['SENT'] }
    },
    outcomes: [
      {
        kind: 'chat',
        node: 'Reply On WhatsApp',
        app: 'WhatsApp',
        title: 'Fernhill Outdoor Supply',
        lines: [
          { from: 'person', text: `📷 Photo · ${refundMessage}` },
          { from: 'agent', text: refundReply }
        ]
      },
      {
        kind: 'drive',
        node: 'Save Photo To Drive',
        path: ['My Drive', PHOTO_FOLDER],
        files: [
          { name: dentedPhoto.file, type: 'image', modified: `${time} me`, size: '412 KB' },
          { name: 'whatsapp-5582-20261110-161204.jpg', type: 'image', modified: 'Nov 10 me', size: '388 KB' }
        ],
        added: [0]
      },
      {
        kind: 'slack',
        node: 'Ask Team To Approve',
        channel: 'support',
        app: 'n8n',
        time,
        text: [
          ':money_with_wings: *Fernhill: approval needed for a refund*',
          `Order: *FH-1017* (Delivered, ${usd(damaged.total)})`,
          `Customer: ${damaged.email} via WhatsApp`,
          refundRules.details,
          'Open the form to decide. *Approve* emails the customer that it is approved; *Reject* tells them a person will follow up.'
        ],
        buttons: ['Review and decide']
      },
      {
        kind: 'email',
        node: 'Email Customer The Decision',
        from: 'Fernhill Outdoor Supply',
        to: damaged.email,
        subject: approvedEmail.subject,
        body: approvedEmail.body,
        time
      }
    ]
  }

  // ── 4. An upset customer, handed to a person ────────────────────────────
  const angryMessage = `This is the worst service ever!!! FH-1007 is a week late and nobody cares. Absolutely furious. ${delayed.email}`

  const toAgentHandover = `Handed to a team member as case whatsapp:15550107316. Tell the customer a person will reply within one working day.`

  const angryReply =
    'I’m really sorry this has been so frustrating.\n\n' +
    `I found your order FH-1007. It’s delayed with UPS because of a weather hold at the Charlotte hub; the tracking number is 1Z84F2A10300001007, and the current delivery estimate is ${inWords(delayed.estimate)}. I’ve handed this to a team member now, and a person will reply within one working day.`

  const handoverRules = {
    caseId: 'whatsapp:15550107316',
    sessionId: 'whatsapp:15550107316',
    channel: 'WhatsApp',
    requestType: 'handover',
    orderNumber: 'FH-1007',
    customerEmail: delayed.email,
    orderTotal: 148,
    orderStatus: 'Delayed',
    category: 'Complaint',
    details:
      'HANDOVER: Customer is upset about a late order.\nSummary: FH-1007 delayed by weather; customer is furious and wants someone to care.',
    decision: 'Handed Over',
    status: 'Open',
    toAgent: toAgentHandover,
    verified: true,
    test: false
  }

  const angry: DemoScenario = {
    id: 'handover',
    label: 'Upset customer · handover',
    hint: 'Answers what it can, apologises once, and hands the conversation to a person in Slack.',
    start: ['WhatsApp Message In', 'Team Request In'],
    branch: { 'Reply Failed?': 1, 'Waiting On Approval?': 1, 'Route The Request': 2 },
    output: {
      ...chatPath('15550107316', angryMessage, angryReply, ['Look_Up_Order', 'Request_Team_Action'], 'handover'),
      'Look Up Order': [
        orderRecord('recFH1007', {
          'Order Number': 'FH-1007',
          'Customer Email': delayed.email,
          Status: 'Delayed',
          Carrier: 'UPS',
          'Estimated Delivery': delayed.estimate
        })
      ],
      'Request Team Action': { response: toAgentHandover, decision: 'handover' },
      'Team Request In': {
        action: 'request',
        request_type: 'handover',
        order_number: 'FH-1007',
        customer_email: delayed.email,
        category: 'Complaint',
        reason: 'Customer is upset about a late order.',
        session_id: 'whatsapp:15550107316',
        channel: 'WhatsApp',
        test: false
      },
      'Waiting On Approval?': { action: 'request' },
      'Verify Order': orderRecord('recFH1007', { 'Order Number': 'FH-1007', Status: 'Delayed', 'Order Total': 148 }),
      'Apply Rules': handoverRules,
      'Route The Request': handoverRules,
      'Alert Team: Handover': { ok: true, channel: 'support', ts: '1762990412.000300' },
      'Log Case': {
        id: 'recCase15550107316',
        fields: { 'Case ID': 'whatsapp:15550107316', Category: 'Complaint', Decision: 'Handed Over', Status: 'Open' }
      },
      'Tell The Agent': { response: toAgentHandover, decision: 'handover' }
    },
    outcomes: [
      {
        kind: 'chat',
        node: 'Reply On WhatsApp',
        app: 'WhatsApp',
        title: 'Fernhill Outdoor Supply',
        lines: [
          { from: 'person', text: angryMessage },
          { from: 'agent', text: angryReply }
        ]
      },
      {
        kind: 'slack',
        node: 'Alert Team: Handover',
        channel: 'support',
        app: 'n8n',
        time,
        text: [
          ':raising_hand: *Fernhill customer handed to a person* (WhatsApp)',
          'Case: whatsapp:15550107316',
          'Order: FH-1007',
          ...handoverRules.details.split('\n'),
          'Please reply to the customer within one working day.'
        ]
      }
    ]
  }

  return [where, sizing, refund, angry]
}

export const aiCustomerSupportAgent: DemoBundle = {
  layout: layout as DemoLayout,
  scenarios
}
