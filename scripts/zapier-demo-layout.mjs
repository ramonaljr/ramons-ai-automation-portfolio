#!/usr/bin/env node
/**
 * Zapier export (zap.json) → interactive demo layout.
 *
 *   node scripts/zapier-demo-layout.mjs <zap.json> <slug>
 *
 * A Zap export has no positions; the editor lays steps out as a tree, so this
 * does the same: steps stack down a column, Paths fan out side by side, and an
 * error-handled step splits into Success (the rest of its column) on the left
 * and Error (its handler) on the right. Each parent sits centred over its
 * branches. Steps are numbered in the editor's order: a step, then its error
 * handler, then what follows on success.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const [file, slug] = process.argv.slice(2)

if (!file || !slug) {
  console.error('usage: node scripts/zapier-demo-layout.mjs <zap.json> <slug>')
  process.exit(1)
}

const zap = JSON.parse(readFileSync(file, 'utf8'))

/** A step card and the spacing between them, in the editor's units. */
const CARD = { w: 320, h: 76 }
const COLUMN = 400
const ROW = 168
const FORK = 240

const APP = {
  AirtableCLIAPI: 'Airtable',
  FilterAPI: 'Filter by Zapier',
  CodeCLIAPI: 'Code by Zapier',
  BranchingAPI: 'Paths',
  EngineAPI: 'Paths',
  GoogleDriveCLIAPI: 'Google Drive',
  GoogleMailV2CLIAPI: 'Gmail',
  DelayCLIAPI: 'Delay by Zapier',
  AICLIAPI: 'AI by Zapier'
}

const ACTION = {
  filter: 'Filter conditions',
  updateRecord: 'Update Record',
  createRecord: 'Create Record',
  findRecord: 'Find Record',
  folder: 'Create Folder',
  message: 'Send Email',
  delay_for: 'Delay For',
  parallel_paths: 'Split into paths'
}

const appOf = step => APP[step.app.split('@')[0]] ?? step.app.split('@')[0]

function titleOf(step) {
  if (step.app.startsWith('BranchingAPI')) return 'Path conditions'
  if (step.app.startsWith('CodeCLIAPI')) return 'Run Javascript'

  return step.title ?? ACTION[step.action] ?? step.action
}

/*
 * The tree, before positions: a column of steps that may end in a fork.
 * A fork's branches are columns too, each with the label on its pill.
 */
function column(steps) {
  const out = { steps: [], fork: null }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]

    if (step.action === 'parallel_paths') {
      out.steps.push(step)
      out.fork = {
        branches: step.steps.map(series => ({
          label: series.steps[0]?.title ?? 'Path',
          tone: 'path',
          column: column(series.steps)
        }))
      }

      return out
    }

    if (step.action === 'error_wrapper') {
      const [attempt, handler] = step.steps
      const tried = column(attempt.steps)

      // The steps after an error-handled step continue on its Success branch.
      out.steps.push(...tried.steps)
      out.fork = {
        branches: [
          { label: 'Success', tone: 'success', column: column(steps.slice(i + 1)) },
          { label: 'Error', tone: 'error', column: column(handler.steps) }
        ]
      }

      return out
    }

    out.steps.push(step)
  }

  return out
}

const tree = column(zap.steps)

// ── Numbers: a step, then its error handler, then the rest on success ──────

let counter = 0
const names = new Map()

function number(col) {
  col.steps.forEach(step => names.set(step, `${++counter}. ${titleOf(step)}`))

  if (!col.fork) return

  // Paths number left to right; Success/Error numbers Error first.
  const order = col.fork.branches[0].tone === 'success' ? [1, 0] : col.fork.branches.map((_, i) => i)

  order.forEach(i => number(col.fork.branches[i].column))
}

number(tree)

// ── Positions: each column centred over its branches ──────────────────────

const nodes = []
const edges = []

const width = col => (col.fork ? col.fork.branches.reduce((sum, b) => sum + Math.max(1, width(b.column)), 0) : 1)

/** Places a column whose leftmost lane starts at `left`; returns its centre x. */
function place(col, left, top) {
  let centre = left + COLUMN / 2
  const forkTop = top + col.steps.length * ROW - ROW + FORK
  const heads = []

  if (col.fork) {
    let lane = left

    const centres = col.fork.branches.map(branch => {
      const c = place(branch.column, lane, forkTop)

      heads.push(branch)
      lane += Math.max(1, width(branch.column)) * COLUMN

      return c
    })

    centre = (centres[0] + centres[centres.length - 1]) / 2
  }

  col.steps.forEach((step, index) => {
    const name = names.get(step)
    const last = index === col.steps.length - 1

    nodes.push({
      name,
      label: appOf(step),
      type: step.app.split('@')[0],
      shape: step === zap.steps[0] ? 'trigger' : 'default',
      x: centre - CARD.w / 2,
      y: top + index * ROW,
      w: CARD.w,
      h: CARD.h,
      ...(last && col.fork ? { outputs: col.fork.branches.map(b => b.label) } : {})
    })

    if (index > 0) edges.push({ from: names.get(col.steps[index - 1]), to: name, kind: 'main', output: 0 })
  })

  heads.forEach((branch, output) => {
    const head = branch.column.steps[0]

    if (head) {
      edges.push({
        from: names.get(col.steps[col.steps.length - 1]),
        to: names.get(head),
        kind: 'main',
        output,
        label: branch.label,
        tone: branch.tone
      })
    }
  })

  return centre
}

place(tree, 0, 0)

const boxes = nodes.map(n => [n.x, n.y, n.x + n.w, n.y + n.h + 60])

const layout = {
  platform: 'zapier',
  name: zap.title,
  bounds: {
    x: Math.min(...boxes.map(b => b[0])) - 60,
    y: Math.min(...boxes.map(b => b[1])) - 40,
    x2: Math.max(...boxes.map(b => b[2])) + 60,
    y2: Math.max(...boxes.map(b => b[3])) + 40
  },
  stickies: [],
  nodes,
  edges
}

const out = resolve('src/content/demos', `${slug}.layout.json`)

writeFileSync(out, `${JSON.stringify(layout, null, 2)}\n`)
console.log(`wrote ${out}: ${nodes.length} steps, ${edges.length} links`)
