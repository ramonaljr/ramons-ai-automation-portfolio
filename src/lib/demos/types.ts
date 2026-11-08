/**
 * The interactive demos: a project's build, drawn as it stands in its tool,
 * that a visitor can run on sample input.
 *
 * The layout comes from the published export (scripts/n8n-demo-layout.mjs,
 * make-demo-layout.mjs, zapier-demo-layout.mjs), so it is the real build,
 * step for step, in one shape whichever tool it was built in. The
 * run is simulated: each scenario lists what every node returns for that
 * input, written in the build's own field names rather than captured from an
 * execution, so the page says "Simulated run", never "replay". Nothing is sent
 * anywhere when a visitor presses Execute.
 */

/**
 * `tool` is a node plugged into an agent that has inputs of its own, like a
 * vector store used as a tool: drawn as a wide pill, it works while the agent does.
 */
export type DemoNodeShape = 'default' | 'trigger' | 'root' | 'sub' | 'tool'

export type DemoPort = {
  kind: string
  label: string
  wired: boolean
}

export type DemoNode = {

  /** Unique within the layout; the key a scenario's output uses. */
  name: string

  /** What the editor prints when it differs from the name (Make: "Gmail" on two modules). */
  label?: string

  /** Make's module number, shown in the grey badge beside the name. */
  number?: number

  /**
   * n8n: the node type without its package (`airtable`, `agent`).
   * Make: the module (`google-sheets:updateRow`). Zapier: the app (`AirtableCLIAPI`).
   */
  type: string
  shape: DemoNodeShape
  x: number
  y: number
  w: number
  h: number
  subtitle?: string

  /** Named outputs on a branching node (If: true, false). */
  outputs?: string[]

  /** Sub-node inputs along a root node's base. */
  ports?: DemoPort[]
}

export type DemoEdge = {
  from: string
  to: string

  /**
   * `main` for the flow, `ai_*` for a sub-node plugged into a root node,
   * `error` for a Make error handler hanging below its module.
   */
  kind: string
  output: number

  /** Make: the filter on the link. Zapier: the branch's pill ("Path 1: …", "Success"). */
  label?: string

  /** Zapier: which kind of branch, for the pill's colour. */
  tone?: 'path' | 'success' | 'error'
}

export type DemoSticky = {
  x: number
  y: number
  w: number
  h: number
  color: number
  title: string
}

export type DemoLayout = {
  platform: 'n8n' | 'make' | 'zapier'
  name: string
  bounds: { x: number; y: number; x2: number; y2: number }
  stickies: DemoSticky[]

  /** Make: the grey band from an aggregator back to the module it collects from. */
  bands?: { from: string; to: string }[]
  nodes: DemoNode[]
  edges: DemoEdge[]
}

/**
 * What a run leaves behind where people see it: the email in the applicant's
 * inbox, the message in Slack, the row in the table. Each names the node that
 * produces it, so during a run its card fills in when that node does.
 */
export type DemoOutcome =
  | {
      kind: 'email'
      node: string
      from: string
      to: string
      subject: string
      body: string
      time: string
    }
  | {
      kind: 'slack'
      node: string
      channel: string
      app: string
      time: string

      /** Lines of the message; `*bold*` as Slack writes it. */
      text: string[]

      /** A message that waits for an answer shows its buttons. */
      buttons?: string[]
    }
  | {
      kind: 'airtable' | 'sheets'
      node: string

      /** Base or spreadsheet name, and the table or tab. */
      file: string
      table: string
      columns: string[]
      rows: (string | number)[][]

      /** The row this run wrote, by index in `rows`. */
      highlight?: number
    }
  | {
      kind: 'calendar'
      node: string
      title: string
      date: string
      time: string

      /** Where the build puts the meeting, as its Location field says. */
      location?: string

      /** The build asks Google for a Meet link. */
      meet?: boolean
      guests: string[]
      note?: string
    }
  | {
      kind: 'form'
      node: string
      title: string
      fields: { label: string; value: string }[]
    }
  | {

      /** One record in an app without a grid of its own: a bill, a deal, a database row. */
      kind: 'record'
      node: string
      app: 'QuickBooks' | 'Pipedrive' | 'PostgreSQL' | 'Google Drive'
      title: string
      badge?: string
      fields: { label: string; value: string }[]
    }
  | {

      /** A conversation: a voice call's transcript or a chat with an assistant. */
      kind: 'chat'
      node: string
      app: 'VAPI' | 'n8n chat'
      title: string
      lines: { from: 'agent' | 'person'; text: string }[]
    }

export type DemoScenario = {
  id: string

  /** The pill a visitor picks it by. */
  label: string

  /** One line on what this input will show. */
  hint: string

  /**
   * Which output each branching node takes. Unlisted nodes take their first.
   * A list is taken in order: a loop's items (1), then its "done" (0).
   */
  branch?: Record<string, number | number[]>

  /** Nodes that pause for a person, and what they are waiting for. */
  waits?: Record<string, string>

  /**
   * What each node returned, by node name. An array is several items, as n8n
   * counts them on the connection that leaves the node.
   */
  output: Record<string, unknown>

  /** What the run produces, shown under the canvas. */
  outcomes?: DemoOutcome[]

  /**
   * Trigger nodes to start from, in order, for a build with several entry
   * points (a voice agent's tools each arrive on their own webhook). Defaults
   * to every trigger the scenario has output for.
   */
  start?: string[]
}

export type DemoBundle = {
  layout: DemoLayout

  /** Built when a run starts, so dates in the sample data are always ahead. */
  scenarios: (now: Date) => DemoScenario[]
}
