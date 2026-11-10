import type { Line } from '../talk'

/**
 * What Dennice and Jeson say in film 5, in order; the film's script shows them
 * by index. Dennice runs the agency and explains; Jeson, a client, asks, sits
 * on a quote for two days, then approves it. Every fact is from
 * src/content/case-studies/airtable-crm-lead-engagement.mdx.
 */

/** The case study's impactHighlight, word for word. */
export const IMPACT = 'Move the card, and the follow-up takes care of itself.'

export const LINES: readonly Line[] = [
  // Before
  { who: 'jeson', text: 'I approved the quote. Where’s my welcome?', mood: 'puzzled' },
  { who: 'dennice', text: 'Each stage needs me to remember the next step.', mood: 'puzzled', hears: 'puzzled' },

  // The client card
  { who: 'dennice', text: 'Now moving a card does the next step.', mood: 'happy' },

  // Through the build
  { who: 'dennice', text: 'I move your card to Quoted in Airtable.' },
  { who: 'dennice', text: 'It runs only if that stage isn’t handled yet.' },
  { who: 'dennice', text: 'Then it claims the stage, so it runs once.', mood: 'happy' },
  { who: 'dennice', text: 'Paths picks the route: a follow-up email.' },
  { who: 'jeson', text: 'And if I don’t reply?', mood: 'puzzled' },
  { who: 'dennice', text: 'Two days later, your card is checked again.' },
  { who: 'dennice', text: 'Still Quoted, so one nudge. Then no more.', hears: 'happy' },
  { who: 'jeson', text: 'What if I’d already replied?', mood: 'puzzled' },
  { who: 'dennice', text: 'Then the card has moved, and nobody chases you.' },
  { who: 'jeson', text: 'Okay, I approve the quote.', mood: 'happy' },
  { who: 'dennice', text: 'AI writes your welcome, in under 150 words.' },
  { who: 'dennice', text: 'Ready to Start: a Drive folder and a task.' },
  { who: 'dennice', text: 'Every email and folder is logged, with a time.', mood: 'happy' },

  // The other paths
  { who: 'jeson', text: 'And if an email fails to send?', mood: 'puzzled' },
  { who: 'dennice', text: 'It waits 15 minutes, and tries once more.' },
  { who: 'dennice', text: 'Still failing? An alert email names the client.' },

  // The result
  { who: 'dennice', text: IMPACT, mood: 'happy', hears: 'happy' },
  { who: 'jeson', text: 'Run it yourself below.', mood: 'happy', pose: 'down' }
]
