'use client'

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject
} from 'react'

import Image from 'next/image'
import { animate, type AnimationPlaybackControls } from 'motion/react'

import type { CaseStudyMetadata } from '@/lib/case-studies'
import { LazyCaseStudyModal } from '@/components/landing/lazy-case-study-modal'
import { workLabel } from '@/components/landing/projects-section'
import { snappySpring, useInView, usePrefersReducedMotion } from '@/components/landing/motion'
import { orderWork, WORK_TONES } from '@/lib/work-views'
import { ToolMark } from '@/components/landing/tool-stack-section'
import { toolNamed } from '@/lib/portfolio'

/** Pixels a press has to travel before it is a drag rather than a click. */
const DRAG_THRESHOLD = 6

/** How far a release carries: seconds of the release velocity, before snapping. */
const GLIDE = 0.3

/** A release after the pointer has rested this long (ms) carries no velocity. */
const REST = 80

type Drag = {
  pointer: number
  startX: number
  startScroll: number
  lastX: number
  lastTime: number

  /** Pointer speed in px/s, positive to the right. */
  velocity: number
  moved: boolean
}

/** Where the row can come to rest: each thumbnail at the start edge, and the very end. */
function snapPoints(list: HTMLElement) {
  const box = list.getBoundingClientRect()
  const inset = parseFloat(getComputedStyle(list).scrollPaddingLeft) || 0
  const end = list.scrollWidth - list.clientWidth

  return [
    ...Array.from(list.children, item =>
      Math.min(end, Math.max(0, list.scrollLeft + item.getBoundingClientRect().left - box.left - inset))
    ),
    end
  ]
}

/**
 * Mouse drag for a row that already scrolls natively.
 *
 * The row stays a real `overflow-x: auto` scroller, so touch, trackpads, the
 * keyboard and focus all keep the scrolling they had. Only a mouse press is
 * taken over: the row follows the pointer, then glides on the release
 * velocity and settles on the nearest thumbnail with the `snappy` spring. CSS
 * snapping is switched off while that happens (`data-dragging`), since it
 * would fight every frame, and handed back once the row is already resting on
 * a snap point, so it has nothing left to move. A drag never reads as a click
 * on the thumbnail it ends over.
 */
function useDragScroll(listRef: RefObject<HTMLUListElement | null>, reduced: boolean) {
  const drag = useRef<Drag | null>(null)
  const glide = useRef<AnimationPlaybackControls | null>(null)
  const swallowClick = useRef(false)
  const [draggable, setDraggable] = useState(false)

  // Only offer the grab cursor when there is somewhere to drag to.
  useEffect(() => {
    const list = listRef.current

    if (!list) return

    const measure = () => setDraggable(list.scrollWidth > list.clientWidth + 1)
    const observer = new ResizeObserver(measure)

    observer.observe(list)
    measure()

    return () => {
      observer.disconnect()
      glide.current?.stop()
    }
  }, [listRef])

  const settle = (list: HTMLUListElement, velocity: number) => {
    const projected = list.scrollLeft - velocity * GLIDE

    const target = snapPoints(list).reduce((best, point) =>
      Math.abs(point - projected) < Math.abs(best - projected) ? point : best
    )

    const release = () => {
      glide.current = null
      delete list.dataset.dragging
    }

    // Already there: most often a fling into either end, where the browser has
    // clamped the scroll. A spring would only play the leftover velocity out
    // past the edge, invisibly, with snapping held off until it finished.
    if (reduced || Math.abs(target - list.scrollLeft) < 1) {
      list.scrollLeft = target
      release()

      return
    }

    glide.current = animate(list.scrollLeft, target, {
      ...snappySpring,
      velocity: -velocity,
      onUpdate: value => {
        list.scrollLeft = value
      },
      onComplete: release
    })
  }

  const onPointerDown = (event: PointerEvent<HTMLUListElement>) => {
    swallowClick.current = false

    if (event.pointerType !== 'mouse' || event.button !== 0 || !draggable) return

    // Catching the row mid-glide stops it where it is. If this press turns out
    // to be a click, snapping has to come back now; a new drag sets it aside again.
    if (glide.current) {
      glide.current.stop()
      glide.current = null
      delete event.currentTarget.dataset.dragging
    }

    drag.current = {
      pointer: event.pointerId,
      startX: event.clientX,
      startScroll: event.currentTarget.scrollLeft,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      moved: false
    }
  }

  const onPointerMove = (event: PointerEvent<HTMLUListElement>) => {
    const state = drag.current
    const list = event.currentTarget

    if (!state || state.pointer !== event.pointerId) return

    if (!state.moved) {
      if (Math.abs(event.clientX - state.startX) < DRAG_THRESHOLD) return

      // Captured only once it is a drag, so a plain click still lands on its button.
      state.moved = true
      list.setPointerCapture(event.pointerId)
      list.dataset.dragging = ''
      window.getSelection()?.removeAllRanges()
    }

    const elapsed = event.timeStamp - state.lastTime

    if (elapsed > 0) {
      const instant = ((event.clientX - state.lastX) / elapsed) * 1000

      state.velocity = state.velocity * 0.6 + instant * 0.4
    }

    state.lastX = event.clientX
    state.lastTime = event.timeStamp
    list.scrollLeft = state.startScroll - (event.clientX - state.startX)
  }

  const onPointerEnd = (event: PointerEvent<HTMLUListElement>) => {
    const state = drag.current

    if (!state || state.pointer !== event.pointerId) return

    drag.current = null

    if (!state.moved) return

    swallowClick.current = true
    settle(event.currentTarget, event.timeStamp - state.lastTime > REST ? 0 : state.velocity)
  }

  const onClickCapture = (event: MouseEvent<HTMLUListElement>) => {
    if (!swallowClick.current) return

    swallowClick.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  return {
    draggable,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onClickCapture
    }
  }
}

/** Left and right arrows walk the thumbnails; focusing one scrolls it into view. */
function stepFocus(event: KeyboardEvent<HTMLUListElement>) {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return

  const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('.work-strip-item'))
  const current = items.indexOf(event.target as HTMLButtonElement)

  if (current === -1) return

  const next = items[current + (event.key === 'ArrowRight' ? 1 : -1)]

  if (!next) return

  event.preventDefault()
  next.focus()
}

/**
 * The work, one scroll below the promise.
 *
 * Selected Work sits about ten screens down, behind the story and the
 * biography, so a visitor deciding in the first few seconds never met a single
 * project. This strip shows every system as a thumbnail of its real build and
 * opens the same dialog the full cards do, so nothing here is a second,
 * thinner version of the case study. The full section keeps its place; the
 * strip only points at it.
 */
export function WorkStrip({ caseStudies }: { caseStudies: CaseStudyMetadata[] }) {
  const { ref, inView } = useInView<HTMLUListElement>(0.2)
  const reduced = usePrefersReducedMotion()
  const [selected, setSelected] = useState<CaseStudyMetadata | null>(null)
  const shown = orderWork(caseStudies)
  const { draggable, handlers } = useDragScroll(ref, reduced)

  return (
    <section aria-labelledby='work-strip-title' className='work-strip'>
      <div className='work-strip-inner mx-auto max-w-390 px-6 md:px-12 lg:px-20 2xl:max-w-440'>
        <div className='work-strip-head'>
          <p id='work-strip-title' className='eyebrow'>
            Selected work
          </p>
          <a href='#portfolio' className='work-strip-all'>
            See all {shown.length} systems
          </a>
        </div>

        <ul
          ref={ref}
          className='work-strip-list'
          data-visible={inView}
          data-draggable={draggable}
          onKeyDown={stepFocus}
          onDragStart={event => event.preventDefault()}
          {...handlers}
        >
          {shown.map((cs, index) => (
            <li
              key={cs.slug}
              style={
                {
                  '--work-tone': WORK_TONES[cs.slug] ?? 'var(--accent)',
                  '--strip-delay': reduced ? '0ms' : `${index * 60}ms`
                } as CSSProperties
              }
            >
              <button type='button' className='work-strip-item' aria-haspopup='dialog' onClick={() => setSelected(cs)}>
                <span className='work-strip-thumb'>
                  {cs.platform && (
                    <span className='work-strip-platform'>
                      <ToolMark tool={toolNamed(cs.platform)} size={11} />
                      {cs.platform}
                    </span>
                  )}
                  {/* Shown at about 170px (240px on the widest screens); the
                      source is up to 1,700px wide, so it is resized to fit. */}
                  {(cs.heroImage ?? cs.image) && (
                    <Image
                      src={(cs.heroImage ?? cs.image)!}
                      alt=''
                      width={1176}
                      height={735}
                      sizes='(min-width: 1536px) 240px, 180px'
                      draggable={false}
                    />
                  )}
                </span>
                <span className='work-strip-label'>{workLabel(cs)}</span>
                {cs.keyOutcome && (
                  <span className='work-strip-outcome'>
                    <strong>{cs.keyOutcome.value}</strong> {cs.keyOutcome.label}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <LazyCaseStudyModal key={selected?.slug ?? 'closed'} study={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
