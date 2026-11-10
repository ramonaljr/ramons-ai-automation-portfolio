'use client'

import { Fragment, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'

import { gsap, useGSAP } from '@/components/landing/gsap'
import { usePrefersReducedMotion } from '@/components/landing/motion'
import { BrandMark } from '@/components/landing/brand-mark'
import { TOOLS, type Tool } from '@/components/landing/scenes/tool-mark'

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

/** The workflow under the name: an email in, n8n, a message out. */
const FLOW: Tool[] = ['gmail', 'n8n', 'slack']

/** The run's beats, in seconds: when the first tool lights, each line's
 *  travel time, and the pause on each tool before the pulse leaves it. */
const RUN_START = 0.5
const RUN_LEG = 0.34
const RUN_REST = 0.08

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
 * and the name rise in the hero's own display type, and a small workflow runs
 * under them (a pulse carries the work from Gmail through n8n to Slack, each
 * lighting in its own colour as it arrives). Then the copy leaves, the
 * monogram glides into the nav's mark, and the hero rises as the glass clears.
 * Nothing here pretends to load: it is under two seconds, and any input
 * hurries it.
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
        .fromTo('.intro-flow', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.35)

      // The run: a pulse carries the work along each line, and each tool
      // lights, pops and pings as it arrives, so it reads as something moving
      // from Gmail through n8n to Slack rather than three icons changing colour.
      const q = gsap.utils.selector(rootRef)
      const nodes = q('.intro-flow-node')
      const lits = q('.intro-flow-lit')
      const pings = q('.intro-flow-ping')
      const lines = q('.intro-flow-line')

      const arrive = (i: number, at: number) => {
        tl.to(lits[i], { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }, at)
          .to(
            nodes[i],
            {
              keyframes: [
                { scale: 1.12, duration: 0.12, ease: 'power2.out' },
                { scale: 1, duration: 0.4 }
              ]
            },
            at
          )
          .fromTo(
            pings[i],
            { scale: 1, autoAlpha: 0.6 },
            { scale: 1.7, autoAlpha: 0, duration: 0.6, ease: 'power2.out' },
            at
          )
      }

      const travel = (i: number, at: number) => {
        const line = lines[i]
        const pulse = line.querySelector('.intro-flow-pulse')
        const fill = line.querySelector('.intro-flow-fill')

        tl.fromTo(
          pulse,
          { x: 0, autoAlpha: 0 },
          { x: () => line.offsetWidth, duration: RUN_LEG, ease: 'power1.inOut' },
          at
        )
          .to(pulse, { autoAlpha: 1, duration: 0.08, ease: 'none' }, at)
          .to(pulse, { autoAlpha: 0, duration: 0.1, ease: 'none' }, at + RUN_LEG - 0.08)
          .fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: RUN_LEG, ease: 'power1.inOut' }, at)
      }

      nodes.forEach((_, i) => {
        const at = RUN_START + i * (RUN_LEG + RUN_REST)

        arrive(i, at)
        if (i < lines.length) travel(i, at + RUN_REST)
      })

      tl.addLabel('clear', RUN_START + lines.length * (RUN_LEG + RUN_REST) + 0.36)

        // The copy leaves first, top line first, while the monogram stays.
        .to(
          ['.intro-eyebrow', '.intro-name', '.intro-flow'],
          { autoAlpha: 0, y: -16, duration: 0.4, stagger: 0.04, ease: 'power2.in' },
          'clear'
        )
        .to('.intro-glass', { autoAlpha: 0, duration: 0.8, ease: 'power2.inOut' }, 'clear+=0.3')

        // The hero starts once the copy has gone, so the two never overlap:
        // its headline rises as the glass clears, not through the intro's.
        .call(onDone, undefined, 'clear+=0.42')

      // The monogram glides into the nav's own mark and settles there as the
      // glass clears, so the opening hands the brand to the page instead of
      // fading it out. Measured when the flight starts, not now, in case a
      // skip scrolled the page and the nav tightened. No nav mark (it is
      // hidden, say): the monogram simply leaves with the copy.
      const mark = q('.intro-stack-mark')[0]
      const navMark = document.querySelector<HTMLElement>('.site-nav .nav-brand-mark')

      if (navMark && navMark.offsetWidth > 0) {
        let leg: { x: number; y: number; scale: number } | undefined

        const measure = () => {
          if (leg) return leg

          const from = mark.getBoundingClientRect()
          const to = navMark.getBoundingClientRect()

          leg = {
            x: to.left + to.width / 2 - (from.left + from.width / 2),
            y: to.top + to.height / 2 - (from.top + from.height / 2),
            scale: to.width / from.width
          }

          return leg
        }

        // The nav's mark waits out of sight, so there is only ever one
        // monogram on screen, and takes over as the flying one settles on it.
        // Reverted with the context if the intro is torn down part way.
        tl.set(navMark, { autoAlpha: 0 }, 0)
          .to(
            mark,
            {
              x: () => measure().x,
              y: () => measure().y,
              scale: () => measure().scale,
              duration: 0.95,
              ease: 'expo.inOut'
            },
            'clear+=0.1'
          )
          .to(navMark, { autoAlpha: 1, duration: 0.2, ease: 'none' }, 'clear+=0.9')
          .to(mark, { autoAlpha: 0, duration: 0.2, ease: 'none' }, 'clear+=0.9')
      } else {
        tl.to(mark, { autoAlpha: 0, y: -16, duration: 0.4, ease: 'power2.in' }, 'clear')
      }

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

          <div className='intro-flow'>
            {FLOW.map((tool, i) => (
              <Fragment key={tool}>
                {i > 0 && (
                  <span className='intro-flow-line'>
                    <span className='intro-flow-fill' />
                    <span className='intro-flow-pulse' />
                  </span>
                )}
                <span
                  className='intro-flow-node'
                  style={
                    {
                      '--src': `url(/images/tools/${TOOLS[tool].slug}.svg)`,
                      '--mark': TOOLS[tool].color
                    } as CSSProperties
                  }
                >
                  <span className='intro-flow-mark' />
                  <span className='intro-flow-mark intro-flow-lit' />
                  <span className='intro-flow-ping' />
                </span>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
