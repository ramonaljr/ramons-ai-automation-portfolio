#!/usr/bin/env node
/**
 * Turns a published n8n workflow export into the layout the interactive demo
 * draws (src/components/landing/demo/n8n-demo.tsx).
 *
 *   node scripts/n8n-demo-layout.mjs <workflow.json> <slug>
 *
 * Writes src/content/demos/<slug>.layout.json. Only what the canvas shows is
 * kept: names, positions, shapes, the subtitle n8n prints under each node,
 * sticky-note groups and connections. Parameters and credentials never reach
 * the site. Re-run it whenever the workflow's layout changes; hand edits to
 * the output are lost.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const [, , source, slug] = process.argv

if (!source || !slug) {
  console.error('usage: node scripts/n8n-demo-layout.mjs <workflow.json> <slug>')
  process.exit(1)
}

const workflow = JSON.parse(readFileSync(source, 'utf8'))
const short = type => type.split('.').pop()

/** n8n's own node sizes on its canvas, in canvas units. */
const SIZE = { default: [100, 100], trigger: [100, 100], root: [240, 100], sub: [80, 80], tool: [240, 80] }

/** Nodes with sub-node inputs along their base (agents, chains, extractors). */
const ROOTS = new Set(['agent', 'chainLlm', 'informationExtractor', 'vectorStoreInMemory'])

/** Nodes that plug into a root node's base rather than the main flow. */
const isSub = type =>
  /^(lmChat|embeddings|outputParser|memory|documentDefaultDataLoader|tool[A-Z])/.test(type) || /Tool$/.test(type)

const isTrigger = type => /Trigger$/.test(type) || type === 'webhook'

/** The sub-node inputs each root node offers, in n8n's order. */
const PORT_ORDER = ['ai_languageModel', 'ai_memory', 'ai_tool', 'ai_outputParser', 'ai_document', 'ai_embedding']

const PORT_LABEL = {
  ai_languageModel: 'Chat Model',
  ai_memory: 'Memory',
  ai_tool: 'Tool',
  ai_outputParser: 'Output Parser',
  ai_document: 'Document',
  ai_embedding: 'Embedding'
}

/** The default operation and resource n8n assumes when the export omits them. */
const DEFAULTS = {
  googleDrive: ['upload', 'file'],
  airtable: ['get', 'record'],
  airtableTool: ['get', 'record'],
  googleCalendar: ['create', 'event'],
  googleCalendarTool: ['create', 'event'],
  gmail: ['send', 'message'],
  slack: ['post', 'message'],
  googleSheets: ['append', 'sheet'],
  postgres: ['executeQuery', ''],
  pipedrive: ['create', 'deal'],
  quickbooks: ['get', 'invoice']
}

/** The line n8n prints under a node: "operation: resource", or a fixed caption. */
function subtitle(type, params) {
  if (type === 'set') return params.mode ?? 'manual'
  if (type === 'form') return 'Next Form Page'

  if (type === 'extractFromFile') {
    return `Extract from ${(params.operation ?? 'csv').toUpperCase()}`
  }

  const fallback = DEFAULTS[type]

  if (!fallback) return undefined

  const operation = params.operation ?? fallback[0]
  const resource = params.resource ?? fallback[1]

  return resource ? `${operation}: ${resource}` : operation
}

/** Named outputs, for nodes that branch. */
function outputs(type, params) {
  if (type === 'if') return ['true', 'false']
  if (type === 'filter') return ['kept']
  if (type === 'splitInBatches') return ['done', 'loop']

  if (type === 'switch') {
    const rules = params.rules?.values ?? []

    const named = rules.map((rule, index) => (rule.renameOutput ? rule.outputKey : String(index)))

    // "Fallback output: extra output" adds one more, after the rules.
    return params.options?.fallbackOutput === 'extra'
      ? [...named, params.options.renameFallbackOutput || 'Fallback']
      : named
  }

  return undefined
}

const incoming = new Map()

for (const kinds of Object.values(workflow.connections)) {
  for (const [kind, branches] of Object.entries(kinds)) {
    branches.forEach(branch =>
      (branch ?? []).forEach(target => {
        if (!incoming.has(target.node)) incoming.set(target.node, new Set())
        incoming.get(target.node).add(kind)
      })
    )
  }
}

const nodes = []
const stickies = []

for (const node of workflow.nodes) {
  const type = short(node.type)
  const params = node.parameters ?? {}
  const [x, y] = node.position

  if (type === 'stickyNote') {
    const content = String(params.content ?? '')

    stickies.push({
      x,
      y,
      w: params.width ?? 240,
      h: params.height ?? 160,
      color: params.color ?? 1,
      title: content
        .replace(/^#+\s*/gm, '')
        .split('\n')[0]
        .trim()
    })
    continue
  }

  // A vector store set to "Retrieve Documents (As Tool for AI Agent)" plugs into an agent.
  const asTool = type.startsWith('vectorStore') && params.mode === 'retrieve-as-tool'

  const shape = asTool
    ? 'tool'
    : ROOTS.has(type)
      ? 'root'
      : isSub(type)
        ? 'sub'
        : isTrigger(type)
          ? 'trigger'
          : 'default'

  const [w, h] = SIZE[shape]
  const entry = { name: node.name, type, shape, x, y, w, h }
  const caption = subtitle(type, params)

  // "On error: continue (using error output)" gives any node a second output.
  const named = outputs(type, params) ?? (node.onError === 'continueErrorOutput' ? ['success', 'error'] : undefined)

  if (caption) entry.subtitle = caption
  if (named) entry.outputs = named

  if (shape === 'root') {
    const wired = incoming.get(node.name) ?? new Set()

    // Agents always offer a model, memory and tools; an output parser only
    // when the agent is set to use one.
    const offered =
      type === 'agent'
        ? [
            'ai_languageModel',
            'ai_memory',
            'ai_tool',
            ...(params.hasOutputParser || wired.has('ai_outputParser') ? ['ai_outputParser'] : [])
          ]
        : PORT_ORDER.filter(port => wired.has(port) || port === 'ai_languageModel')

    entry.ports = offered.map(port => ({
      kind: port,
      label: PORT_LABEL[port] + (port === 'ai_languageModel' ? '*' : ''),
      wired: wired.has(port)
    }))
  }

  if (shape === 'tool') {
    entry.ports = [
      { kind: 'ai_embedding', label: 'Embedding*', wired: (incoming.get(node.name) ?? new Set()).has('ai_embedding') }
    ]
  }

  nodes.push(entry)
}

const edges = []

for (const [from, kinds] of Object.entries(workflow.connections)) {
  for (const [kind, branches] of Object.entries(kinds)) {
    branches.forEach((branch, output) =>
      (branch ?? []).forEach(target => edges.push({ from, to: target.node, kind, output }))
    )
  }
}

const boxes = [
  ...nodes.map(n => [n.x, n.y, n.x + n.w, n.y + n.h + 40]),
  ...stickies.map(s => [s.x, s.y, s.x + s.w, s.y + s.h])
]

const bounds = {
  x: Math.min(...boxes.map(b => b[0])),
  y: Math.min(...boxes.map(b => b[1])),
  x2: Math.max(...boxes.map(b => b[2])),
  y2: Math.max(...boxes.map(b => b[3]))
}

const out = resolve('src/content/demos', `${slug}.layout.json`)

mkdirSync(dirname(out), { recursive: true })
writeFileSync(
  out,
  `${JSON.stringify({ platform: 'n8n', name: workflow.name, bounds, stickies, nodes, edges }, null, 2)}\n`
)
console.log(`wrote ${out}: ${nodes.length} nodes, ${stickies.length} groups, ${edges.length} connections`)
