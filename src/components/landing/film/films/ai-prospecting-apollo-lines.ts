import type { Line } from '../talk'

/**
 * What Dennice and Karan say in film 3, in order; the film's script shows them
 * by index. Dennice is the sales rep and explains; Karan, the sales manager,
 * asks, and approves the prospect when it waits for review. Every fact is
 * from src/content/case-studies/ai-prospecting-apollo.mdx.
 */

/** The case study's impactHighlight, word for word. */
export const IMPACT = 'Researched, scored prospects with a draft email ready to approve, from one form.'

export const LINES: readonly Line[] = [
  // Before
  { who: 'karan', text: 'Did we email this person twice?', mood: 'puzzled' },
  { who: 'dennice', text: 'I search and write every email by hand.', mood: 'puzzled', hears: 'puzzled' },

  // The request
  { who: 'dennice', text: 'Now one form starts the whole search.', mood: 'happy' },

  // Through the build
  { who: 'dennice', text: 'The form says who we want, and the offer.' },
  { who: 'dennice', text: 'Apollo finds matching people without using credits.' },
  { who: 'karan', text: 'What about people we already know?', mood: 'puzzled' },
  { who: 'dennice', text: 'Anyone already in the sheet is skipped.', hears: 'happy' },
  { who: 'dennice', text: 'Only the best are enriched, then scored by rules.' },
  { who: 'dennice', text: 'AI reads their website and drafts an email.' },
  { who: 'dennice', text: 'Only facts from that website. Nothing invented.' },
  { who: 'dennice', text: 'It waits in a sheet; Slack gets a digest.' },
  { who: 'karan', text: 'So it emails them right away?', mood: 'puzzled' },
  { who: 'dennice', text: 'No. Nothing is sent until a person approves.', hears: 'happy' },
  { who: 'karan', text: 'Approved.', mood: 'happy' },
  { who: 'dennice', text: 'Every 15 minutes, approved ones go to Pipedrive.' },
  { who: 'dennice', text: 'A deal, with the research and email pinned.' },
  { who: 'dennice', text: 'I review it, and send from Pipedrive myself.', mood: 'happy' },

  // The other paths
  { who: 'karan', text: 'And if their website says nothing useful?', mood: 'puzzled' },
  { who: 'dennice', text: 'The draft is flagged, never filled with guesses.' },
  { who: 'dennice', text: 'If a step fails, Slack says which one.' },

  // The result
  { who: 'dennice', text: IMPACT, mood: 'happy', hears: 'happy' },
  { who: 'karan', text: 'Run it yourself below.', mood: 'happy', pose: 'down' }
]
