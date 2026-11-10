import type { Line } from '../talk'

/**
 * What Dennice and Leo say in film 1, in order; the film's script shows them
 * by index. Kept apart from the scene so the talk's rules can test it. Every
 * fact is from src/content/case-studies/ai-appointment-setter.mdx.
 */

/** The case study's impactHighlight, word for word. */
export const IMPACT = 'Callers book, move or cancel appointments at any hour, without waiting for a person.'

/** What Dennice and Leo say, in order. Each part's script shows them by index. */
export const LINES: readonly Line[] = [
  // Before
  { who: 'leo', text: 'Hello? Is anyone there?', pose: 'phone' },
  { who: 'dennice', text: 'Calls after hours. Most left no message.', mood: 'puzzled' },

  // The call
  { who: 'dennice', text: 'So the phone now has a voice agent.', mood: 'happy' },
  { who: 'leo', text: 'Can I come in tomorrow at 2?', pose: 'phone' },

  // Through the build
  { who: 'leo', text: 'Who checks the calendar?' },
  { who: 'dennice', text: 'The agent asks n8n to read it.' },
  { who: 'dennice', text: 'A weekday, 9 to 6 Central, and clear?' },
  { who: 'leo', text: 'Oh no, 2:00 is taken.', mood: 'puzzled' },
  { who: 'dennice', text: 'Then it lists the open half hours.' },
  { who: 'leo', text: 'I’ll take 2:30, please.', mood: 'happy', pose: 'phone' },
  { who: 'leo', text: 'What if someone grabs it first?', mood: 'puzzled' },
  { who: 'dennice', text: 'It checks again, right before booking.' },
  { who: 'dennice', text: 'Still free, so it goes in the calendar.', mood: 'happy' },
  { who: 'dennice', text: 'Then the booking is logged in Airtable.' },
  { who: 'dennice', text: 'And every call leaves a record.' },

  // Other paths
  { who: 'leo', text: 'What if I need to move it?' },
  { who: 'dennice', text: 'Only once the new time is free.' },
  { who: 'leo', text: 'Or cancel?' },
  { who: 'dennice', text: 'Event deleted, record marked cancelled.' },

  // The result
  { who: 'dennice', text: IMPACT, mood: 'happy' },
  { who: 'leo', text: 'Run it yourself below.', mood: 'happy', pose: 'down' }
]
