'use client'

import { Fragment, useRef, useState, useSyncExternalStore } from 'react'

import { gsap, useGSAP } from '@/components/landing/gsap'
import { usePrefersReducedMotion } from '@/components/landing/motion'
import { BrandMark } from '@/components/landing/brand-mark'

import { PROFILE } from '@/lib/portfolio'

/** Below this the intro never plays. Match `.intro-overlay` in globals.css. */
const PHONE = '(max-width: 767px)'

/**
 * Once per tab. Written when the intro finishes, not when it starts, so a
 * re-render mid-intro (the page re-renders when the hero is released) never
 * reads "seen" and unmounts the overlay halfway through its glide.
 */
const SEEN_KEY = 'rv-intro-seen'

/**
 * Runs while the HTML is still parsing, before the overlay's panel exists, so
 * a returning visitor never sees the panel flash in and out while the page
 * hydrates. `[data-intro-seen] .intro-overlay` hides it in globals.css.
 */
const SEEN_SCRIPT = `try{if(sessionStorage.getItem('${SEEN_KEY}')==='1')document.documentElement.setAttribute('data-intro-seen','')}catch(e){}`

/** Input that hurries the intro along rather than making anyone sit through it. */
const SKIP_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const

const readSeen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

const markSeen = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Storage blocked: the intro simply plays again next time.
  }
}

const noSubscribe = () => () => {}

/**
 * The opening: the monogram draws itself, the name rises from behind its own
 * edge over a terracotta hairline, then mark and name glide into the nav logo
 * while the panel lifts off the hero. The nav's brand is the same mark and the
 * same name at a third of the size, so the lockup lands on it and hands over.
 *
 * The lockup is sized at exactly three times the nav brand (mark, gap and
 * type), so one uniform scale takes it onto the nav without the name drifting
 * against the mark on the way.
 */
export function IntroAnimation({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  // The server and the hydrating client both say "not seen", so the markup
  // matches; the real value arrives on the next render. A client-side return
  // to the homepage reads it straight away and never renders the overlay.
  const seen = useSyncExternalStore(noSubscribe, readSeen, () => false)

  useGSAP(
    () => {
      // Nothing to play. The hero still has to be released.
      if (reducedMotion || seen) {
        onDone()

        return
      }

      // Phones skip the intro (the overlay is hidden in CSS below 768px, so
      // the server-rendered page never shows it). On a mid-range phone the
      // intro plus the wait for JavaScript held the hero back by over three
      // seconds, which was most of the page's Largest Contentful Paint.
      if (window.matchMedia(PHONE).matches) {
        onDone()

        return
      }

      const root = rootRef.current

      if (!root) return

      const panel = root.querySelector('.intro-panel')
      const row = root.querySelector<HTMLElement>('.intro-row')
      const mark = root.querySelector<HTMLElement>('.intro-row-mark')
      const rule = root.querySelector('.intro-rule')
      const words = root.querySelectorAll('.intro-word')

      if (!row || !mark) return

      // Measured when the glide starts, not before: Satoshi may still be
      // swapping in during the first frames, which changes the lockup's width.
      let flip: { x: number; y: number; scale: number } | null = null

      const measure = () => {
        if (flip) return flip

        const target = document.querySelector('.nav-brand-mark')?.getBoundingClientRect()
        const from = row.getBoundingClientRect()
        const m = mark.getBoundingClientRect()

        if (!target || !m.width) return (flip = { x: 0, y: 0, scale: 1 })

        // The row scales from its top-left corner, so the mark's offset inside
        // the row shrinks with it.
        const scale = target.width / m.width

        flip = {
          scale,
          x: target.left - from.left - (m.left - from.left) * scale,
          y: target.top - from.top - (m.top - from.top) * scale
        }

        return flip
      }

      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          markSeen()
          setDone(true)
        }
      })

      // `y: 0` because GSAP reads the CSS starting offset (translateY(110%))
      // as pixels into `y`, and would keep it while tweening `yPercent`.
      tl.fromTo(words, { y: 0, yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.07 }, 0.15)
        .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'expo.inOut' }, 0.35)
        .addLabel('glide', 1.1)
        .to(rule, { scaleX: 0, transformOrigin: '100% 50%', duration: 0.45, ease: 'power3.in' }, 'glide')
        .to(
          row,
          {
            x: () => measure().x,
            y: () => measure().y,
            scale: () => measure().scale,
            duration: 0.9,
            ease: 'expo.inOut'
          },
          'glide'
        )
        .fromTo(
          panel,
          { clipPath: 'inset(0% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.inOut' },
          'glide+=0.05'
        )

        // The hero's own timeline starts while the panel is still lifting, so
        // its headline is already rising when the panel uncovers it.
        .call(onDone, undefined, 'glide+=0.15')

        // Landed on the nav brand, which is identical underneath.
        .to(row, { autoAlpha: 0, duration: 0.2, ease: 'none' })

      const skip = () => {
        if (tl.time() < tl.labels.glide) tl.seek('glide')
        tl.timeScale(2.2)
      }

      SKIP_EVENTS.forEach(type => window.addEventListener(type, skip, { passive: true }))

      return () => SKIP_EVENTS.forEach(type => window.removeEventListener(type, skip))
    },
    { scope: rootRef, dependencies: [reducedMotion, seen], revertOnUpdate: true }
  )

  if (reducedMotion || seen || done) return null

  return (
    <div ref={rootRef} className='intro-overlay pointer-events-none fixed inset-0 z-[100]' aria-hidden='true'>
      <script dangerouslySetInnerHTML={{ __html: SEEN_SCRIPT }} />

      <div className='intro-panel absolute inset-0' />

      <div className='absolute inset-0 flex items-center justify-center px-6'>
        <div className='intro-lockup select-none'>
          <div className='intro-row'>
            <span className='intro-mark intro-row-mark'>
              <BrandMark />
            </span>

            {/* A <p>, not a heading: it is an opening, and the page's real
                H1 is the hero headline. */}
            <p className='intro-name'>
              {PROFILE.name.split(' ').map((word, i) => (
                <Fragment key={word}>
                  {i > 0 && ' '}
                  <span className='intro-word-mask'>
                    <span className='intro-word'>{word}</span>
                  </span>
                </Fragment>
              ))}
            </p>
          </div>

          <span className='intro-rule' />
        </div>
      </div>
    </div>
  )
}
