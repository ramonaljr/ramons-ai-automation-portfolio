import type { Line } from '../talk'

/**
 * What Myk, Samantha and Carlos say in film 8, in order; the film's script
 * shows them by index. Myk is on the hiring team and explains; Samantha
 * applies and asks; Carlos, the interviewer, steps in when the
 * interviewer's calendar is read. Every fact is from src/content/case-studies/hr-evaluation-assistant.mdx.
 */

/** The case study's impactHighlight, word for word. */
export const IMPACT = 'From application to booked interview without anyone reading a CV first.'

export const LINES: readonly Line[] = [
  // Before
  { who: 'samantha', text: 'I applied a week ago. Did anyone read it?', mood: 'puzzled' },
  { who: 'myk', text: 'I read every CV by hand. We fall behind.', mood: 'puzzled', hears: 'puzzled' },

  // The CV
  { who: 'myk', text: 'Now every application is read the moment it lands.', mood: 'happy' },

  // Through the build
  { who: 'myk', text: 'Your CV goes to Drive, and you to Airtable.' },
  { who: 'myk', text: 'AI reads it against the real job posting.' },
  { who: 'samantha', text: 'Does it shortlist me, or turn me down?', mood: 'puzzled' },
  { who: 'myk', text: 'Either way, the decision is recorded.', hears: 'happy' },
  { who: 'myk', text: 'Shortlisted, you answer questions written for the role.' },
  { who: 'myk', text: 'Then a personal invite, sent from Gmail.', mood: 'happy' },
  { who: 'samantha', text: 'And who picks the interview time?', mood: 'puzzled' },
  { who: 'myk', text: 'AI proposes the earliest free half hour.' },
  { who: 'carlos', text: 'I’m busy at 2 on Tuesday, though.', mood: 'puzzled' },
  { who: 'myk', text: 'The workflow reads your week and checks it.' },
  { who: 'myk', text: 'It’s taken, so the first free slot wins.', hears: 'happy' },
  { who: 'myk', text: 'Only then is it booked, and Airtable updated.', mood: 'happy' },
  { who: 'carlos', text: 'And what do I ask in the interview?', mood: 'puzzled' },
  { who: 'myk', text: 'AI prepares screening questions from the CV and answers.' },

  // The other path
  { who: 'carlos', text: 'And applicants who aren’t a fit?', mood: 'puzzled' },
  { who: 'myk', text: 'They’re declined, and that’s recorded too.', hears: 'happy' },

  // The result
  { who: 'myk', text: IMPACT, mood: 'happy', hears: 'happy' },
  { who: 'carlos', text: 'Run it yourself below.', mood: 'happy', pose: 'down' }
]
