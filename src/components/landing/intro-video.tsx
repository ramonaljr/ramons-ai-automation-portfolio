'use client'

import { useEffect, useRef } from 'react'

import { createPortal } from 'react-dom'

import { X } from 'lucide-react'

import { ICON_STROKE } from '@/components/landing/motion'
import { PROFILE } from '@/lib/portfolio'

/**
 * The intro video in a pop-up over the page.
 *
 * The player is a third-party iframe, so it is only mounted while the dialog
 * is open: nobody downloads Loom's (or YouTube's) scripts until they ask for
 * the video, and closing the dialog stops playback by removing it.
 *
 * Portalled to `document.body` for the same reason as the case-study modal:
 * the About section sits inside `.blossom-story-root`, whose stacking context
 * would otherwise put the fixed nav above the dialog.
 */
export function IntroVideoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)

  /** When the player finished loading, to tell its own focus grab from a click. */
  const loadedAt = useRef(0)

  /**
   * Scroll lock, Escape, and focus. The only stops are the close button and
   * the player, so Tab simply alternates between them; focus goes back to the
   * play button on close.
   *
   * Loom focuses its player about half a second after loading. Keys pressed
   * inside a cross-origin iframe never reach this page, so Escape stopped
   * working the moment the video started. Focus that moves into the player
   * shortly after load is taken back; a later click into it is left alone, so
   * the player's own keyboard controls still work once someone uses them.
   */
  useEffect(() => {
    if (!open) return

    const opener = document.activeElement as HTMLElement | null

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()

        return
      }

      if (e.key !== 'Tab') return

      const panel = panelRef.current

      if (!panel) return

      const stops = [...panel.querySelectorAll<HTMLElement>('button, iframe')]
      const first = stops[0]
      const last = stops[stops.length - 1]

      if (!panel.contains(document.activeElement)) {
        e.preventDefault()
        first?.focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }

    const handleBlur = () => {
      if (!loadedAt.current || performance.now() - loadedAt.current > 2000) return

      // The blur fires before the iframe becomes active; check on the next frame.
      requestAnimationFrame(() => {
        if (document.activeElement?.tagName === 'IFRAME') panelRef.current?.focus()
      })
    }

    const prevOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    loadedAt.current = 0
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('blur', handleBlur)
    panelRef.current?.focus()

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('blur', handleBlur)
      opener?.focus?.()
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className='bg-ink/70 animate-in fade-in fixed inset-0 z-[200] flex items-center justify-center p-3 backdrop-blur-sm duration-200 sm:p-6 md:p-10'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-label={`Intro video: ${PROFILE.name}`}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className='animate-in zoom-in-95 relative w-full max-w-[960px] duration-200 focus:outline-none'
        onClick={e => e.stopPropagation()}
      >
        <button
          type='button'
          onClick={onClose}
          aria-label='Close video'
          className='bg-surface-raised/90 text-ink hover:bg-surface-raised border-rule absolute -top-12 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border shadow-sm transition-colors'
        >
          <X size={18} strokeWidth={ICON_STROKE} aria-hidden='true' />
        </button>

        <div className='aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl'>
          <iframe
            src={PROFILE.introVideo.src}
            title={`Intro video: ${PROFILE.name}, ${PROFILE.title}`}
            allow='autoplay; fullscreen; picture-in-picture'
            allowFullScreen
            onLoad={() => (loadedAt.current = performance.now())}
            className='h-full w-full border-0'
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
