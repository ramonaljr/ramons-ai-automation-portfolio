import type { Line } from '../talk'

/**
 * What Dennice and Isa say in film 4, in order; the film's script shows them
 * by index. Dennice runs collections and explains; Isa, a customer, asks, and
 * disputes the invoice she's being chased for. Every fact is from
 * src/content/case-studies/ai-unpaid-invoice-reminders.mdx.
 */

/** The case study's impactHighlight, word for word. */
export const IMPACT = 'Every overdue invoice followed up by policy, and every reply acted on.'

export const LINES: readonly Line[] = [
  // Before
  { who: 'isa', text: 'I disputed this bill. Why the reminders?', mood: 'puzzled' },
  { who: 'dennice', text: 'I chase each one by hand. Replies get missed.', mood: 'puzzled', hears: 'puzzled' },

  // The overdue invoice
  { who: 'dennice', text: 'Now every overdue invoice is checked each morning.', mood: 'happy' },

  // Through the build
  { who: 'dennice', text: 'At 8:00, QuickBooks lists every unpaid invoice.' },
  { who: 'dennice', text: 'Pipedrive and past reminders add the context.' },
  { who: 'isa', text: 'Who decides how firm the reminder is?', mood: 'puzzled' },
  { who: 'dennice', text: 'Fixed policy rules decide. Never the AI.', hears: 'happy' },
  { who: 'dennice', text: 'AI only writes the words, within that policy.' },
  { who: 'dennice', text: 'Gmail sends it, and the contact is saved.' },
  { who: 'isa', text: 'And if I reply that I dispute it?', mood: 'puzzled' },
  { who: 'dennice', text: 'AI reads every reply the same day.' },
  { who: 'dennice', text: 'A dispute stops every reminder for that invoice.', mood: 'happy' },
  { who: 'isa', text: 'Until a timer runs out?', mood: 'puzzled' },
  { who: 'dennice', text: 'Until a person clears it. No timer restarts it.', hears: 'happy' },
  { who: 'dennice', text: 'I get a Pipedrive task and a Slack alert.' },
  { who: 'dennice', text: 'Its emails are saved, and the reply logged.' },

  // The other paths
  { who: 'isa', text: 'And if someone promises a date instead?', mood: 'puzzled' },
  { who: 'dennice', text: 'The date is saved, and reminders wait for it.' },
  { who: 'dennice', text: 'Past 30 days, the account owner hears first.' },
  { who: 'dennice', text: 'If a run fails, Slack gets an alert.' },

  // The result
  { who: 'dennice', text: IMPACT, mood: 'happy', hears: 'happy' },
  { who: 'isa', text: 'Run it yourself below.', mood: 'happy', pose: 'down' }
]
