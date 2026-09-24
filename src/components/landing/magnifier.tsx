'use client'

import { useRef, type PointerEvent, type RefObject } from 'react'

/** Lens radius in CSS pixels, and how much it enlarges what is under it. Match `.work-lens` in globals.css. */
const LENS_RADIUS = 92
const LENS_ZOOM = 2.4

/** What the lens can magnify inside a frame: a running canvas, its fallback image, or any image. */
const SOURCES = '.work-canvas, .work-canvas-fallback, img'

/**
 * A magnifying lens over a picture: the Selected Work cards and the case study
 * dialog, anywhere a view has a thumbnail strip beside it.
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
export function useMagnifier() {
  const frameRef = useRef<HTMLDivElement>(null)
  const lensRef = useRef<HTMLDivElement>(null)
  const artRef = useRef<HTMLDivElement>(null)
  const sourceRef = useRef<Element | null>(null)

  const hide = () => {
    if (lensRef.current) lensRef.current.dataset.on = 'false'
  }

  const move = (event: PointerEvent<HTMLElement>) => {
    const frame = frameRef.current
    const lens = lensRef.current
    const art = artRef.current

    if (!frame || !lens || !art || event.pointerType !== 'mouse') return

    const box = frame.getBoundingClientRect()
    const x = event.clientX - box.left
    const y = event.clientY - box.top

    // Off the frame, or over the view thumbnails, which need to be seen to be picked.
    const overTabs = event.target instanceof Element && event.target.closest('.view-tabs')

    if (x < 0 || y < 0 || x > box.width || y > box.height || overTabs) {
      hide()

      return
    }

    // The lens's own clone and the thumbnails match the selector too; skip them.
    const source = [...frame.querySelectorAll(SOURCES)].find(el => !lens.contains(el) && !el.closest('.view-tabs'))

    // Re-cloned whenever the frame switches view (a thumbnail click swaps it).
    if (source && source !== sourceRef.current) {
      const copy = source.cloneNode(true) as HTMLElement
      const canvas = copy.classList.contains('work-canvas')

      // Always the finished drawing, whatever point the live run is at.
      if (canvas) copy.dataset.run = 'static'
      lens.dataset.dark = String(canvas)
      art.replaceChildren(copy)
      sourceRef.current = source
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
