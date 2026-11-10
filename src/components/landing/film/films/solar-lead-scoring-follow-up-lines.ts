import type { Line } from '../talk'

/**
 * What Dennice, Jeson and Karan say in film 10, in order; the film's script
 * shows them by index. Dennice is the sales rep and explains; Jeson, a
 * business owner, sends the enquiry and asks; Karan, the sales manager, takes
 * the lead when its 15 minutes run out. Every fact is from
 * src/content/case-studies/solar-lead-scoring-follow-up.mdx.
 */

/** The case study's impactHighlight, word for word. */
export const IMPACT = 'Every good lead has a rep on it within 15 working minutes, or the manager knows.'

export const LINES: readonly Line[] = [
  // Before
  { who: 'jeson', text: 'I asked about solar days ago. Nobody called.', mood: 'puzzled' },
  { who: 'dennice', text: 'Enquiries wait in an inbox, and go cold.', mood: 'puzzled', hears: 'puzzled' },

  // The enquiry, with its clock
  { who: 'dennice', text: 'Now every enquiry has a 15-minute clock.', mood: 'happy' },

  // Through the build
  { who: 'dennice', text: 'Your form gets a reply in under a second.' },
  { who: 'dennice', text: 'Airtable checks if we already know you.' },
  { who: 'jeson', text: 'Does AI decide how good a lead I am?', mood: 'puzzled' },
  { who: 'dennice', text: 'AI only reads your message. It never guesses.', hears: 'happy' },
  { who: 'dennice', text: 'Fixed rules score it out of 100.' },
  { who: 'dennice', text: 'The rep assigned least recently gets it: me.', mood: 'happy' },
  { who: 'dennice', text: 'AI replies to you, and Slack alerts me.' },
  { who: 'jeson', text: 'And if you’re too busy to call?', mood: 'puzzled' },
  { who: 'dennice', text: 'Every 5 minutes, the clock is checked.' },
  { who: 'dennice', text: 'It counts working hours only, weekdays 8 to 6.' },
  { who: 'karan', text: 'Fifteen minutes, no follow-up. It’s mine now.', mood: 'happy' },
  { who: 'dennice', text: 'The manager takes it, so no lead is dropped.', hears: 'happy' },

  // The other paths
  { who: 'karan', text: 'And enquiries overnight, or at the weekend?', mood: 'puzzled' },
  { who: 'dennice', text: 'They’re due at 08:15 the next working morning.' },
  { who: 'karan', text: 'And someone who asks twice?', mood: 'puzzled' },
  { who: 'dennice', text: 'Repeats are only logged. No second email.' },
  { who: 'dennice', text: 'If a run fails, Slack gets an alert.' },

  // The result
  { who: 'dennice', text: IMPACT, mood: 'happy', hears: 'happy' },
  { who: 'karan', text: 'Run it yourself below.', mood: 'happy', pose: 'down' }
]
