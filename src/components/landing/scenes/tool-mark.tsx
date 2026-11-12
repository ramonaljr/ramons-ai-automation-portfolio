import type { CSSProperties } from 'react'

export const TOOLS = {
  gmail: { slug: 'gmail', color: '#EA4335', name: 'Gmail' },
  n8n: { slug: 'n8n', color: '#EA4B71', name: 'n8n' },
  openai: { slug: 'openai', color: '#141821', name: 'OpenAI' },
  claude: { slug: 'anthropic', color: '#191919', name: 'Claude' },
  airtable: { slug: 'airtable', color: '#18BFFF', name: 'Airtable' },
  googlesheets: { slug: 'googlesheets', color: '#34A853', name: 'Google Sheets' },
  hubspot: { slug: 'hubspot', color: '#FF7A59', name: 'HubSpot' },
  slack: { slug: 'slack', color: '#4A154B', name: 'Slack' },
  quickbooks: { slug: 'quickbooks', color: '#2CA01C', name: 'QuickBooks' },
  make: { slug: 'make', color: '#6D00CC', name: 'Make' },
  zapier: { slug: 'zapier', color: '#FF4F00', name: 'Zapier' },
  whatsapp: { slug: 'whatsapp', color: '#25D366', name: 'WhatsApp' }
} as const

export type Tool = keyof typeof TOOLS

/** A tool's mark from /images/tools, masked in the tool's own colour. */
export function ToolMark({ tool, size = 16 }: { tool: Tool; size?: number }) {
  const { slug, color } = TOOLS[tool]

  return (
    <span
      className='ps-mark'
      aria-hidden='true'
      style={{ '--mark': color, '--src': `url(/images/tools/${slug}.svg)`, width: size, height: size } as CSSProperties}
    />
  )
}
