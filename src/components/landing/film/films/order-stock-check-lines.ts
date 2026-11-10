import type { Line } from '../talk'

/**
 * What Dennice and Samantha say in film 9, in order; the film's script shows
 * them by index. Dennice runs the shop and explains; Samantha, a customer,
 * asks, and her order is the one short of stock. Every fact is from
 * src/content/case-studies/order-stock-check.mdx.
 */

/** The case study's impactHighlight, word for word. */
export const IMPACT = 'No order is confirmed without the stock to fill it.'

export const LINES: readonly Line[] = [
  // Before
  { who: 'samantha', text: 'Is my order coming? Nobody told me.', mood: 'puzzled' },
  { who: 'dennice', text: 'I confirm orders before checking the shelf.', mood: 'puzzled', hears: 'puzzled' },

  // The two orders
  { who: 'dennice', text: 'Now every order is checked against stock first.', mood: 'happy' },

  // Through the build
  { who: 'dennice', text: 'Every 15 minutes, orders marked New are picked up.' },
  { who: 'dennice', text: 'Up to 10 a run, each SKU looked up.' },
  { who: 'samantha', text: 'How does it decide what happens?', mood: 'puzzled' },
  { who: 'dennice', text: 'It compares two numbers: ordered, and in stock.', hears: 'happy' },
  { who: 'dennice', text: 'The mug order has enough, so it’s reserved.' },
  { who: 'dennice', text: 'It’s marked Confirmed, and the customer emailed.', mood: 'happy' },
  { who: 'samantha', text: 'And my order of six totes?', mood: 'puzzled' },
  { who: 'dennice', text: 'Only four are left, so it’s not enough.' },
  { who: 'dennice', text: 'It’s put on hold, never partly filled.' },
  { who: 'dennice', text: 'You’re emailed why, and operations is alerted.', mood: 'happy' },
  { who: 'samantha', text: 'Does it promise me a new date?', mood: 'puzzled' },
  { who: 'dennice', text: 'No. A person replies with a date or alternative.', hears: 'happy' },
  { who: 'dennice', text: 'Each order is stamped with its outcome and time.' },

  // The other path
  { who: 'samantha', text: 'And when the mugs run low?', mood: 'puzzled' },
  { who: 'dennice', text: 'Below the reorder level, operations hears in Slack.' },
  { who: 'dennice', text: 'That order is still confirmed.', hears: 'happy' },

  // The result
  { who: 'dennice', text: IMPACT, mood: 'happy', hears: 'happy' },
  { who: 'samantha', text: 'Run it yourself below.', mood: 'happy', pose: 'down' }
]
