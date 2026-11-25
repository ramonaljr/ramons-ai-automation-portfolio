'use client'

import type { RefObject } from 'react'

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from '@/components/landing/gsap'

const FOOTER_REVEAL = `(min-width: 1024px) and ${MOTION_OK}`

type RevealMode = 'sticky' | 'parallax'

/**
 * Footer parallax reveal (Details.so section-transition-01 `reveal` mode):
 * - When SiteFooter fits inside the viewport, it sits sticky underneath
 *   `.blossom-story-root` and slides upward as the page clears it.
 * - When the viewport is shorter than SiteFooter, it falls back to a smooth
 *   upward parallax reveal in normal flow so no footer links are ever clipped.
 */
export function FooterReveal({
  coverRef,
  footerRef
}: {
  coverRef: RefObject<HTMLDivElement | null>
  footerRef: RefObject<HTMLDivElement | null>
}) {
  useGSAP(() => {
    const cover = coverRef.current
    const footer = footerRef.current

    if (!cover || !footer) return

    const footerInner = footer.querySelector<HTMLElement>('[data-footer-reveal-inner]')
    const footerScrim = footer.querySelector<HTMLElement>('[data-footer-reveal-scrim]')

    if (!footerInner) return

    let syncMode: (() => void) | null = null

    const mm = gsap.matchMedia()

    mm.add(FOOTER_REVEAL, () => {
      let ctx: gsap.Context | null = null
      let currentMode: RevealMode | null = null

      const sync = () => {
        const height = footer.offsetHeight

        if (height <= 0) return

        const mode: RevealMode = height <= window.innerHeight ? 'sticky' : 'parallax'

        if (mode === currentMode) return

        currentMode = mode
        ctx?.revert()
        ctx = null
        footer.setAttribute('data-reveal-ready', mode)

        ctx = gsap.context(() => {
          if (mode === 'sticky') {
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: cover,
                start: 'bottom bottom',
                end: () => `+=${footer.offsetHeight}`,
                scrub: true,
                invalidateOnRefresh: true
              }
            })

            tl.fromTo(
              footerInner,
              { y: () => Math.min(200, Math.round(footer.offsetHeight * 0.25)) },
              { y: 0, ease: 'none' },
              0
            )

            if (footerScrim) {
              tl.fromTo(footerScrim, { opacity: 0.48 }, { opacity: 0, ease: 'none' }, 0)
            }

            return
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: footer,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
              invalidateOnRefresh: true
            }
          })

          tl.fromTo(
            footerInner,
            { y: () => -Math.min(200, Math.round(window.innerHeight * 0.24)) },
            { y: 0, ease: 'none' },
            0
          )

          if (footerScrim) {
            tl.fromTo(footerScrim, { opacity: 0.45 }, { opacity: 0, ease: 'none' }, 0)
          }
        })
      }

      syncMode = sync
      sync()

      return () => {
        syncMode = null
        ctx?.revert()
        ctx = null
        footer.removeAttribute('data-reveal-ready')
      }
    })

    let refreshTimer = 0

    const scheduleRefresh = () => {
      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => {
        syncMode?.()
        ScrollTrigger.refresh()
      }, 80)
    }

    const resizeObserver = new ResizeObserver(scheduleRefresh)

    resizeObserver.observe(cover)
    resizeObserver.observe(footer)
    window.addEventListener('resize', scheduleRefresh, { passive: true })

    return () => {
      window.clearTimeout(refreshTimer)
      window.removeEventListener('resize', scheduleRefresh)
      resizeObserver.disconnect()
      mm.revert()
    }
  })

  return null
}
