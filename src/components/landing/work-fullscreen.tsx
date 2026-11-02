'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { createPortal } from 'react-dom'

import type { WorkView } from '@/lib/work-views'
import { Ico, P } from '@/components/landing/work-icons'
import { MagnifierLens, useMagnifier } from '@/components/landing/magnifier'
import { ViewStage } from '@/components/landing/view-stage'

/**
 * A project's views fitted to the whole window, over the case study dialog.
 *
 * The dialog has to leave room for its header and footer, so a wide n8n build
 * never gets much past 850px in it. This shows the same views, with the same
 * thumbnails and lens, at the size of the window. The view picked here is the
 * dialog's own, so closing returns to whichever one was last shown.
 *
 * An overlay rather than the Fullscreen API: iPhone Safari only takes a video
 * full screen, so the overlay is the one version that behaves the same
 * everywhere.
 */
export function WorkFullscreen({
  views,
  index,
  onSelect,
  renderView,
  reduced,
  label,
  onClose
}: {
  views: WorkView[]
  index: number
  onSelect: (index: number) => void
  renderView: (view: WorkView) => ReactNode
  reduced: boolean
  label: string
  onClose: () => void
}) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const { frameRef, lensRef, artRef, move: moveLens, hide: hideLens } = useMagnifier()

  /**
   * Escape and Tab belong to this layer while it is open. The dialog listens on
   * the window in the bubble phase, so catching both in the capture phase and
   * stopping them there keeps Escape from closing the dialog underneath, and
   * keeps Tab from being pulled back into a panel the reader cannot see.
   */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' && e.key !== 'Tab') return

      e.stopPropagation()

      if (e.key === 'Escape') {
        onClose()

        return
      }

      const stops = [...(overlayRef.current?.querySelectorAll<HTMLElement>('button') ?? [])]

      if (stops.length === 0) return

      const at = stops.indexOf(document.activeElement as HTMLElement)
      const next = e.shiftKey ? (at <= 0 ? stops.length - 1 : at - 1) : at === stops.length - 1 ? 0 : at + 1

      e.preventDefault()
      stops[next].focus()
    }

    window.addEventListener('keydown', handleKeyDown, true)
    closeRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      opener?.focus?.()
    }
  }, [onClose])

  return createPortal(
    <div
      ref={overlayRef}
      className='work-fullscreen animate-in fade-in duration-200'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-label={`${label}, full screen`}
    >
      <button
        ref={closeRef}
        type='button'
        className='work-fullscreen-close'
        onClick={onClose}
        aria-label='Exit full screen'
      >
        <Ico d={P.close} size={16} />
      </button>

      <div
        ref={frameRef}
        className='work-magnify work-fullscreen-frame relative overflow-hidden rounded-xl'
        onClick={e => e.stopPropagation()}
        onPointerMove={moveLens}
        onPointerLeave={hideLens}
      >
        <ViewStage
          views={views}
          index={index}
          onSelect={onSelect}
          reduced={reduced}
          label={label}
          renderView={renderView}
        />

        <MagnifierLens lensRef={lensRef} artRef={artRef} />
      </div>
    </div>,
    document.body
  )
}
