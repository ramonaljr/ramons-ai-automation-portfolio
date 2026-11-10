import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ell, inkFrames, inkPath, ln, rr } from './sketch'

const box = rr(0, 0, 40, 20, 3)

test('the same seed draws the same line', () => {
  assert.equal(inkPath(box, { seed: 4 }), inkPath(box, { seed: 4 }))
})

test('a different seed draws a different line', () => {
  assert.notEqual(inkPath(box, { seed: 4 }), inkPath(box, { seed: 5 }))
})

test('three boil frames, all different', () => {
  const frames = inkFrames(box, { seed: 4 })

  assert.equal(frames.length, 3)
  assert.equal(new Set(frames).size, 3)
})

test('no point strays further than the amplitude', () => {
  const d = inkPath([[10, 10]], { seed: 9, amp: 1.5, closed: false })
  const [x, y] = d.slice(1).split(' ').map(Number)

  assert.ok(Math.abs(x! - 10) <= 1.5 && Math.abs(y! - 10) <= 1.5)
})

test('a closed line ends where it began', () => {
  const d = inkPath(box, { seed: 4 })
  const first = d.slice(1, d.indexOf('L'))

  assert.ok(d.endsWith(`L${first}Z`))
})

test('the shapes are the engine’s: a rounded box, an ellipse, a line', () => {
  // rr: four corners of six points each, cut every 10 px along the edges
  assert.ok(box.length >= 24)
  assert.equal(ell(0, 0, 5, 5, 12).length, 12)

  // ln: an open line keeps both ends exactly
  const line = ln(0, 0, 30, 0)

  assert.deepEqual(line[0], [0, 0])
  assert.deepEqual(line.at(-1), [30, 0])
})
