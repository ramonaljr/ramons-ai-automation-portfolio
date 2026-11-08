import layout from '@/content/demos/gmail-attachment-filing.layout.json'
import { clock, dayFrom, shortDay } from '@/lib/demos/sample'
import type { DemoBundle, DemoLayout, DemoScenario } from '@/lib/demos/types'

/**
 * Client emails for Fernhill Bookkeeping, the fictional firm the build was
 * made for. Every 15 minutes the scenario watches for `label:to-file
 * has:attachment`, lists each attachment as its own bundle, and the filter
 * keeps only real files: no Office documents, nothing empty, nothing 20 KB
 * or smaller. Each file Gemini names, Drive stores and Sheets logs; the text
 * aggregator gathers them back into one receipt. The receipt is the
 * blueprint's own text with the sample filled in.
 */

const LOG_COLUMNS = ['Date', 'Original name', 'New name', 'File type', 'Link']

type Attachment = { filename: string; mimeType: string; size: number; named?: string; driveId?: string }

const LOGO: Attachment = { filename: 'image001.png', mimeType: 'image/png', size: 9_412 }

/** Make lists an attachment with its data as a binary buffer; the panel shows it the way Make does. */
const listed = (file: Attachment) => ({
  filename: file.filename,
  mimeType: file.mimeType,
  size: file.size,
  data: `IMTBuffer(${file.size}, binary, ${file.filename.length.toString(16)}c0f…)`
})

const linkOf = (file: Attachment) => `https://drive.google.com/uc?id=${file.driveId}&export=download`

function scenarios(now: Date): DemoScenario[] {
  const time = clock(now)
  const today = `${shortDay(dayFrom(now))} ${time}`

  const earlier = [
    [
      'Nov 3, 2026 9:15 AM',
      'Scan_0412.pdf',
      'Harbor Credit Union statement - October 2026.pdf',
      'application/pdf',
      'drive.google.com/uc?id=1xQ…'
    ],
    [
      'Nov 5, 2026 2:40 PM',
      'IMG_1188.jpg',
      'Costco receipt - office supplies - Nov 2026.jpg',
      'image/jpeg',
      'drive.google.com/uc?id=1bR…'
    ]
  ]

  // ── An email with two real files and a signature logo ────────────────────

  const email = {
    id: '19b0c3a41e7f2d85',
    threadId: '19b0c3a41e7f2d85',
    fromName: 'Laura Bennett',
    fromEmail: 'laura@bennettlandscaping.example',
    subject: 'November receipts and bank statement',
    date: now.toISOString(),
    labels: ['INBOX', 'To File'],
    attachmentsCount: 3
  }

  const files: Attachment[] = [
    {
      filename: 'IMG_2041.jpg',
      mimeType: 'image/jpeg',
      size: 1_842_310,
      named: 'Home Depot receipt - mulch and pavers - Nov 2026.jpg',
      driveId: '1kV7pQ2nW8rT'
    },
    {
      filename: 'scan0007.pdf',
      mimeType: 'application/pdf',
      size: 412_877,
      named: 'Chase business checking statement - October 2026.pdf',
      driveId: '1mA3sD9fL4cX'
    }
  ]

  const summary = files.map(file => `- ${file.named} (sent as ${file.filename})`).join('\n')

  const rows = files.map(file => [
    today,
    file.filename,
    file.named ?? '',
    file.mimeType,
    `drive.google.com/uc?id=${file.driveId?.slice(0, 3)}…`
  ])

  const receipts: DemoScenario = {
    id: 'receipts',
    label: 'To File · 2 files and a logo',
    hint: 'Two real files are named, filed and logged; the signature logo is skipped. One receipt lists both.',
    output: {
      'Gmail 3': email,
      'Gmail 4': [...files, LOGO].map(listed),
      'Google Gemini AI 5': files.map((file, index) => ({
        name: `files/fernhill${index + 1}x7`,
        uri: `https://generativelanguage.googleapis.com/v1beta/files/fernhill${index + 1}x7`,
        mimeType: file.mimeType,
        sizeBytes: String(file.size),
        state: 'ACTIVE'
      })),
      'Google Gemini AI 7': files.map(file => ({
        result: file.named,
        finishReason: 'STOP',
        modelVersion: 'gemini-3.6-flash'
      })),
      'Google Drive 8': files.map(file => ({
        id: file.driveId,
        name: file.named,
        mimeType: file.mimeType,
        webContentLink: linkOf(file),
        webViewLink: `https://drive.google.com/file/d/${file.driveId}/view`
      })),
      'Google Sheets 9': files.map((file, index) => ({
        __ROW_NUMBER__: earlier.length + 2 + index,
        'Date (A)': today,
        'Original name (B)': file.filename,
        'New name (C)': file.named,
        'File type (D)': file.mimeType,
        'Link (E)': linkOf(file)
      })),
      'Tools 11': { text: summary },
      'Gmail 10': { id: '19b0c3b0f4a21e67', threadId: '19b0c3b0f4a21e67', labelIds: ['SENT'] }
    },
    outcomes: [
      {
        kind: 'email',
        node: 'Gmail 10',
        from: 'Ramon',
        to: email.fromEmail,
        subject: `Your attachments are saved (${email.subject})`,
        body: `Hi ${email.fromName},\n\nThanks for your email. I've saved your attachments to my Google Drive under these names:\n\n${summary}\n\nThis is just for your records. No action is needed.\n\nRegards,\nRamon`,
        time
      },
      {
        kind: 'drive',
        node: 'Google Drive 8',
        path: ['My Drive', 'Client documents'],
        files: [
          ...files.map(file => ({
            name: file.named ?? file.filename,
            type: file.mimeType === 'application/pdf' ? ('pdf' as const) : ('image' as const),
            modified: `${time} me`,
            size: `${(file.size / 1_000_000).toFixed(1)} MB`
          })),
          {
            name: 'Costco receipt - office supplies - Nov 2026.jpg',
            type: 'image',
            modified: 'Nov 5 me',
            size: '1.2 MB'
          },
          {
            name: 'Harbor Credit Union statement - October 2026.pdf',
            type: 'pdf',
            modified: 'Nov 3 me',
            size: '388 KB'
          }
        ],
        added: [0, 1]
      },
      {
        kind: 'sheets',
        node: 'Google Sheets 9',
        file: 'Attachment Log',
        table: 'Sheet1',
        columns: LOG_COLUMNS,
        rows: [...earlier, ...rows],
        highlight: earlier.length
      }
    ]
  }

  // ── An email whose only attachment is the sender's signature logo ────────

  const logoOnly: DemoScenario = {
    id: 'logo',
    label: 'To File · signature logo only',
    hint: 'The only attachment is a 9 KB logo, so the filter stops it: nothing is filed and no receipt goes out.',
    output: {
      'Gmail 3': {
        ...email,
        id: '19b0c3c27d5e9a10',
        threadId: '19b0c3c27d5e9a10',
        fromName: 'Marco Ruiz',
        fromEmail: 'marco@ruizauto.example',
        subject: 'Re: Q4 estimated tax',
        attachmentsCount: 1
      },
      'Gmail 4': listed(LOGO)
    },
    outcomes: []
  }

  return [receipts, logoOnly]
}

export const gmailAttachmentFiling: DemoBundle = { layout: layout as DemoLayout, scenarios }
