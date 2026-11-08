#!/usr/bin/env node
/**
 * Make blueprint → interactive demo layout.
 *
 *   node scripts/make-demo-layout.mjs <blueprint.json> <slug>
 *
 * Writes src/content/demos/<slug>.layout.json in the same shape as the n8n
 * layouts, so the same run engine drives it. Each module is a node at the
 * position Make's designer saved (`metadata.designer`, the circle's centre);
 * a router's routes are its outputs, each route's filter labels the link into
 * it, and a module's error handlers hang below it on `error` links. A text or
 * array aggregator gets the grey band Make draws back to the module it reads.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const [file, slug] = process.argv.slice(2)

if (!file || !slug) {
  console.error('usage: node scripts/make-demo-layout.mjs <blueprint.json> <slug>')
  process.exit(1)
}

const blueprint = JSON.parse(readFileSync(file, 'utf8'))

/** Make's module circle, in its canvas units. */
const SIZE = 150

const APP = {
  'google-sheets': 'Google Sheets',
  'google-email': 'Gmail',
  'google-drive': 'Google Drive',
  'gemini-ai': 'Google Gemini AI',
  slack: 'Slack',
  util: 'Tools',
  'builtin:BasicRouter': 'Router',
  'builtin:Break': 'Retry'
}

/** The action line under a module, as Make words it. */
const ACTION = {
  'google-sheets:filterRows': 'Search Rows',
  'google-sheets:updateRow': 'Update a Row',
  'google-sheets:addRow': 'Add a Row',
  'google-email:sendAnEmail': 'Send an email',
  'google-email:triggerWatchNewEmails': 'Watch emails',
  'google-email:listEmailAttachments': 'List email attachments and media',
  'google-drive:uploadAFile': 'Upload a File',
  'gemini-ai:uploadAFile': 'Upload a file',
  'gemini-ai:createACompletionGeminiPro': 'Generate a response',
  'slack:CreateMessage': 'Send a Message',
  'util:TextAggregator': 'Text aggregator'
}

const appOf = module => APP[module] ?? APP[module.split(':')[0]] ?? module.split(':')[0]

const nodes = []
const edges = []
const bands = []
const nameOf = new Map()

function add(module, shape) {
  const { x = 0, y = 0, name } = module.metadata?.designer ?? {}
  const label = name || appOf(module.module)

  // Two modules can share an app name ("Gmail" twice); the number keeps names unique.
  const key = name || `${label} ${module.id}`

  nameOf.set(module.id, key)
  nodes.push({
    name: key,
    label,
    number: module.id,
    type: module.module,
    shape,
    x: x - SIZE / 2,
    y: y - SIZE / 2,
    w: SIZE,
    h: SIZE,
    ...(ACTION[module.module] ? { subtitle: ACTION[module.module] } : {})
  })

  for (const handler of module.onerror ?? []) {
    add(handler, 'default')
    edges.push({ from: key, to: nameOf.get(handler.id), kind: 'error', output: 0 })
  }

  if (module.module === 'util:TextAggregator' && module.parameters?.feeder) {
    bands.push({ from: module.parameters.feeder, to: module.id })
  }

  return key
}

/** A flow is a line of modules; a router fans out into routes, each its own flow. */
function walk(flow, previous, first) {
  let last = previous

  flow.forEach((module, index) => {
    const key = add(module, first && index === 0 ? 'trigger' : 'default')

    if (last) edges.push({ from: last, to: key, kind: 'main', output: 0, ...label(module) })
    last = key

    if (module.routes) {
      const router = nodes.find(node => node.name === key)

      router.outputs = module.routes.map((route, n) => route.flow[0]?.filter?.name ?? `Route ${n + 1}`)
      module.routes.forEach((route, output) => {
        const start = edges.length

        walk(route.flow, null, false)

        const head = nameOf.get(route.flow[0]?.id)

        if (head) edges.splice(start, 0, { from: key, to: head, kind: 'main', output, ...label(route.flow[0]) })
      })
    }
  })
}

const label = module => (module.filter?.name ? { label: module.filter.name } : {})

walk(blueprint.flow, null, true)

const named = bands.map(band => ({ from: nameOf.get(band.from), to: nameOf.get(band.to) }))

const boxes = nodes.map(n => [n.x - 40, n.y - 40, n.x + n.w + 60, n.y + n.h + 110])

const layout = {
  platform: 'make',
  name: blueprint.name,
  bounds: {
    x: Math.min(...boxes.map(b => b[0])),
    y: Math.min(...boxes.map(b => b[1])),
    x2: Math.max(...boxes.map(b => b[2])),
    y2: Math.max(...boxes.map(b => b[3]))
  },
  stickies: [],
  ...(named.length ? { bands: named } : {}),
  nodes,
  edges
}

const out = resolve('src/content/demos', `${slug}.layout.json`)

writeFileSync(out, `${JSON.stringify(layout, null, 2)}\n`)
console.log(`wrote ${out}: ${nodes.length} modules, ${edges.length} links`)
