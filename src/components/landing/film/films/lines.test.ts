import assert from 'node:assert/strict'
import { test } from 'node:test'

import { MAX_LINES, MAX_WORDS, holdFor, wordCount } from '../talk'
import { IMPACT, LINES } from './ai-appointment-setter-lines'

test('film 1 keeps to the line budget', () => {
  assert.ok(LINES.length <= MAX_LINES, `${LINES.length} lines`)
})

test('every line but the case study’s own sentence is nine words at most', () => {
  for (const l of LINES) {
    if (l.text === IMPACT) continue

    assert.ok(wordCount(l.text) <= MAX_WORDS, l.text)
  }
})

test('the end line is the case study’s impactHighlight, word for word', () => {
  assert.equal(IMPACT, 'Callers book, move or cancel appointments at any hour, without waiting for a person.')
  assert.ok(LINES.some(l => l.text === IMPACT))
})

test('the talk alone leaves room in 90 seconds', () => {
  const ms = LINES.reduce((sum, l) => sum + holdFor(l), 0)

  assert.ok(ms < 70000, `${ms} ms of talk`)
})
