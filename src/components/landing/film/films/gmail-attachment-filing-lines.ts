import type { Line } from '../talk'

/**
 * What Karan and Leo say in film 6, in order; the film's script shows them by
 * index. Karan keeps the books and explains; Leo, a client, asks, and the
 * email with three files in it is Leo's. Every fact is from
 * src/content/case-studies/gmail-attachment-filing.mdx.
 */

/** The case study's impactHighlight, word for word. */
export const IMPACT = 'Label it once. It is named, filed and logged.'

export const LINES: readonly Line[] = [
  // Before
  { who: 'leo', text: 'Did you get the scans I sent?', mood: 'puzzled' },
  { who: 'karan', text: 'Somewhere. I save each one by hand, as scan001.', mood: 'puzzled', hears: 'puzzled' },

  // The email
  { who: 'karan', text: 'Now I just label your email To File.', mood: 'happy' },

  // Through the build
  { who: 'karan', text: 'Every 15 minutes, those emails are picked up.' },
  { who: 'karan', text: 'Each attachment is listed. Only real files go on.' },
  { who: 'leo', text: 'I sent three files. Where did one go?', mood: 'puzzled' },
  { who: 'karan', text: 'Your logo was 20 KB or less, so skipped.', hears: 'happy' },
  { who: 'karan', text: 'Gemini reads each file and gives it a name.' },
  { who: 'karan', text: 'scan001.pdf is now Fuel receipt, 4 Mar.pdf.', mood: 'happy' },
  { who: 'leo', text: 'Does my PDF turn into something else?', mood: 'puzzled' },
  { who: 'karan', text: 'No. The original extension is always kept.', hears: 'happy' },
  { who: 'karan', text: 'Each is saved to the client documents folder.' },
  { who: 'karan', text: 'A log row: date, both names, type and link.' },
  { who: 'leo', text: 'Will I know they arrived?', mood: 'puzzled' },
  { who: 'karan', text: 'One receipt lists every file under its new name.', mood: 'happy' },
  { who: 'karan', text: 'Only sent when at least one file was saved.' },

  // The other path
  { who: 'leo', text: 'And if the AI step fails?', mood: 'puzzled' },
  { who: 'karan', text: 'It retries up to 3 times, 15 minutes apart.' },
  { who: 'karan', text: 'Your email isn’t marked read or moved.', hears: 'happy' },

  // The result
  { who: 'karan', text: IMPACT, mood: 'happy', hears: 'happy' },
  { who: 'leo', text: 'Run it yourself below.', mood: 'happy', pose: 'down' }
]
