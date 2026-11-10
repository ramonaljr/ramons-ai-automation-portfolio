import diagrams from '../../../../docs/process-diagrams/diagrams.json'

/**
 * A case study's process map as the films draw it: its lanes in order, each
 * with its steps and their icons, read from the same file that builds the
 * card and dialog SVGs (docs/process-diagrams/build.cjs). A changed step
 * changes the map, the card and the film together. Lanes are numbered as the
 * map numbers them, from 1.
 */
export type LaneStep = { name: string; icon: string }

export type Lane = {
  n: number
  title: string
  concept: string
  tone: { bg: string; border: string; accent: string }
  steps: LaneStep[]
}

/** build.cjs's colour families, in the same order, so a lane keeps its map colour. */
const PALETTE = [
  { bg: '#EBF2FD', border: '#AFCBF2', accent: '#2F6FD6' },
  { bg: '#E8F7F3', border: '#A4DACD', accent: '#13917C' },
  { bg: '#F2EDFB', border: '#C8B6EE', accent: '#7650D6' },
  { bg: '#FFF4E2', border: '#F3CD8E', accent: '#D9820F' },
  { bg: '#EAF6EC', border: '#AAD8B3', accent: '#2E9447' },
  { bg: '#FDEEF6', border: '#F0B8D6', accent: '#C2408A' }
]

const BREAKS = { bg: '#FDECEA', border: '#F1B5AF', accent: '#D6453A' }

type Diagram = { slug: string; stages: { title: string; concept?: string; steps: LaneStep[] }[] }

/** diagrams.json keeps its text HTML-escaped for the SVGs; the films show it as text. */
const plain = (text: string) =>
  text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")

export function lanesOf(slug: string): Lane[] {
  const diagram = (diagrams as Diagram[]).find(d => d.slug === slug)

  if (!diagram) throw new Error(`No process map for ${slug} in diagrams.json`)

  return diagram.stages.map((stage, i) => ({
    n: i + 1,
    title: plain(stage.title),
    concept: stage.concept ?? 'checkCircle',
    tone: /something breaks/i.test(stage.title) ? BREAKS : PALETTE[i % PALETTE.length]!,
    steps: stage.steps.map(step => ({ name: plain(step.name), icon: step.icon }))
  }))
}

/** A lane by its title, so a film names the lanes it uses rather than counting them. */
export function laneNamed(lanes: Lane[], title: string): Lane {
  const lane = lanes.find(l => l.title === title)

  if (!lane) throw new Error(`No lane called ${title}`)

  return lane
}

/** A step's index in its lane, by name; the first match from `from`. */
export function stepNamed(lane: Lane, name: string, from = 0): number {
  const i = lane.steps.findIndex((s, j) => j >= from && s.name === name)

  if (i < 0) throw new Error(`No step called ${name} in ${lane.title}`)

  return i
}
