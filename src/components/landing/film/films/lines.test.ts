import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

import { MAX_LINES, MAX_WORDS, holdFor, wordCount, type Line } from '../talk'
import * as appointments from './ai-appointment-setter-lines'
import * as invoices from './ai-invoice-processing-approval-lines'
import * as reminders from './ai-unpaid-invoice-reminders-lines'
import * as stock from './order-stock-check-lines'
import * as leads from './solar-lead-scoring-follow-up-lines'
import * as prospects from './ai-prospecting-apollo-lines'

/** Every film's talk, by its case study's slug. */
const FILMS: Record<string, { IMPACT: string; LINES: readonly Line[] }> = {
  'ai-appointment-setter': appointments,
  'ai-invoice-processing-approval': invoices,
  'ai-unpaid-invoice-reminders': reminders,
  'order-stock-check': stock,
  'solar-lead-scoring-follow-up': leads,
  'ai-prospecting-apollo': prospects
}

/** The case study's own impactHighlight, read from its .mdx. */
function impactOf(slug: string) {
  const mdx = readFileSync(join(process.cwd(), 'src/content/case-studies', `${slug}.mdx`), 'utf8')
  const found = /^impactHighlight:\s*'(.*)'\s*$/m.exec(mdx)

  assert.ok(found, `no impactHighlight in ${slug}.mdx`)

  return found[1]!.replace(/''/g, "'")
}

for (const [slug, { IMPACT, LINES }] of Object.entries(FILMS)) {
  test(`${slug}: keeps to the line budget`, () => {
    assert.ok(LINES.length <= MAX_LINES, `${LINES.length} lines`)
  })

  test(`${slug}: every line but the case study’s own sentence is nine words at most`, () => {
    for (const l of LINES) {
      if (l.text === IMPACT) continue

      assert.ok(wordCount(l.text) <= MAX_WORDS, l.text)
    }
  })

  test(`${slug}: the end line is the case study’s impactHighlight, word for word`, () => {
    assert.equal(IMPACT, impactOf(slug))
    assert.ok(LINES.some(l => l.text === IMPACT))
  })

  test(`${slug}: the talk alone leaves room in 90 seconds`, () => {
    const ms = LINES.reduce((sum, l) => sum + holdFor(l), 0)

    assert.ok(ms < 70000, `${ms} ms of talk`)
  })
}
