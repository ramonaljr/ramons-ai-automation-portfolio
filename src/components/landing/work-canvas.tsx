'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

/**
 * A workflow canvas that runs.
 *
 * The six canvases are hand-built SVGs with a stable grammar: nodes are
 * `<g filter>` cards, edges are paths stroked #6366f1, and each completed node
 * carries a checkmark path stroked #16a34a. Inlined rather than shown as an
 * `<img>`, that grammar lets the canvas execute — edges draw left to right,
 * nodes arrive as the run reaches them, checkmarks tick behind — which is the
 * one thing a screenshot of a workflow cannot show: that it goes.
 *
 * Nothing here knows about any particular workflow. Order comes from each
 * element's horizontal position, so a new canvas animates correctly the moment
 * its SVG lands in /public, as long as it keeps the same three strokes.
 */

const EDGE = '#6366f1'
const CHECK = '#16a34a'

/** Header text (title and platform line) sits above this and stays still. */
const HEADER_LINE = 110

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
  const drawn = [...svg.children].filter(el => el.tagName.toLowerCase() !== 'defs').slice(2)

  const stage = drawn.filter(
    el => !(el.tagName.toLowerCase() === 'text' && Number(el.getAttribute('y')) < HEADER_LINE)
  ) as SVGGraphicsElement[]

  if (stage.length === 0) return

  const lefts = stage.map(el => el.getBBox().x)
  const first = Math.min(...lefts)
  const span = Math.max(1, Math.max(...lefts) - first)

  stage.forEach((el, index) => {
    const tag = el.tagName.toLowerCase()
    const stroke = el.getAttribute('stroke')?.toLowerCase()
    const role = tag === 'path' && stroke === EDGE ? 'edge' : tag === 'path' && stroke === CHECK ? 'check' : 'node'

    el.setAttribute('data-wc', role)

    // A normalised length lets one dash rule draw every edge, whatever its size.
    if (role === 'edge') el.setAttribute('pathLength', '1')

    el.style.setProperty('--t', ((lefts[index] - first) / span).toFixed(3))
  })
}

export function WorkCanvas({
  src,
  label,
  idSuffix,
  run,
  reduced,
  lead = 0
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
      host.dataset.run = 'idle'

      return
    }

    host.style.setProperty('--wc-lead', `${run === 1 ? lead : 0}s`)

    // Back to the empty state, flush it, then play: restarting a CSS animation
    // needs the browser to see the element without it for one style pass.
    host.dataset.run = 'idle'
    void host.offsetWidth
    host.dataset.run = 'go'
  }, [run, markup, reduced, lead])

  const nodeCount = markup ? (markup.match(/<g filter=/g) ?? []).length : 0

  if (markup === '') {
    return <img src={src} alt={label} className='work-canvas-fallback' />
  }

  return (
    <div ref={hostRef} className='work-canvas'>
      <div ref={artRef} className='work-canvas-art' />

      {nodeCount > 0 && (
        <span className='work-canvas-status' aria-hidden='true' style={{ '--wc-nodes': nodeCount } as CSSProperties}>
          <span className='wc-running'>
            <i /> RUNNING
          </span>
          <span className='wc-done'>
            <b>✓</b> {nodeCount} NODES OK
          </span>
        </span>
      )}
    </div>
  )
}
