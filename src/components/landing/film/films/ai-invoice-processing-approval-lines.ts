import type { Line } from '../talk'

/**
 * What Dennice and Karan say in film 2, in order; the film's script shows them
 * by index. Dennice keeps accounts payable and explains; Karan, the budget
 * owner, asks, and approves the bill when it reaches him. Every fact is from
 * src/content/case-studies/ai-invoice-processing-approval.mdx.
 */

/** The case study's impactHighlight, word for word. */
export const IMPACT = 'Every invoice checked against the PO and delivery record before anyone approves it.'

export const LINES: readonly Line[] = [
  // Before
  { who: 'karan', text: 'Did we already pay this invoice?', mood: 'puzzled' },
  { who: 'dennice', text: 'I match each one by hand. It’s slow.', mood: 'puzzled', hears: 'puzzled' },

  // The invoice arrives
  { who: 'dennice', text: 'Now each invoice is read as it lands.', mood: 'happy' },

  // Through the build
  { who: 'dennice', text: 'Every 5 minutes, Gmail is checked for PDFs.' },
  { who: 'dennice', text: 'Its text is checked against the invoice log.' },
  { who: 'karan', text: 'What if it was sent twice?', mood: 'puzzled' },
  { who: 'dennice', text: 'A repeat is skipped, so it’s never paid twice.', hears: 'happy' },
  { who: 'dennice', text: 'Then AI reads every billing figure.' },
  { who: 'karan', text: 'What if it misreads one?', mood: 'puzzled' },
  { who: 'dennice', text: 'Under 80% sure, a person checks first.' },
  { who: 'dennice', text: 'I confirm the details in Slack.', mood: 'happy' },
  { who: 'dennice', text: 'Then it’s matched to the PO and delivery.' },
  { who: 'dennice', text: 'Fixed rules check retention and the lien waiver.' },
  { who: 'karan', text: 'No issues, so it comes to me?' },
  { who: 'karan', text: 'Approved.', mood: 'happy' },
  { who: 'dennice', text: 'The bill goes to QuickBooks, after retention.' },
  { who: 'dennice', text: 'Logged, and the email marked as read.', hears: 'happy' },

  // The other paths
  { who: 'karan', text: 'And when a rule flags something?', mood: 'puzzled' },
  { who: 'dennice', text: 'It comes to me in Slack instead.' },
  { who: 'dennice', text: 'If a run fails, Slack gets an alert.' },

  // The result
  { who: 'dennice', text: IMPACT, mood: 'happy', hears: 'happy' },
  { who: 'karan', text: 'Run it yourself below.', mood: 'happy', pose: 'down' }
]
