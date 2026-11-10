'use client'

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type PointerEvent,
  type ReactNode
} from 'react'

import {
  ArrowDown,
  Bot,
  Braces,
  CalendarDays,
  Check,
  ClipboardList,
  Clock,
  Code,
  Database,
  FileOutput,
  FileText,
  FlaskConical,
  Globe,
  Hourglass,
  LoaderCircle,
  Maximize2,
  Merge,
  MessageCircle,
  Minus,
  Pen,
  Play,
  Plus,
  Repeat,
  Reply,
  SearchCode,
  Split,
  TriangleAlert,
  Webhook,
  Workflow,
  X,
  Zap
} from 'lucide-react'

import { ToolMark } from '@/components/landing/tool-stack-section'
import { MakeWorld } from '@/components/landing/demo/make-world'
import { DemoOutcomes } from '@/components/landing/demo/outcomes'
import { AppMark, visualOf, type NodeState } from '@/components/landing/demo/world'
import { ZapierWorld } from '@/components/landing/demo/zapier-world'
import { loadDemo } from '@/lib/demos'
import type { DemoBundle, DemoEdge, DemoLayout, DemoNode, DemoScenario } from '@/lib/demos/types'

import './n8n-demo.css'
import './worlds.css'

// ─── What each node looks like ───────────────────────────────────────────────

type Brand = { name: string; slug?: string; color: string }
type Glyph = { Icon: ComponentType<{ size?: number; strokeWidth?: number; color?: string }>; color: string }

const brand = (name: string, slug: string | undefined, color: string): Brand => ({ name, slug, color })

/** Logos for app nodes (painted in brand colour), line icons for n8n's own nodes. */
const ICONS: Record<string, Brand | Glyph> = {
  airtable: brand('Airtable', 'airtable', '#18BFFF'),
  airtableTool: brand('Airtable', 'airtable', '#18BFFF'),
  googleDrive: brand('Google Drive', 'googledrive', '#4285F4'),
  gmail: brand('Gmail', 'gmail', '#EA4335'),
  gmailTrigger: brand('Gmail', 'gmail', '#EA4335'),
  googleSheets: brand('Google Sheets', 'googlesheets', '#34A853'),
  slack: brand('Slack', 'slack', '#E01E5A'),
  postgres: brand('PostgreSQL', 'postgresql', '#5B8FD9'),
  quickbooks: brand('QuickBooks', 'quickbooks', '#2CA01C'),
  pipedrive: brand('Pipedrive', undefined, '#26B67C'),
  lmChatOpenAi: brand('OpenAI', 'openai', '#F2F2F2'),
  embeddingsOpenAi: brand('OpenAI', 'openai', '#F2F2F2'),
  lmChatGroq: brand('groq', undefined, '#F55036'),
  googleCalendar: { Icon: CalendarDays, color: '#4C8BF5' },
  googleCalendarTool: { Icon: CalendarDays, color: '#4C8BF5' },
  formTrigger: { Icon: ClipboardList, color: '#5EB0D6' },
  form: { Icon: ClipboardList, color: '#5EB0D6' },
  set: { Icon: Pen, color: '#8B80F9' },
  extractFromFile: { Icon: FileOutput, color: '#6F8FD8' },
  agent: { Icon: Bot, color: '#E8E8E8' },
  chainLlm: { Icon: Workflow, color: '#E8E8E8' },
  informationExtractor: { Icon: Braces, color: '#E8E8E8' },
  outputParserStructured: { Icon: Braces, color: '#E8E8E8' },
  if: { Icon: Split, color: '#3DBE68' },
  switch: { Icon: Split, color: '#7B6CF6' },
  filter: { Icon: Split, color: '#8B80F9' },
  code: { Icon: Code, color: '#F2994A' },
  httpRequest: { Icon: Globe, color: '#4F9BEE' },
  webhook: { Icon: Webhook, color: '#E8E8E8' },
  respondToWebhook: { Icon: Reply, color: '#5EB0D6' },
  scheduleTrigger: { Icon: Clock, color: '#3DBE68' },
  errorTrigger: { Icon: TriangleAlert, color: '#FF6D5A' },
  manualTrigger: { Icon: FlaskConical, color: '#E8E8E8' },
  chatTrigger: { Icon: MessageCircle, color: '#E8E8E8' },
  executeWorkflow: { Icon: Workflow, color: '#FF6D5A' },
  executeWorkflowTrigger: { Icon: Workflow, color: '#FF6D5A' },
  splitInBatches: { Icon: Repeat, color: '#3DBE68' },
  splitOut: { Icon: Merge, color: '#5EB0D6' },
  noOp: { Icon: Hourglass, color: '#9A9A9A' },
  memoryBufferWindow: { Icon: Database, color: '#E8E8E8' },
  vectorStoreInMemory: { Icon: SearchCode, color: '#E8E8E8' },
  documentDefaultDataLoader: { Icon: FileText, color: '#E8E8E8' }
}

function NodeIcon({ type, size }: { type: string; size: number }) {
  const icon = ICONS[type] ?? { Icon: Workflow, color: '#C8C8C8' }

  if ('Icon' in icon) return <icon.Icon size={size} strokeWidth={1.6} color={icon.color} />

  return <ToolMark tool={icon} size={size} />
}

// ─── Geometry ────────────────────────────────────────────────────────────────

/** n8n's spacing for the sub-node inputs under a root node. */
const PORT_GAP = 52

const portX = (node: DemoNode, index: number) =>
  node.shape === 'tool'
    ? node.x + 40 + index * PORT_GAP
    : node.x + node.w / 2 + (index - ((node.ports?.length ?? 1) - 1) / 2) * PORT_GAP

/** Sub-nodes and tools run inside the root node they plug into. */
const inside = (node: DemoNode) => node.shape === 'sub' || node.shape === 'tool'

const outY = (node: DemoNode, output: number) => node.y + (node.h * (output + 1)) / ((node.outputs?.length ?? 1) + 1)

/** A polyline with rounded corners, the way n8n routes a connection that runs backwards. */
function rounded(points: [number, number][], radius = 12) {
  let path = `M ${points[0][0]} ${points[0][1]}`

  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1]
    const [x, y] = points[i]
    const [nx, ny] = points[i + 1]
    const inLen = Math.hypot(x - px, y - py)
    const outLen = Math.hypot(nx - x, ny - y)
    const r = Math.min(radius, inLen / 2, outLen / 2)

    path += ` L ${x - ((x - px) / inLen) * r} ${y - ((y - py) / inLen) * r}`
    path += ` Q ${x} ${y} ${x + ((nx - x) / outLen) * r} ${y + ((ny - y) / outLen) * r}`
  }

  const last = points[points.length - 1]

  return `${path} L ${last[0]} ${last[1]}`
}

/** The path of one connection, and where its item count sits. */
function route(edge: DemoEdge, from: DemoNode, to: DemoNode) {
  if (edge.kind !== 'main') {
    const index = to.ports?.findIndex(port => port.kind === edge.kind) ?? 0
    const sx = from.x + from.w / 2
    const sy = from.y
    const tx = portX(to, Math.max(index, 0))
    const ty = to.y + to.h + 6

    return { d: `M ${sx} ${sy} C ${sx} ${sy - 50} ${tx} ${ty + 50} ${tx} ${ty}`, label: [(sx + tx) / 2, (sy + ty) / 2] }
  }

  const sx = from.x + from.w + 6
  const sy = outY(from, edge.output)
  const tx = to.x - 6
  const ty = to.y + to.h / 2

  if (tx >= sx + 30) {
    const dx = Math.max(40, (tx - sx) / 2)

    return {
      d: `M ${sx} ${sy} C ${sx + dx} ${sy} ${tx - dx} ${ty} ${tx} ${ty}`,
      label: [(sx + tx) / 2, (sy + ty) / 2 - 10]
    }
  }

  // Backwards: out, down into the gap above the target's row, across, and in.
  const lane = to.y > from.y ? to.y - 48 : from.y + from.h + 72

  return {
    d: rounded([
      [sx, sy],
      [sx + 24, sy],
      [sx + 24, lane],
      [tx - 24, lane],
      [tx - 24, ty],
      [tx, ty]
    ]),
    label: [(sx + tx) / 2, lane - 10]
  }
}

// ─── The run ─────────────────────────────────────────────────────────────────

/**
 * A run worked out in advance. `steps` are the main-flow nodes in the order
 * n8n runs them (depth first, branch by branch); `travelled` indexes into
 * `layout.edges` each connection the run passes along.
 */
type Plan = {
  steps: string[]
  travelled: Set<number>
}

function plan(layout: DemoLayout, scenario: DemoScenario): Plan {
  const steps: string[] = []
  const travelled = new Set<number>()
  const targets = new Set(layout.edges.filter(e => e.kind === 'main').map(e => e.to))

  const starts = scenario.start
    ? scenario.start.flatMap(name => layout.nodes.filter(n => n.name === name))
    : layout.nodes.filter(n => n.shape === 'trigger' && !targets.has(n.name) && n.name in scenario.output)

  const visit = (name: string) => {
    if (steps.includes(name)) return
    steps.push(name)

    // Branching nodes take the scenario's output(s), in order: a loop runs
    // its items first, then leaves by "done". Everything else takes its first.
    const chosen = [scenario.branch?.[name] ?? 0].flat()

    chosen.forEach(output =>
      layout.edges.forEach((edge, index) => {
        if (edge.from !== name || edge.kind !== 'main' || edge.output !== output) return

        // A scenario ends where its data does: a node it has no output for never ran.
        if (!(edge.to in scenario.output)) return
        travelled.add(index)
        visit(edge.to)
      })
    )
  }

  starts.forEach(start => visit(start.name))

  return { steps, travelled }
}

/** How long a step takes to look like it ran: AI steps think, people take a moment. */
function stepTime(node: DemoNode | undefined, scenario: DemoScenario) {
  if (!node) return 400
  if (scenario.waits?.[node.name]) return 2200
  if (node.shape === 'root') return 1300
  if (node.shape === 'trigger') return 500

  return 560
}

const itemCount = (value: unknown) => (Array.isArray(value) ? value.length : value === undefined ? 0 : 1)
const items = (count: number, unit = 'item') => `${count} ${unit}${count === 1 ? '' : 's'}`

type Run = { scenario: DemoScenario; plan: Plan; cursor: number; done: boolean }

// ─── JSON, coloured the way n8n's output panel does ─────────────────────────

const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)|\b(true|false|null)\b/g

function JsonView({ value }: { value: unknown }) {
  const text = JSON.stringify(value, null, 2)
  const parts: { text: string; kind?: string }[] = []
  let last = 0

  for (const match of text.matchAll(TOKEN)) {
    const at = match.index ?? 0

    if (at > last) parts.push({ text: text.slice(last, at) })

    if (match[1] && match[2]) {
      parts.push({ text: match[1], kind: 'key' }, { text: match[2] })
    } else if (match[1]) {
      parts.push({ text: match[1], kind: 'string' })
    } else if (match[3]) {
      parts.push({ text: match[3], kind: 'number' })
    } else {
      parts.push({ text: match[4], kind: 'literal' })
    }

    last = at + match[0].length
  }

  parts.push({ text: text.slice(last) })

  return (
    <pre className='n8n-json'>
      {parts.map((part, index) =>
        part.kind ? (
          <span key={index} data-kind={part.kind}>
            {part.text}
          </span>
        ) : (
          part.text
        )
      )}
    </pre>
  )
}

// ─── The canvas ──────────────────────────────────────────────────────────────

/** Room the canvas's own controls take: the toolbar above, zoom and the note below. */
const INSET = { top: 64, bottom: 56, side: 24 }
const ZOOM = { min: 0.12, max: 2.5, step: 1.25 }

type View = { x: number; y: number; k: number }

/**
 * A project's n8n build, drawn the way the n8n editor draws it, that runs.
 *
 * Every node, group and connection comes from the published workflow export,
 * at the position it has in n8n, so this is the same picture as the build
 * screenshot, made live. Pressing Execute simulates a run of the chosen
 * sample input: nodes light in n8n's own order, connections count their
 * items, and any node opens to show what it returned. Nothing leaves the page.
 */
/** The section around the canvas: its label, and a frame tall enough to read the nodes in. */
/** Each editor's words for its own parts: what a step is called, and its run button. */
const CHROME = {
  n8n: {
    canvas: '#232323',
    unit: 'node for node',
    run: 'Execute workflow',
    running: 'Executing workflow',
    again: 'Execute again',
    done: 'Workflow executed successfully',
    press: 'Execute',
    item: 'item',
    legible: 0,

    /** The zoom a run is followed at: a node about 85px across. */
    follow: 0.85,
    Icon: FlaskConical
  },
  make: {
    canvas: '#f6f6f6',
    unit: 'module for module',
    run: 'Run once',
    running: 'Running',
    again: 'Run once again',
    done: 'The scenario ran successfully',
    press: 'Run once',
    item: 'bundle',
    legible: 0,
    follow: 0.7,
    Icon: Play
  },
  zapier: {
    canvas: '#f7f6f2',
    unit: 'step for step',
    run: 'Test run',
    running: 'Running',
    again: 'Test run again',
    done: 'Zap ran successfully',
    press: 'Test run',
    item: 'item',

    /** A Zap with Paths is far wider than tall; fitted whole, its steps are unreadable. */
    legible: 0.5,
    follow: 0.75,
    Icon: Zap
  }
} as const

type Platform = keyof typeof CHROME

const platformOf = (name: string): Platform => {
  const key = name.toLowerCase()

  return key === 'make' || key === 'zapier' ? key : 'n8n'
}

/** Where the reader is in the demo: choosing, watching a run, or done and ready to read the results. */
type Phase = 'idle' | 'running' | 'done'

/**
 * The three things to do, in order, with the one to do now lit. The third
 * step turns into a link down to the results once a run has finished.
 */
function DemoGuide({
  phase,
  press,
  picked,
  onResults
}: {
  phase: Phase
  press: string
  picked?: string
  onResults?: () => void
}) {
  const steps = [
    {
      title: 'Pick a sample',

      // One is picked from the start, so this step is already met; it says which, and that it can change.
      detail: picked ? `${picked} · switch anytime` : 'Choose an input on the canvas',
      state: 'done'
    },
    {
      title: `Press ${press}`,
      detail: phase === 'running' ? 'Watch each step light up' : 'Run it on the sample',
      state: phase === 'done' ? 'done' : 'current'
    },
    {
      title: 'See the results',
      detail: onResults ? 'What the run sent, saved and posted, below' : 'Click any node to see its data',
      state: phase === 'done' ? 'current' : 'next'
    }
  ] as const

  return (
    <ol className='demo-guide' aria-label='How to use this demo'>
      {steps.map((step, index) => {
        const last = index === steps.length - 1

        const body = (
          <>
            <span className='demo-guide-num' aria-hidden='true'>
              {step.state === 'done' ? <Check size={12} strokeWidth={3} /> : index + 1}
            </span>
            <span className='demo-guide-text'>
              <span className='demo-guide-title'>
                {step.title}
                {last && phase === 'done' && onResults && <ArrowDown size={13} className='demo-guide-arrow' />}
              </span>
              <span className='demo-guide-detail'>{step.detail}</span>
            </span>
          </>
        )

        return (
          <li key={step.title} data-state={step.state} aria-current={step.state === 'current' ? 'step' : undefined}>
            {last && phase === 'done' && onResults ? (
              <button type='button' className='demo-guide-step' onClick={onResults}>
                {body}
              </button>
            ) : (
              <span className='demo-guide-step'>{body}</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function DemoCard({
  platform,
  guide,
  children
}: {
  platform: string
  guide?: ReactNode
  children: ReactNode
}) {
  const chrome = CHROME[platformOf(platform)]

  return (
    <section
      className='border-rule bg-surface-raised rounded-2xl border p-3 shadow-sm sm:p-4'
      aria-label='Interactive demo'
    >
      <div className='border-rule mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-1 pb-3'>
        <p className='text-accent font-mono text-xs font-medium tracking-[0.2em] uppercase'>INTERACTIVE DEMO</p>
        <p className='text-ink-3 text-[13px]'>
          The {platform} build, {chrome.unit}. A simulated run on sample data.
        </p>
        {guide}
      </div>
      {/* `data-tone` turns the site cursor over on n8n's dark canvas: it
          takes its ink from the surface under it (n8n-demo.css). */}
      <div
        className='relative h-[clamp(480px,74vh,860px)] overflow-hidden rounded-xl'
        data-tone={platformOf(platform) === 'n8n' ? 'dark' : undefined}
        style={{ backgroundColor: chrome.canvas }}
      >
        {children}
      </div>
    </section>
  )
}

export function WorkflowDemo({
  slug,
  platform,
  fallback,
  alt,
  reduced
}: {
  slug: string
  platform: string
  fallback: string
  alt: string
  reduced: boolean
}) {
  const [bundle, setBundle] = useState<DemoBundle | null>(null)

  useEffect(() => {
    let live = true

    loadDemo(slug)?.then(loaded => {
      if (live) setBundle(loaded)
    })

    return () => {
      live = false
    }
  }, [slug])

  // Until the layout arrives, the build screenshot holds the frame.
  if (!bundle) {
    return (
      <DemoCard platform={platform}>
        <img src={fallback} alt={alt} className='absolute inset-0 h-full w-full object-contain' />
      </DemoCard>
    )
  }

  return <Canvas bundle={bundle} reduced={reduced} label={alt} platform={platform} />
}

function Canvas({
  bundle,
  reduced,
  label,
  platform
}: {
  bundle: DemoBundle
  reduced: boolean
  label: string
  platform: string
}) {
  const { layout } = bundle
  const frameRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const view = useRef<View>({ x: 0, y: 0, k: 0.3 })
  const pan = useRef<{ id: number; x: number; y: number; from: View; moved: boolean } | null>(null)
  const swallowClick = useRef(false)

  // Set when the reader pans or zooms during a run: from then on the camera
  // is theirs, so it stops following and does not pull back at the end.
  const steered = useRef(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Scenarios are built once, when the canvas mounts, so their dates sit ahead of today.
  const [scenarios] = useState(() => bundle.scenarios(new Date()))
  const [picked, setPicked] = useState(scenarios[0]?.id)
  const [run, setRun] = useState<Run | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  const scenario = scenarios.find(s => s.id === picked) ?? scenarios[0]
  const chrome = CHROME[layout.platform]
  const glideTimer = useRef(0)
  const byName = new Map(layout.nodes.map(node => [node.name, node]))

  const apply = () => {
    const world = worldRef.current
    const { x, y, k } = view.current

    if (world) world.style.transform = `translate(${x}px, ${y}px) scale(${k})`
  }

  /** The view that shows the whole build, or opens on the trigger when that is too small to read. */
  const fitted = (): View | null => {
    const frame = frameRef.current

    if (!frame) return null

    const { x, y, x2, y2 } = layout.bounds
    const width = frame.clientWidth - INSET.side * 2
    const height = frame.clientHeight - INSET.top - INSET.bottom
    const k = Math.min(width / (x2 - x), height / (y2 - y))
    const legible = CHROME[layout.platform].legible
    const trigger = layout.nodes.find(node => node.shape === 'trigger')

    // Too big to read whole: open at a readable zoom on the trigger, and let the run lead the way.
    return k < legible && trigger
      ? {
          k: legible,
          x: frame.clientWidth / 2 - (trigger.x + trigger.w / 2) * legible,
          y: INSET.top + 24 - trigger.y * legible
        }
      : {
          k,
          x: INSET.side + (width - (x2 - x) * k) / 2 - x * k,
          y: INSET.top + (height - (y2 - y) * k) / 2 - y * k
        }
  }

  const fit = () => {
    const next = fitted()

    if (!next) return
    view.current = next
    apply()
  }

  /** Moves the canvas to `next`, easing over `ms` when the move is ours, not the reader's. */
  const glideTo = (next: View, ms = 650) => {
    const world = worldRef.current

    if (!world) return

    view.current = next
    world.style.setProperty('--glide', `${ms}ms`)
    world.dataset.glide = ''
    apply()
    window.clearTimeout(glideTimer.current)
    glideTimer.current = window.setTimeout(() => delete world.dataset.glide, ms + 50)
  }

  /**
   * The camera on a run: closes in to a readable zoom on the node at work,
   * and pans on only when the run leaves the calm middle of the frame, so it
   * travels in a few long glides rather than a jolt on every step.
   */
  const follow = (node: DemoNode) => {
    const frame = frameRef.current

    if (!frame || steered.current) return

    const { x, y, k: was } = view.current
    const k = Math.max(was, chrome.follow)
    const left = x + node.x * k
    const top = y + node.y * k

    // The middle of the frame, inside the toolbar, the zoom buttons and a margin.
    const marginX = frame.clientWidth * 0.18
    const marginY = (frame.clientHeight - INSET.top - INSET.bottom) * 0.18

    const calm =
      k === was &&
      left >= INSET.side + marginX &&
      top >= INSET.top + marginY &&
      left + node.w * k <= frame.clientWidth - INSET.side - marginX &&
      top + node.h * k <= frame.clientHeight - INSET.bottom - marginY

    if (calm) return

    glideTo(
      {
        k,
        x: frame.clientWidth * 0.42 - (node.x + node.w / 2) * k,
        y: (INSET.top + frame.clientHeight - INSET.bottom) / 2 - (node.y + node.h / 2) * k
      },
      k === was ? 650 : 900
    )
  }

  /** Zoom by `factor` about a point in the frame (its centre by default). */
  const zoom = (factor: number, cx?: number, cy?: number) => {
    const frame = frameRef.current

    if (!frame) return

    steered.current = true

    const { x, y, k } = view.current
    const next = Math.min(ZOOM.max, Math.max(ZOOM.min, k * factor))
    const px = cx ?? frame.clientWidth / 2
    const py = cy ?? frame.clientHeight / 2

    view.current = { k: next, x: px - ((px - x) / k) * next, y: py - ((py - y) / k) * next }
    apply()
  }

  // Fitted on mount and whenever the frame changes size (the dialog, full screen, a resize).
  useEffect(() => {
    const frame = frameRef.current

    if (!frame) return

    const observer = new ResizeObserver(() => fit())

    observer.observe(frame)

    // Pinch on a trackpad (and ctrl + wheel) zooms the canvas, as in n8n.
    // Plain wheel is left alone, so the dialog still scrolls past it.
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()

      const box = frame.getBoundingClientRect()

      zoom(Math.exp(-event.deltaY * 0.01), event.clientX - box.left, event.clientY - box.top)
    }

    frame.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      observer.disconnect()
      frame.removeEventListener('wheel', onWheel)
    }

    // `fit` and `zoom` only read refs and the static layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout])

  // The run: one step per tick, each node held long enough to read as working.
  useEffect(() => {
    if (!run || run.done) return

    const node = byName.get(run.plan.steps[run.cursor])

    if (node && !reduced) follow(node)

    const timer = window.setTimeout(
      () =>
        setRun(current =>
          current
            ? current.cursor + 1 >= current.plan.steps.length
              ? { ...current, done: true }
              : { ...current, cursor: current.cursor + 1 }
            : current
        ),
      reduced ? 0 : stepTime(node, run.scenario)
    )

    return () => window.clearTimeout(timer)

    // `byName` is rebuilt each render from the static layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, reduced])

  // Once a run ends, the camera eases back out to the whole build, where the
  // path it took stays lit and the branches it skipped fall back.
  useEffect(() => {
    if (!run?.done || reduced || steered.current) return

    const timer = window.setTimeout(() => {
      const next = fitted()

      if (next) glideTo(next, 1100)
    }, 700)

    return () => window.clearTimeout(timer)

    // `fitted` and `glideTo` only read refs and the static layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.done, reduced])

  useEffect(() => () => window.clearTimeout(glideTimer.current), [])

  const execute = () => {
    if (!scenario) return
    steered.current = false
    setRun({ scenario, plan: plan(layout, scenario), cursor: 0, done: false })
  }

  const pick = (id: string) => {
    setPicked(id)
    setRun(null)
  }

  /** Where each node stands in the current run. */
  const stateOf = (node: DemoNode): NodeState => {
    if (!run) return 'idle'

    // A sub-node works while its root node does.
    const name = inside(node)
      ? layout.edges.find(edge => edge.from === node.name && edge.kind !== 'main')?.to
      : node.name

    const index = name ? run.plan.steps.indexOf(name) : -1

    if (index === -1) return 'idle'
    if (index < run.cursor || run.done) return 'success'
    if (index === run.cursor) return run.scenario.waits?.[name ?? ''] ? 'waiting' : 'running'

    return 'idle'
  }

  /** A connection lights once the node it leads to has started. */
  const edgeLit = (edge: DemoEdge, index: number) => {
    if (!run) return false

    // A Make error handler only runs when its module fails, and no sample run fails.
    if (edge.kind === 'error') return false

    if (edge.kind !== 'main') {
      const from = byName.get(edge.from)

      return from ? stateOf(from) === 'success' : false
    }

    if (!run.plan.travelled.has(index)) return false

    const step = run.plan.steps.indexOf(edge.to)

    return run.done || step <= run.cursor
  }

  const current = run && !run.done ? byName.get(run.plan.steps[run.cursor]) : undefined
  const waiting = current && run?.scenario.waits?.[current.name]

  // ── Panning: drag anywhere on the canvas. A drag never counts as a click. ──

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swallowClick.current = false
    if (event.button !== 0 || (event.target as Element).closest('.n8n-chrome')) return
    pan.current = { id: event.pointerId, x: event.clientX, y: event.clientY, from: view.current, moved: false }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = pan.current

    if (!state || state.id !== event.pointerId) return

    const dx = event.clientX - state.x
    const dy = event.clientY - state.y

    if (!state.moved) {
      if (Math.hypot(dx, dy) < 5) return
      state.moved = true
      steered.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
      event.currentTarget.dataset.panning = ''
    }

    view.current = { ...state.from, x: state.from.x + dx, y: state.from.y + dy }
    apply()
  }

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const state = pan.current

    if (!state || state.id !== event.pointerId) return
    pan.current = null
    delete event.currentTarget.dataset.panning
    if (state.moved) swallowClick.current = true
  }

  const openNode = byName.get(open ?? '')
  const openState = openNode ? stateOf(openNode) : 'idle'
  const openOutput = openNode && run ? run.scenario.output[openNode.name] : undefined

  const parentOf = (node: DemoNode) =>
    layout.edges.find(edge => edge.from === node.name && edge.kind !== 'main')?.to ?? node.name

  // The nodes this run has finished, for the results to fill in behind it.
  const reached = run ? new Set(run.done ? run.plan.steps : run.plan.steps.slice(0, run.cursor)) : null
  const shown = run?.scenario ?? scenario
  const countOf = (node: DemoNode) => itemCount(run?.scenario.output[node.name])

  const phase: Phase = !run ? 'idle' : run.done ? 'done' : 'running'
  const hasResults = Boolean(shown?.outcomes?.length)

  const toResults = () =>
    resultsRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })

  return (
    <>
      <DemoCard
        platform={platform}
        guide={
          <DemoGuide
            phase={phase}
            press={chrome.run}
            picked={scenarios.length > 1 ? scenario?.label : undefined}
            onResults={hasResults ? toResults : undefined}
          />
        }
      >
        <div
          ref={frameRef}
          className='n8n-demo'
          data-platform={layout.platform}
          data-no-lens
          data-running={run && !run.done ? '' : undefined}
          data-ran={run?.done ? '' : undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onClickCapture={event => {
            if (!swallowClick.current) return
            swallowClick.current = false
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          <div ref={worldRef} className='n8n-world' aria-label={label} role='group'>
            {layout.platform === 'make' ? (
              <MakeWorld layout={layout} stateOf={stateOf} edgeLit={edgeLit} countOf={countOf} onOpen={setOpen} />
            ) : layout.platform === 'zapier' ? (
              <ZapierWorld layout={layout} stateOf={stateOf} edgeLit={edgeLit} countOf={countOf} onOpen={setOpen} />
            ) : (
              <>
                {layout.stickies.map(sticky => (
                  <div
                    key={`${sticky.x},${sticky.y}`}
                    className='n8n-sticky'
                    data-color={sticky.color}
                    style={{ left: sticky.x, top: sticky.y, width: sticky.w, height: sticky.h }}
                  >
                    {sticky.title}
                  </div>
                ))}

                <svg className='n8n-edges' aria-hidden='true'>
                  {layout.edges.map((edge, index) => {
                    const from = byName.get(edge.from)
                    const to = byName.get(edge.to)

                    if (!from || !to) return null

                    const { d, label: at } = route(edge, from, to)
                    const lit = edgeLit(edge, index)
                    const count = lit && edge.kind === 'main' ? itemCount(run?.scenario.output[edge.from]) : 0

                    return (
                      <g key={index} data-kind={edge.kind === 'main' ? 'main' : 'ai'} data-lit={lit || undefined}>
                        <path d={d} />
                        {count > 0 && (
                          <text x={at[0]} y={at[1]} textAnchor='middle'>
                            {items(count)}
                          </text>
                        )}
                      </g>
                    )
                  })}

                  {/* The open end n8n leaves after a node with nothing connected. */}
                  {layout.nodes.flatMap(node => {
                    if (node.shape !== 'default' && node.shape !== 'trigger') return []

                    const outs = node.outputs?.length ?? 1

                    return Array.from({ length: outs }, (_, output) => output)
                      .filter(
                        output =>
                          !layout.edges.some(e => e.from === node.name && e.kind === 'main' && e.output === output)
                      )
                      .map(output => {
                        const x = node.x + node.w + 6
                        const y = outY(node, output)

                        return (
                          <g key={`${node.name}:${output}`} className='n8n-open-end'>
                            <path d={`M ${x} ${y} H ${x + 36}`} />
                            <rect x={x + 36} y={y - 10} width={20} height={20} rx={4} />
                            <path d={`M ${x + 41} ${y} H ${x + 51} M ${x + 46} ${y - 5} V ${y + 5}`} />
                          </g>
                        )
                      })
                  })}
                </svg>

                {layout.nodes.map(node => {
                  const state = stateOf(node)

                  return (
                    <button
                      key={node.name}
                      type='button'
                      className='n8n-node'
                      data-shape={node.shape}
                      data-state={state}
                      aria-label={`${node.name}${state === 'success' ? ', ran' : ''}. Show output`}
                      style={{ left: node.x, top: node.y, width: node.w, height: node.h } as CSSProperties}
                      onClick={() => setOpen(node.name)}
                    >
                      <span className='n8n-node-icon'>
                        <NodeIcon type={node.type} size={node.shape === 'sub' ? 34 : 44} />
                      </span>

                      {(node.shape === 'root' || node.shape === 'tool') && (
                        <span className='n8n-node-inline'>{node.name}</span>
                      )}
                      {node.shape === 'trigger' && <Zap className='n8n-trigger-bolt' size={18} aria-hidden='true' />}

                      {state === 'success' && (
                        <span className='n8n-node-check' aria-hidden='true'>
                          <Check size={16} strokeWidth={3} />
                        </span>
                      )}
                      {(state === 'running' || state === 'waiting') && (
                        <span className='n8n-node-spin' aria-hidden='true'>
                          {state === 'waiting' ? <Hourglass size={16} /> : <LoaderCircle size={18} />}
                        </span>
                      )}

                      {!inside(node) && <span className='n8n-handle' data-side='in' />}
                      {!inside(node) &&
                        (node.outputs ?? ['']).map((name, output) => (
                          <span
                            key={output}
                            className='n8n-handle'
                            data-side='out'
                            style={{ top: outY(node, output) - node.y }}
                          >
                            {name && <span className='n8n-handle-label'>{name}</span>}
                          </span>
                        ))}
                      {inside(node) && <span className='n8n-handle' data-side='top' />}

                      {node.ports?.map((port, index) => (
                        <span key={port.kind} className='n8n-port' style={{ left: portX(node, index) - node.x }}>
                          <span className='n8n-port-label'>{port.label}</span>
                          {(!port.wired || port.kind === 'ai_tool') && <span className='n8n-port-add'>+</span>}
                        </span>
                      ))}

                      {(node.shape === 'default' || node.shape === 'trigger' || node.shape === 'sub') && (
                        <span className='n8n-node-label'>
                          <span className='n8n-node-name'>{node.name}</span>
                          {node.subtitle && <span className='n8n-node-subtitle'>{node.subtitle}</span>}
                        </span>
                      )}
                    </button>
                  )
                })}
              </>
            )}
          </div>

          {/* ── The editor's own controls ─────────────────────────────────────── */}

          <div className='n8n-chrome n8n-toolbar'>
            <div className='n8n-scenarios' role='radiogroup' aria-label='Sample input'>
              {scenarios.map(item => (
                <button
                  key={item.id}
                  type='button'
                  role='radio'
                  aria-checked={item.id === scenario?.id}
                  className='n8n-scenario'
                  disabled={Boolean(run && !run.done)}
                  onClick={() => pick(item.id)}
                >
                  {item.label}
                </button>
              ))}
              {scenario && <span className='n8n-hint'>{scenario.hint}</span>}
            </div>

            <button
              type='button'
              className='n8n-execute'
              data-invite={phase === 'idle' ? '' : undefined}
              disabled={phase === 'running'}
              onClick={execute}
            >
              {run && !run.done ? <LoaderCircle size={15} className='n8n-spin' /> : <chrome.Icon size={15} />}
              {run && !run.done ? chrome.running : run ? chrome.again : chrome.run}
            </button>
          </div>

          <div className='n8n-chrome n8n-zoom' role='group' aria-label='Canvas zoom'>
            <button
              type='button'
              aria-label='Fit view'
              onClick={() => {
                steered.current = true
                const next = fitted()

                if (next) glideTo(next)
              }}
            >
              <Maximize2 size={15} />
            </button>
            <button type='button' aria-label='Zoom in' onClick={() => zoom(ZOOM.step)}>
              <Plus size={15} />
            </button>
            <button type='button' aria-label='Zoom out' onClick={() => zoom(1 / ZOOM.step)}>
              <Minus size={15} />
            </button>
          </div>

          <p className='n8n-chrome n8n-note'>Simulated run · sample data</p>

          {/* What to do next, at the foot of the canvas, where the eye lands after a run. */}
          <div className='n8n-chrome n8n-coach' data-phase={phase}>
            {phase === 'done' && hasResults ? (
              <button type='button' className='n8n-coach-cta' onClick={toResults}>
                See the results
                <ArrowDown size={14} />
              </button>
            ) : (
              <p className='n8n-coach-tip'>
                {phase === 'running'
                  ? 'Click any node to watch its data come in'
                  : phase === 'done'
                    ? 'Click any node to see what it returned'
                    : `Press ${chrome.run} to start · drag to pan · pinch to zoom`}
              </p>
            )}
          </div>

          <p
            className='n8n-chrome n8n-status'
            role='status'
            data-tone={run?.done ? 'done' : waiting ? 'wait' : undefined}
          >
            {run?.done ? (
              <>
                {chrome.done}
                <span className='n8n-status-step'>{run.plan.steps.length} steps</span>
              </>
            ) : run && current ? (
              <>
                <span className='n8n-status-step'>
                  Step {run.cursor + 1} of {run.plan.steps.length}
                </span>
                {waiting || current.label || current.name}
                <i
                  className='n8n-status-bar'
                  aria-hidden='true'
                  style={{ '--p': (run.cursor + 1) / run.plan.steps.length } as CSSProperties}
                />
              </>
            ) : null}
          </p>

          {/* ── A node's output, as n8n's panel shows it ──────────────────────── */}
          {openNode && (
            <aside className='n8n-chrome n8n-panel' aria-label={`${openNode.name} output`}>
              <header>
                {layout.platform === 'n8n' ? (
                  <NodeIcon type={openNode.type} size={20} />
                ) : (
                  <AppMark visual={visualOf(layout.platform, openNode.type)} size={20} />
                )}
                <span>
                  {layout.platform === 'make'
                    ? `${openNode.label ?? openNode.name} [${openNode.number}]`
                    : openNode.name}
                </span>
                <button type='button' aria-label='Close output' onClick={() => setOpen(null)}>
                  <X size={16} />
                </button>
              </header>
              <div className='n8n-panel-tab'>
                <span>{layout.platform === 'zapier' ? 'Data out' : 'Output'}</span>
                {openOutput !== undefined && openState === 'success' && (
                  <span>{items(itemCount(openOutput), chrome.item)}</span>
                )}
              </div>
              <div className='n8n-panel-body'>
                {openState === 'success' && openOutput !== undefined ? (
                  <JsonView value={openOutput} />
                ) : openState === 'running' || openState === 'waiting' ? (
                  <p>Executing node…</p>
                ) : run?.done ? (
                  <p>
                    {inside(openNode) && openState === 'success'
                      ? `Ran inside ${parentOf(openNode)}. Its result is part of that node's output.`
                      : 'This node did not run on this input.'}
                  </p>
                ) : inside(openNode) ? (
                  <p>Runs inside {parentOf(openNode)}. Execute the workflow to see what it returned.</p>
                ) : (
                  <p>No output data yet. Execute the workflow to see what this node returns.</p>
                )}
              </div>
            </aside>
          )}
        </div>
      </DemoCard>

      {shown?.outcomes && (
        <div ref={resultsRef} className='demo-results-anchor'>
          <DemoOutcomes outcomes={shown.outcomes} reached={reached} subject='this run' />
        </div>
      )}
    </>
  )
}
