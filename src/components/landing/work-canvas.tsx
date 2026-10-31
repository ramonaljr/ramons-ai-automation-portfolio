'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

/**
 * A process map that draws itself.
 *
 * The canvases are hand-built SVGs with a stable grammar: each stage is a `<g>`
 * whose first shape is a full-width pale band, steps are `<g filter>` tiles,
 * edges are paths stroked #6366f1, and a completed step can carry a checkmark
 * path stroked #16a34a. Inlined rather than shown as an `<img>`, that grammar
 * lets the map be drawn the way a process is mapped — each stage's lane sweeps
 * in with its label, its steps are pinned onto it one by one, and the
 * connectors are drawn between them — rather than simply appearing.
 *
 * Nothing here knows about any particular workflow. Order comes from each
 * element's horizontal position, so a new canvas animates correctly the moment
 * its SVG lands in /public, as long as it keeps the same three strokes.
 *
 * A canvas can also set its own pace: `data-t` (0 to 1) on an element places
 * it in the run directly, for drawings that do not read left to right, such as
 * a process map that wraps onto a second row and lights up its numbered step
 * cards underneath; `data-span` on the <svg> sets the run's length in seconds.
 */

const EDGE = '#6366f1'
const CHECK = '#16a34a'

/** Header text (title and platform line) sits above this and stays still. */
const HEADER_LINE = 110

/** Connectors shorter than this (in drawing units) are arrowheads: no dot rides them. */
const MIN_COMET = 20

const requests = new Map<string, Promise<string>>()

/** Cached per URL, so the card and the dialog share one request. */
function loadSvg(src: string) {
  let pending = requests.get(src)

  if (!pending) {
    pending = fetch(src).then(response => {
      if (!response.ok) throw new Error(`${response.status} for ${src}`)

      return response.text()
    })
    requests.set(src, pending)
  }

  return pending
}

/**
 * A stage's lane: a band at least 40% of the drawing wide in a pale fill. The
 * width rules out step tiles, the fill rules out the maps' dark footer bar.
 */
function isLane(width: number, fill: string, viewWidth: number) {
  const hex = fill.match(/^#([0-9a-f]{6})$/i)?.[1]

  if (!hex || viewWidth <= 0 || width < viewWidth * 0.4) return false

  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16))

  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.6
}

type Role = 'lane' | 'step' | 'edge' | 'link' | 'check' | 'node' | 'comet' | 'comet-halo'

function roleOf(el: Element, viewWidth: number): Role {
  const tag = el.tagName.toLowerCase()

  if (tag === 'path') {
    const stroke = el.getAttribute('stroke')?.toLowerCase()

    if (stroke === EDGE) return 'edge'
    if (stroke === CHECK) return 'check'

    // The larger maps draw their connectors in a neutral grey of their own.
    return el.getAttribute('fill') === 'none' && stroke ? 'link' : 'node'
  }

  if (tag === 'g') {
    const first = el.firstElementChild

    if (
      first?.tagName.toLowerCase() === 'rect' &&
      isLane(Number(first.getAttribute('width') ?? 0), first.getAttribute('fill') ?? '', viewWidth)
    ) {
      return 'lane'
    }

    if (el.hasAttribute('filter') || el.querySelector(':scope > g[filter]')) return 'step'
  }

  return 'node'
}

const escapeAttr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/**
 * Every canvas defines the same `#sh` shadow and `#dots` pattern, and the same
 * canvas is inlined twice when its dialog opens, so ids are namespaced per
 * instance. The fixed width and height go so the drawing scales to its frame.
 */
function prepare(markup: string, suffix: string, label: string) {
  return markup
    .replace(/\sid="([^"]+)"/g, ` id="$1-${suffix}"`)
    .replace(/url\(#([^)]+)\)/g, `url(#$1-${suffix})`)
    .replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1')
    .replace(/<svg([^>]*?)\sheight="[^"]*"/, '<svg$1')
    .replace(/<svg([^>]*?)\saria-label="[^"]*"/, `<svg$1 aria-label="${escapeAttr(label)}"`)
}

/**
 * Tags each drawn element with its role and its place in the run (`--t`, 0 at
 * the leftmost element, 1 at the rightmost). The first two rects are the ground
 * and its dot grid, and the header text is furniture, so none of those move.
 */
function choreograph(svg: SVGSVGElement) {
  const span = svg.getAttribute('data-span')

  if (span) svg.closest<HTMLElement>('.work-canvas')?.style.setProperty('--wc-span', `${span}s`)

  const drawn = [...svg.children].filter(el => el.tagName.toLowerCase() !== 'defs').slice(2)

  const stage = drawn.filter(
    el => !(el.tagName.toLowerCase() === 'text' && Number(el.getAttribute('y')) < HEADER_LINE)
  ) as SVGGraphicsElement[]

  if (stage.length === 0) return

  const lefts = stage.map(el => el.getBBox().x)
  const first = Math.min(...lefts)
  const range = Math.max(1, Math.max(...lefts) - first)
  const viewWidth = svg.viewBox.baseVal?.width ?? 0

  stage.forEach((el, index) => {
    const role = roleOf(el, viewWidth)

    el.setAttribute('data-wc', role)

    // A normalised length lets one dash rule draw every connector, whatever its size.
    if (role === 'edge' || role === 'link') el.setAttribute('pathLength', '1')

    const placed = el.getAttribute('data-t')

    el.style.setProperty('--t', placed ?? ((lefts[index] - first) / range).toFixed(3))

    // A step lights in its own stage colour, read from its numbered badge.
    if (role === 'step') {
      const badge = [...el.querySelectorAll('circle')].find(c =>
        /^#(?!f{3}\b|f{6}\b)[0-9a-f]{3,6}$/i.test(c.getAttribute('fill') ?? '')
      )

      if (badge) {
        el.style.setProperty('--wc-stage', badge.getAttribute('fill'))

        // Only numbered stages take part in the trace; a tool chip drawn as
        // its own tile would otherwise flash in the fallback tone.
        el.setAttribute('data-wc-stage', '')
      }
    }

    // A bright dot rides the head of each connector as it is drawn: a copy of
    // the line carrying one short dash, timed with the line it sits on, plus
    // a wider, fainter copy under it for the glow. Arrowheads are skipped.
    if ((role === 'edge' || role === 'link') && (el as unknown as SVGPathElement).getTotalLength() > MIN_COMET) {
      for (const kind of ['comet', 'comet-halo'] as const) {
        const comet = el.cloneNode(false) as SVGPathElement

        comet.removeAttribute('marker-start')
        comet.removeAttribute('marker-end')
        comet.setAttribute('data-wc', kind)
        el.after(comet)
      }
    }
  })
}

export function WorkCanvas({
  src,
  label,
  idSuffix,
  run,
  reduced,
  lead = 0,
  rest = 'idle',
  trace = false
}: {
  src: string
  label: string

  /** Unique per instance on the page — the card and its dialog both inline the same file. */
  idSuffix: string

  /** 0 holds the canvas empty; every change to a positive value plays the run again. */
  run: number
  reduced: boolean

  /** Seconds before the first run starts, so it can follow an entrance. Replays start at once. */
  lead?: number

  /**
   * What `run` 0 shows: 'idle' holds the canvas empty until the first run,
   * 'static' shows the finished drawing and only plays when asked.
   */
  rest?: 'idle' | 'static'

  /**
   * While `run` is 0, true traces the finished drawing once: the connectors
   * draw in step order and each tile's outline lights as it is reached. The
   * tiles never leave, so a card scrolled past mid-trace is never blank.
   */
  trace?: boolean
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const artRef = useRef<HTMLDivElement>(null)
  const [markup, setMarkup] = useState<string | null>(null)

  useEffect(() => {
    let live = true

    loadSvg(src)
      .then(text => {
        if (live) setMarkup(prepare(text, idSuffix, label))
      })
      .catch(() => {
        // An empty string drops back to the plain image below.
        if (live) setMarkup('')
      })

    return () => {
      live = false
    }
  }, [src, idSuffix, label])

  /**
   * The SVG is injected here rather than rendered through React.
   *
   * `dangerouslySetInnerHTML` was tried first and lost every run: its
   * `{ __html }` object is new on each render, so React re-set `innerHTML` on
   * every hover and handed back a fresh, untagged SVG — the run fired, and
   * nothing in the drawing knew it was part of one. React owns an empty
   * container instead, and this effect owns what is inside it.
   *
   * Injecting and tagging in one step, before paint, also means the finished
   * drawing never flashes up for a frame ahead of being hidden and played. It
   * is declared before the run effect, so a run already due when the markup
   * lands finds everything tagged.
   *
   * Trusted input: a static file from this site's own /public.
   */
  useLayoutEffect(() => {
    const art = artRef.current

    if (!art || !markup) return

    art.innerHTML = markup

    const svg = art.querySelector('svg')

    if (svg) choreograph(svg)
  }, [markup])

  // `data-run` belongs to this effect alone. React never renders it, so a
  // re-render cannot reset a run that is mid-flight.
  useLayoutEffect(() => {
    const host = hostRef.current

    if (!host || !markup) return

    if (reduced) {
      host.dataset.run = 'static'

      return
    }

    if (run === 0) {
      host.dataset.run = trace ? 'trace' : rest

      return
    }

    host.style.setProperty('--wc-lead', `${run === 1 ? lead : 0}s`)

    // Back to the empty state, flush it, then play: restarting a CSS animation
    // needs the browser to see the element without it for one style pass.
    host.dataset.run = 'idle'
    void host.offsetWidth
    host.dataset.run = 'go'
  }, [run, markup, reduced, lead, rest, trace])

  // A summary drawing shows fewer tiles than the build has nodes, so it can
  // carry the real count on its root as `data-nodes`.
  const nodeCount = markup
    ? Number(markup.match(/<svg[^>]*\sdata-nodes="(\d+)"/)?.[1] ?? 0) || (markup.match(/<g filter=/g) ?? []).length
    : 0

  if (markup === '') {
    return <img src={src} alt={label} className='work-canvas-fallback' />
  }

  return (
    <div ref={hostRef} className='work-canvas'>
      <div ref={artRef} className='work-canvas-art' />

      {nodeCount > 0 && (
        <span className='work-canvas-status' aria-hidden='true' style={{ '--wc-nodes': nodeCount } as CSSProperties}>
          <span className='wc-running'>
            <i /> MAPPING
          </span>
          <span className='wc-done'>
            <b>✓</b> {nodeCount} STEPS MAPPED
          </span>
        </span>
      )}
    </div>
  )
}
