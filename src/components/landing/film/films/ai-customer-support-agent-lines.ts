import type { Line } from '../talk'

/**
 * What Dennice, Leo and Karan say in film 11, in order; the film's script
 * shows them by index. Dennice runs the shop and explains; Leo, a customer,
 * asks, and his dented pot is the refund the tour follows; Karan is the team
 * member who decides it in Slack. Every fact is from
 * src/content/case-studies/ai-customer-support-agent.mdx.
 */

/** The case study's impactHighlight, word for word. */
export const IMPACT = "Customers get an answer at any hour, taken from the store's own records rather than guessed."

export const LINES: readonly Line[] = [
  // Before
  { who: 'leo', text: 'Where is my order? I emailed two days ago.', mood: 'puzzled' },
  { who: 'dennice', text: 'We answer every message by hand, one by one.', mood: 'puzzled', hears: 'puzzled' },

  // The message
  { who: 'dennice', text: 'Now an agent answers customers in chat, any hour.', mood: 'happy' },

  // Through the build
  { who: 'leo', text: 'My pot arrived dented. I’d like a refund.', mood: 'puzzled' },
  { who: 'dennice', text: 'First it asks for your order number and email.' },
  { who: 'dennice', text: 'Both must match before it shares anything.' },
  { who: 'leo', text: 'How does it know the store’s rules?', mood: 'puzzled' },
  { who: 'dennice', text: 'It searches our policies document, and nothing else.', hears: 'happy' },
  { who: 'leo', text: 'So it refunds me straight away?', mood: 'puzzled' },
  { who: 'dennice', text: 'No. The agent never promises money.' },
  { who: 'dennice', text: 'It checks the order, then asks the team.' },
  { who: 'karan', text: 'I approve or reject it in a Slack form.', mood: 'happy' },
  { who: 'dennice', text: 'You’re emailed the decision either way.', mood: 'happy', hears: 'happy' },
  { who: 'dennice', text: 'Every conversation is saved in Airtable.' },

  // The other paths
  { who: 'leo', text: 'What if a customer is really upset?', mood: 'puzzled' },
  { who: 'dennice', text: 'Upset customers go straight to a person.', hears: 'happy' },
  { who: 'dennice', text: 'At 5 PM, the team gets the day’s summary.' },

  // The result
  { who: 'dennice', text: IMPACT, mood: 'happy', hears: 'happy' },
  { who: 'leo', text: 'Run it yourself below.', mood: 'happy', pose: 'down' }
]
