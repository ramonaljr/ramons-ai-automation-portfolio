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
 * reads "seen" and unmounts the glass halfway through clearing.
 */
const SEEN_KEY = 'rv-intro-seen'

/**
 * Runs while the HTML is still parsing, before the glass exists, so a
 * returning visitor never sees it flash in and out while the page hydrates.
 * `[data-intro-seen] .intro-overlay` hides it in globals.css.
 */
const SEEN_SCRIPT = `try{if(sessionStorage.getItem('${SEEN_KEY}')==='1')document.documentElement.setAttribute('data-intro-seen','')}catch(e){}`

/** Input that hurries the intro along rather than making anyone sit through it. */
const SKIP_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const

/** The name with its suffix split off, so the suffix can take the accent. */
const NAME_WORDS = PROFILE.name.split(' ')
const SUFFIX = NAME_WORDS[NAME_WORDS.length - 1]

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
 * The opening is the landing page itself, out of focus. The page sits behind
 * frosted glass like the nav bar's; over it the monogram draws, the brand line
 * and the name rise in the hero's own display type, the workflow bar fills,
 * and then the glass clears and the hero comes into focus where it stands.
 */
export function IntroAnimation({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  // The server and the hydrating client both say "not seen", so the markup
  // matches; the real value arrives on the next render. A client-side return
  // to the homepage reads it straight away and never renders the glass.
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

      // The percentage is written straight to the node rather than through
      // state: a re-render per frame would be sixty renders for one number.
      const percent = rootRef.current?.querySelector('.intro-loading-percent')
      const progress = { value: 0 }

      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          markSeen()
          setDone(true)
        }
      })

      tl.fromTo('.intro-eyebrow-rule', { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'expo.inOut' }, 0.1)
        .fromTo('.intro-eyebrow-text', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, 0.2)

        // `y: 0` because GSAP reads the CSS starting offset (translateY(110%))
        // as pixels into `y`, and would keep it while tweening `yPercent`.
        .fromTo('.intro-word', { y: 0, yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.08 }, 0.2)
        .fromTo('.intro-loading', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.35)
        .fromTo('.intro-loading-fill', { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power1.inOut' }, 0.35)
        .to(
          progress,
          {
            value: 100,
            duration: 1,
            ease: 'power1.inOut',
            onUpdate: () => {
              if (percent) percent.textContent = `${String(Math.round(progress.value)).padStart(3, '0')}%`
            }
          },
          0.35
        )
        .fromTo('.intro-slogan', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.55)
        .addLabel('clear', 1.5)

        // The copy leaves first, then the glass clears behind it.
        .to('.intro-stack', { autoAlpha: 0, y: -24, duration: 0.5, ease: 'power2.in' }, 'clear')
        .to('.intro-glass', { autoAlpha: 0, duration: 0.9, ease: 'power2.inOut' }, 'clear+=0.15')

        // The hero's own timeline starts as the glass clears, so its headline
        // is already rising when it comes into focus.
        .call(onDone, undefined, 'clear+=0.2')

      const skip = () => {
        if (tl.time() < tl.labels.clear) tl.seek('clear')
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

      <div className='intro-glass absolute inset-0' />

      <div className='absolute inset-0 flex items-center justify-center px-6'>
        <div className='intro-stack select-none'>
          <span className='intro-mark intro-stack-mark'>
            <BrandMark />
          </span>

          <p className='intro-eyebrow'>
            <span className='intro-eyebrow-rule' />
            <span className='intro-eyebrow-text'>Better systems. More human work.</span>
            <span className='intro-eyebrow-rule' />
          </p>

          {/* A <p>, not a heading: it is an opening, and the page's real H1
              is the hero headline. */}
          <p className='intro-name'>
            {NAME_WORDS.map((word, i) => (
              <Fragment key={word}>
                {i > 0 && ' '}
                <span className='intro-word-mask'>
                  <span className={word === SUFFIX ? 'intro-word intro-word-accent' : 'intro-word'}>{word}</span>
                </span>
              </Fragment>
            ))}
          </p>

          <div className='intro-loading'>
            <div className='intro-loading-head'>
              <span>Initializing workflow</span>
              <span className='intro-loading-percent'>000%</span>
            </div>
            <span className='intro-loading-track'>
              <span className='intro-loading-fill' />
            </span>
          </div>

          <p className='intro-slogan'>Automating the manual work that quietly eats your business week.</p>
        </div>
      </div>
    </div>
  )
}
