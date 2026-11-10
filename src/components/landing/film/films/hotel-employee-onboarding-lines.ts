import type { Line } from '../talk'

/**
 * What Myk and Unix say in film 7, in order; the film's script shows them by
 * index. Myk is in HR and explains; Unix, the new hire, asks. Every fact is
 * from src/content/case-studies/hotel-employee-onboarding.mdx.
 */

/** The case study's impactHighlight, word for word. */
export const IMPACT = 'A new hire is fully set up from one form, and followed up for their first 30 days.'

export const LINES: readonly Line[] = [
  // Before
  { who: 'unix', text: 'Day one, and my key card isn’t ready.', mood: 'puzzled' },
  { who: 'myk', text: 'I set up each new hire by hand.', mood: 'puzzled', hears: 'puzzled' },

  // The intake form
  { who: 'myk', text: 'Now one form sets everything up.', mood: 'happy' },

  // Through the build
  { who: 'myk', text: 'I fill in your details, and your role.' },
  { who: 'myk', text: 'Anything missing stops the run, and I’m alerted.' },
  { who: 'myk', text: 'A plan of tasks is built for that role.' },
  { who: 'unix', text: 'So who sets up my folder and access?', mood: 'puzzled' },
  { who: 'myk', text: 'A Drive folder, your record, and orientation booked.', hears: 'happy' },
  { who: 'myk', text: 'IT and your manager hear in Slack.' },
  { who: 'myk', text: 'Then your welcome email goes out.', mood: 'happy' },
  { who: 'myk', text: 'You upload documents through a form.' },
  { who: 'unix', text: 'Will I get chased about the missing one?', mood: 'puzzled' },
  { who: 'myk', text: 'A daily check at 8:00 looks at what’s due.' },
  { who: 'myk', text: 'Day 3 has a check-in and a reminder due.' },
  { who: 'myk', text: 'So they’re folded into one email. One a day.', mood: 'happy', hears: 'happy' },
  { who: 'myk', text: 'IT is chased for your key card alongside.' },
  { who: 'myk', text: 'After 30 days, with everything in, it’s closed.' },

  // The other path
  { who: 'unix', text: 'And if I ask about time off?', mood: 'puzzled' },
  { who: 'myk', text: 'I ask our HR assistant. It answers from policy.' },
  { who: 'myk', text: 'If policy is silent, it says so, never guesses.', hears: 'happy' },

  // The result
  { who: 'myk', text: IMPACT, mood: 'happy', hears: 'happy' },
  { who: 'unix', text: 'Run it yourself below.', mood: 'happy', pose: 'down' }
]
