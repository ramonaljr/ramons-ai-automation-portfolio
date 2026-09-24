'use client'

import { useRef, useState, type MouseEvent, type ReactNode } from 'react'

import { motion } from 'motion/react'

import type { WorkView } from '@/lib/work-views'

/**
 * A project's views with round thumbnails over the bottom of the frame.
 *
 * Choosing a thumbnail grows the new view out of that thumbnail as an
 * expanding circle, over the view it replaces. The pattern comes from a GSAP
 * gallery; it is rebuilt here on Motion and a CSS `clip-path`, so it needs no
 * extra library, works on the live canvas as well as on images, and does
 * nothing at all for readers who asked for reduced motion. There is no
 * autoplay: on a grid of six cards, views changing on their own would pull
 * the eye away from whatever the reader is looking at.
 *
 * Renders into an existing frame (the caller owns size, entrance and the
 * magnifying lens), so it returns layers and tabs rather than a wrapper.
 */
export function ViewStage({
  views,
  index,
  onSelect,
  renderView,
  reduced,
  label
}: {
  views: WorkView[]
  index: number
  onSelect: (index: number) => void
  renderView: (view: WorkView) => ReactNode
  reduced: boolean
  label: string
}) {
  const tabsRef = useRef<HTMLDivElement>(null)

  /**
   * The view being covered while the next one grows over it, and the point
   * the circle grows from. Derived from `index` during render rather than
   * from an effect, so the first frame of a switch already has both layers.
   */
  const [shown, setShown] = useState(index)
  const [leaving, setLeaving] = useState<number | null>(null)
  const [origin, setOrigin] = useState('50% 100%')

  if (index !== shown) {
    setLeaving(reduced ? null : shown)
    setShown(index)
  }

  const current = views[Math.min(shown, views.length - 1)]
  const previous = leaving === null ? null : views[leaving]

  const choose = (event: MouseEvent<HTMLButtonElement>, next: number) => {
    // Stop the card underneath treating the tap as "open the case study".
    event.stopPropagation()
    if (next === index) return

    const frame = tabsRef.current?.parentElement?.getBoundingClientRect()
    const tab = event.currentTarget.getBoundingClientRect()

    if (frame) {
      setOrigin(`${tab.left + tab.width / 2 - frame.left}px ${tab.top + tab.height / 2 - frame.top}px`)
    }

    onSelect(next)
  }

  return (
    <>
      {/* One keyed list, incoming first. Keyed by view, so the view being
          covered is the same mounted element it was a moment ago (a live
          canvas does not restart from blank mid-transition), and incoming
          first so anything looking for "the picture in this frame" (the lens)
          finds the new view. */}
      {[current, previous].map((item, layer) =>
        item && (layer === 0 || item.key !== current?.key) ? (
          <motion.div
            key={item.key}
            className='view-stage-layer'
            style={{ zIndex: layer === 0 ? 2 : 1 }}
            aria-hidden={layer === 0 ? undefined : true}
            initial={previous ? { clipPath: `circle(0% at ${origin})` } : false}
            animate={{ clipPath: `circle(150% at ${origin})` }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={layer === 0 ? () => setLeaving(null) : undefined}
          >
            {renderView(item)}
          </motion.div>
        ) : null
      )}

      {views.length > 1 && (
        <div ref={tabsRef} className='view-tabs' role='group' aria-label={`Views of ${label}`}>
          {views.map((item, itemIndex) => (
            <button
              key={item.key}
              type='button'
              className='view-tab'
              data-view={item.key}
              aria-pressed={itemIndex === index}
              aria-label={`Show ${item.label}`}
              onClick={event => choose(event, itemIndex)}
            >
              {/* The thumbnail is the label; the name is for screen readers. */}
              <img src={item.src} alt='' aria-hidden='true' width={96} height={96} loading='lazy' />
            </button>
          ))}
        </div>
      )}
    </>
  )
}
