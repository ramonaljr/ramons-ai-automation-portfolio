'use client'

import { useEffect, useRef, type PointerEvent, type RefObject } from 'react'

/** Lens radius in CSS pixels, and how much it enlarges what is under it. Match `.work-lens` in globals.css. */
const LENS_RADIUS = 92
const LENS_ZOOM = 2.4

/** What the lens can magnify inside a frame: a running canvas, its fallback image, or any image. */
const SOURCES = '.work-canvas, .work-canvas-fallback, img'

/**
 * A magnifying lens over a picture: the Selected Work cards, the case study
 * dialog and page, anywhere a view has a thumbnail strip beside it, and the
 * interactive demo's canvas (`live`).
 *
 * The lens holds a clone of whatever the frame is showing, enlarged and
 * shifted so the point under the pointer sits at the lens centre. Cloning
 * keeps the lens identical to the view it magnifies, including the canvas's
 * dark restyle, which a plain background image of the source file would lose.
 *
 * Everything is written straight to the DOM on pointer move: a lens that
 * re-rendered React on every mouse event would drag. Mouse only: touch has no
 * hover, and a tap already has its own job on each surface.
 */
export function useMagnifier({
  source = SOURCES,
  skip = '.view-tabs',
  live = false,
  frame
}: {

  /** What to magnify, the first match in the frame. */
  source?: string

  /** Parts of the frame the lens stays off, so they can be seen and pressed. */
  skip?: string

  /**
   * The source changes while it is shown: the interactive demo lights its
   * steps as a run goes and moves as it is panned or zoomed. The clone is then
   * redrawn whenever the source changes, on the next frame, rather than kept
   * from the first hover. The lens also takes the frame's own ground, since
   * the demo is dark for n8n and light for Make and Zapier.
   */
  live?: boolean

  /** The frame's ref, when its owner already holds one; otherwise the hook makes its own. */
  frame?: RefObject<HTMLDivElement | null>
} = {}) {
  const ownFrame = useRef<HTMLDivElement>(null)
  const frameRef = frame ?? ownFrame
  const lensRef = useRef<HTMLDivElement>(null)
  const artRef = useRef<HTMLDivElement>(null)
  const sourceRef = useRef<Element | null>(null)
  const observerRef = useRef<MutationObserver | null>(null)
  const frameReq = useRef(0)

  useEffect(
    () => () => {
      observerRef.current?.disconnect()
      cancelAnimationFrame(frameReq.current)
    },
    []
  )

  const hide = () => {
    if (lensRef.current) lensRef.current.dataset.on = 'false'
  }

  /** Copies `el` into the lens. */
  const draw = (el: Element) => {
    const lens = lensRef.current
    const art = artRef.current

    if (!lens || !art) return

    const copy = el.cloneNode(true) as HTMLElement
    const canvas = copy.classList.contains('work-canvas')

    // Always the finished drawing, whatever point the live run is at.
    if (canvas) copy.dataset.run = 'static'

    // The demo's camera glides between views; the copy jumps to where it lands.
    delete copy.dataset.glide

    // A dark n8n build screenshot gets the dark backing too, so its letterbox
    // inside the lens is not cream.
    lens.dataset.dark = String(canvas || copy.dataset.tone === 'dark')
    art.replaceChildren(copy)
  }

  /** Watches a live source, redrawing the lens a frame after it changes. */
  const watch = (el: Element) => {
    observerRef.current?.disconnect()
    observerRef.current = new MutationObserver(() => {
      cancelAnimationFrame(frameReq.current)
      frameReq.current = requestAnimationFrame(() => {
        if (lensRef.current?.dataset.on === 'true' && sourceRef.current) draw(sourceRef.current)
      })
    })
    observerRef.current.observe(el, { attributes: true, childList: true, subtree: true, characterData: true })
  }

  const move = (event: PointerEvent<HTMLElement>) => {
    const frame = frameRef.current
    const lens = lensRef.current
    const art = artRef.current

    if (!frame || !lens || !art || event.pointerType !== 'mouse') return

    const box = frame.getBoundingClientRect()
    const x = event.clientX - box.left
    const y = event.clientY - box.top

    // Off the frame, over the controls (thumbnails, the demo's buttons and
    // panels), or with a button held: that is a drag, and the demo pans on it.
    const overSkipped = event.target instanceof Element && event.target.closest(skip)

    if (x < 0 || y < 0 || x > box.width || y > box.height || overSkipped || event.buttons !== 0) {
      hide()

      return
    }

    // The lens's own clone and the controls can match the selector too; skip them.
    const found = [...frame.querySelectorAll(source)].find(el => !lens.contains(el) && !el.closest(skip))
    const wasOff = lens.dataset.on !== 'true'

    // Re-cloned whenever the frame switches view (a thumbnail click swaps it),
    // and for a live source each time the lens comes back on, since it is only
    // kept current while showing.
    if (found && (found !== sourceRef.current || (live && wasOff))) {
      draw(found)
      sourceRef.current = found

      if (live) {
        watch(found)

        const ground = getComputedStyle(frame)

        lens.style.backgroundColor = ground.backgroundColor
        lens.style.backgroundImage = 'none'
      }
    }

    art.style.width = `${box.width}px`
    art.style.height = `${box.height}px`
    art.style.transform = `translate(${LENS_RADIUS - x * LENS_ZOOM}px, ${LENS_RADIUS - y * LENS_ZOOM}px) scale(${LENS_ZOOM})`
    lens.style.transform = `translate(${x - LENS_RADIUS}px, ${y - LENS_RADIUS}px)`
    lens.dataset.on = 'true'
  }

  return { frameRef, lensRef, artRef, move, hide }
}

/** The lens itself. Place it as the last child of the frame `useMagnifier` measures. */
export function MagnifierLens({
  lensRef,
  artRef
}: {
  lensRef: RefObject<HTMLDivElement | null>
  artRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <div ref={lensRef} className='work-lens' data-on='false' aria-hidden='true'>
      <div ref={artRef} className='work-lens-art' />
    </div>
  )
}
