import assert from 'node:assert/strict'
import { test } from 'node:test'

import { asWords, holdFor, wordCount } from './talk'

test('a short line still holds for two seconds', () => {
  assert.equal(holdFor({ who: 'leo', text: 'Or cancel?' }), 2000)
})

test('a longer line holds longer', () => {
  const short = holdFor({ who: 'leo', text: 'I’ll take 2:30, please.' })
  const long = holdFor({ who: 'dennice', text: 'It checks again, right before booking.' })

  assert.ok(long > short)
  assert.equal(long, 1500 + 32 * 'It checks again, right before booking.'.length)
})

test('reduced motion names the speaker', () => {
  assert.equal(asWords({ who: 'dennice', text: 'Event deleted.' }), 'Dennice: Event deleted.')
})

test('words are counted as a reader sees them', () => {
  assert.equal(wordCount('Oh no, 2:00 is taken.'), 5)
})
