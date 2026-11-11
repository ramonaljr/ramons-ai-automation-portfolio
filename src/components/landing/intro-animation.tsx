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

/**
 * The run's beats, in seconds. `RUN_START` is on the CSS clock (time since the
 * overlay first painted, which is when the entrance began), not on GSAP's:
 * hydration can land anywhere in the entrance, and the run should start at the
 * same moment of it either way. Then each line's travel time, the pause on
 * each tool before the pulse leaves it, and the hold on the finished run.
 */
const RUN_START = 0.45
const RUN_LEG = 0.3
const RUN_REST = 0.06
const RUN_HOLD = 0.25

/** How long before the run's "done" beat the hero is released. */
const RELEASE_LEAD = 0.12

/** How long the handover's flights take: tagline, name and monogram. */
const FLIGHT = 0.85

/**
 * The name and the monogram climb to the nav on a curve that leaves early,
 * so the name is out of the centre before the hero's headline rises there.
 * The tagline, which has only a short way to go, keeps the slower settle.
 */
const BRAND_EASE = 'power3.inOut'

/** The glass's blur, resolved to nothing as the page comes into focus.
 *  The first must match `.intro-glass` in globals.css. */
const GLASS_BLURRED = 'blur(22px) saturate(1.05)'
const GLASS_CLEAR = 'blur(0px) saturate(1)'

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

/** A flight from one element onto another, both pinned by their left edge. */
type Leg = { x: number; y: number; scale: number }

/** Where an element has nowhere to land (its target is hidden or collapsed),
 *  it leaves the way the copy used to: a short lift. */
const NO_LEG: Leg = { x: 0, y: -16, scale: 1 }

/**
 * The move that puts `from` exactly on `to`: left edges and vertical centres
 * aligned. Both elements scale from `0 50%` in globals.css.
 *
 * `fit` says what the scale matches. `type` is the ratio of the type sizes,
 * for two settings of the same face and tracking (the tagline), where it
 * makes every glyph coincide. `width` is the ratio of the boxes, for two that
 * differ in weight and tracking (the name and the nav's wordmark): the glyphs
 * cannot all coincide, so the words at least start and end together.
 */
const legBetween = (from: Element, to: Element | null | undefined, fit: 'type' | 'width' = 'type'): Leg => {
  if (!to) return NO_LEG

  const a = from.getBoundingClientRect()
  const b = to.getBoundingClientRect()

  if (b.width < 4 || a.width < 4) return NO_LEG

  return {
    x: b.left - a.left,
    y: b.top + b.height / 2 - (a.top + a.height / 2),
    scale:
      fit === 'width'
        ? b.width / a.width
        : parseFloat(getComputedStyle(to).fontSize) / parseFloat(getComputedStyle(from).fontSize)
  }
}

/**
 * The opening is the landing page itself, out of focus. The page sits behind
 * frosted glass like the nav bar's; over it the monogram draws, the brand line
 * and the name rise in the hero's own display type, and a small workflow runs
 * under them (a pulse carries the work from Gmail through n8n to Slack, each
 * lighting in its own colour as it arrives).
 *
 * Then it hands itself to the page in one move, and nothing fades out to fade
 * back in: the brand line travels to the hero and becomes its eyebrow, the
 * finished run sends a spark that draws the eyebrow's rule, the name and the
 * monogram glide into the nav's own, and the glass comes into focus over the
 * hero as it rises.
 *
 * The entrance is CSS (globals.css) and starts at first paint, so it never
 * waits for JavaScript; GSAP owns the run, the exit and the handover. Nothing
 * here pretends to load: the copy is on screen for about a second and a half,
 * the whole thing is over in under three, and any input hurries it.
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
      // Nothing to play. The hero still has to be released. The attribute is
      // the pre-paint script's answer, which is in before the store's first
      // client read; without it a returning visit armed the handover for one
      // render and left the hero thinking its tagline had been carried.
      if (reducedMotion || seen || document.documentElement.hasAttribute('data-intro-seen')) {
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

      const q = gsap.utils.selector(rootRef)

      // How far into the CSS entrance we already are. The overlay's failsafe
      // animation has been running since the overlay first painted, so its
      // clock is the entrance's clock.
      const failsafe = root.getAnimations().find(a => 'animationName' in a && a.animationName === 'intro-failsafe')
      const elapsed = Number(failsafe?.currentTime ?? 0) / 1000
      const runAt = Math.max(0.05, RUN_START - elapsed)

      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          markSeen()
          setDone(true)
        }
      })

      // The run: a pulse carries the work along each line, and each tool
      // lights, pops and pings as it arrives, so it reads as something moving
      // from Gmail through n8n to Slack rather than three icons changing colour.
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
                { scale: 1, duration: 0.3 }
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
        const at = runAt + i * (RUN_LEG + RUN_REST)

        arrive(i, at)
        if (i < lines.length) travel(i, at + RUN_REST)
      })

      // The finished run holds for a beat, then lands: the three tools lift
      // together and one ring closes around the whole run. Without it the run
      // vanished a third of a second after Slack lit, before it read as done.
      const ran = runAt + lines.length * (RUN_LEG + RUN_REST) + RUN_HOLD

      tl.to(
        nodes,
        {
          keyframes: [
            { y: -3, duration: 0.12, ease: 'power2.out' },
            { y: 0, duration: 0.3, ease: 'power2.inOut' }
          ]
        },
        ran
      )
        .fromTo(
          '.intro-flow-done',
          { autoAlpha: 0.9, scale: 0.94 },
          { autoAlpha: 0, scale: 1.08, duration: 0.55, ease: 'power2.out', immediateRender: false },
          ran
        )
        .addLabel('clear', ran + 0.22)

      // Releasing the hero re-renders the page and splits its headline, which
      // costs a long frame. So it happens in the hold, while nothing is
      // moving, and the hero's entrance waits out the difference
      // (`HANDOVER_LEAD` in hero-section.tsx) to start as the tagline leaves.
      // A skip seeks past this call, so it releases the hero itself.
      let released = false

      const release = () => {
        if (released) return

        released = true
        onDone()
      }

      tl.call(release, undefined, ran - RELEASE_LEAD)

      // ── The handover ─────────────────────────────────────────────────────
      // The entrance's CSS animations still hold their end states, and a CSS
      // animation outranks an inline style, so GSAP could not move what they
      // own. Switch them off and pin the same end states inline first. (After
      // a skip the entrance may be cut short here; that is what a skip is.)
      const rules = q('.intro-eyebrow-rule')
      const tagline = q('.intro-eyebrow-text')[0]
      const name = q('.intro-name')[0]
      const flow = q('.intro-flow')[0]

      tl.set([rules, tagline, q('.intro-word'), flow], { animation: 'none' }, 'clear')
        .set(rules, { scaleX: 1 }, 'clear')
        .set(tagline, { opacity: 1 }, 'clear')

        // `y: 0` because GSAP reads the CSS starting offset (translateY(110%))
        // as pixels into `y`, and would otherwise keep it.
        .set(q('.intro-word'), { y: 0, yPercent: 0 }, 'clear')
        .set(flow, { opacity: 1, y: 0 }, 'clear')

        // The rules draw back into the tagline they framed, and the run steps
        // back, as the tagline lifts off.
        .fromTo(
          rules,
          { scaleX: 1 },
          { scaleX: 0, duration: 0.3, ease: 'power2.in', immediateRender: false },
          'clear'
        )
        .to(flow, { autoAlpha: 0, y: -10, duration: 0.4, ease: 'power2.in' }, 'clear+=0.08')

        // Focus pull. The glass used to fade at full blur, which read as a
        // cross-fade between two pictures. Now the blur itself resolves, so the
        // page comes into focus, and the tint lifts a beat behind it.
        .fromTo(
          '.intro-glass',
          { backdropFilter: GLASS_BLURRED },
          { backdropFilter: GLASS_CLEAR, duration: 0.9, ease: 'power2.inOut', immediateRender: false },
          'clear'
        )
        .to('.intro-glass', { autoAlpha: 0, duration: 0.7, ease: 'power2.inOut' }, 'clear+=0.25')

      // Every flight is measured when it starts, not now, in case a skip
      // scrolled the page and the nav tightened or the hero moved.

      // The tagline travels to the hero and becomes its eyebrow. The hero's
      // own stays out of sight until this one lands on it (`data-carried`,
      // see globals.css), and the hero's entrance leaves it alone.
      const heroEyebrow = document.querySelector<HTMLElement>('.hero-autumn [data-hero="eyebrow"]')
      const heroTagline = heroEyebrow?.querySelector<HTMLElement>('.eyebrow')
      const heroRule = heroEyebrow?.querySelector<HTMLElement>('[data-hero-rule]')

      if (heroEyebrow && heroTagline) {
        let leg: Leg | undefined
        const fly = () => (leg ??= legBetween(tagline, heroTagline))

        heroEyebrow.setAttribute('data-carried', 'flying')

        tl.to(
          tagline,
          { x: () => fly().x, y: () => fly().y, scale: () => fly().scale, duration: FLIGHT, ease: 'expo.inOut' },
          'clear'
        )
          .call(() => heroEyebrow.setAttribute('data-carried', 'landed'), undefined, `clear+=${FLIGHT}`)
          .set(tagline, { visibility: 'hidden' }, `clear+=${FLIGHT}`)

        // The payoff for the run: the finished work leaves Slack, crosses to
        // the hero and draws the eyebrow's rule, so the run flows into the
        // page instead of blinking out.
        const spark = q('.intro-spark')[0]

        if (heroRule) {
          let path: { fromX: number; fromY: number; toX: number; toY: number } | undefined

          const cross = () => {
            if (path) return path

            const from = nodes[nodes.length - 1].getBoundingClientRect()
            const to = heroRule.getBoundingClientRect()
            const box = root.getBoundingClientRect()

            // The rule is collapsed (scaleX 0 from its left) while it waits,
            // so its rect is its own left end.
            path = {
              fromX: from.left + from.width / 2 - box.left,
              fromY: from.top + from.height / 2 - box.top,
              toX: to.left - box.left,
              toY: to.top + to.height / 2 - box.top
            }

            return path
          }

          tl.fromTo(heroRule, { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: 'power3.out' }, `clear+=${FLIGHT - 0.2}`)
            .fromTo(
              spark,
              { x: () => cross().fromX, y: () => cross().fromY, autoAlpha: 1, scale: 1 },
              {
                x: () => cross().toX,
                y: () => cross().toY,
                duration: FLIGHT - 0.15,
                ease: 'expo.inOut',
                immediateRender: false
              },
              'clear'
            )
            .to(spark, { autoAlpha: 0, scale: 0.4, duration: 0.25, ease: 'power2.out' }, `clear+=${FLIGHT - 0.2}`)
        }
      } else {
        tl.to(tagline, { autoAlpha: 0, y: -16, duration: 0.4, ease: 'power2.in' }, 'clear')
      }

      // The name glides into the nav's wordmark, which waits out of sight so
      // the name is never on screen twice. Hidden by `visibility`, not
      // opacity: the wordmark has a CSS opacity transition that would smear
      // anything GSAP wrote to it. Where the nav has no wordmark (tablets, or
      // the tightened pill), the name simply leaves.
      const navName = document.querySelector<HTMLElement>('.site-nav .nav-brand-name')

      if (navName && navName.offsetWidth > 4) {
        let leg: Leg | undefined
        const fly = () => (leg ??= legBetween(name, navName, 'width'))

        tl.set(navName, { visibility: 'hidden' }, 0)
          .to(
            name,
            { x: () => fly().x, y: () => fly().y, scale: () => fly().scale, duration: FLIGHT, ease: BRAND_EASE },
            'clear'
          )

          // The suffix gives up its accent on the way: the wordmark is all ink.
          .to(q('.intro-word-accent'), { color: 'var(--ink)', duration: FLIGHT, ease: 'power2.inOut' }, 'clear')
          .set(navName, { visibility: 'visible' }, `clear+=${FLIGHT - 0.06}`)
          .to(name, { autoAlpha: 0, duration: 0.12, ease: 'none' }, `clear+=${FLIGHT - 0.06}`)
      } else {
        tl.to(name, { autoAlpha: 0, y: -16, duration: 0.4, ease: 'power2.in' }, 'clear')
      }

      // The monogram glides into the nav's own mark and settles there, so the
      // opening hands the brand to the page instead of fading it out. No nav
      // mark (it is hidden, say): the monogram simply leaves with the copy.
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
              duration: FLIGHT,
              ease: BRAND_EASE
            },
            'clear'
          )
          .to(navMark, { autoAlpha: 1, duration: 0.2, ease: 'none' }, `clear+=${FLIGHT - 0.12}`)
          .to(mark, { autoAlpha: 0, duration: 0.2, ease: 'none' }, `clear+=${FLIGHT - 0.12}`)
      } else {
        tl.to(mark, { autoAlpha: 0, y: -16, duration: 0.4, ease: 'power2.in' }, 'clear')
      }

      const skip = () => {
        release()
        if (tl.time() < tl.labels.clear) tl.seek('clear')
        tl.timeScale(2.2)
      }

      SKIP_EVENTS.forEach(type => window.addEventListener(type, skip, { passive: true }))

      return () => {
        SKIP_EVENTS.forEach(type => window.removeEventListener(type, skip))

        // Torn down part way (or finished): either way the hero's eyebrow
        // must end up visible, whatever the timeline reached.
        heroEyebrow?.setAttribute('data-carried', 'landed')
      }
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

          {/* A <p>, not a heading: it is an opening, and the page's real H1
              is the hero headline. */}
          <p className='intro-name'>
            {NAME_WORDS.map((word, i) => (
              <Fragment key={word}>
                {i > 0 && ' '}
                <span className='intro-word-mask'>
                  <span
                    className={word === SUFFIX ? 'intro-word intro-word-accent' : 'intro-word'}
                    style={{ '--i': i } as CSSProperties}
                  >
                    {word}
                  </span>
                </span>
              </Fragment>
            ))}
          </p>

          {/* Under the name, not over it: both rise at the handover, the name
              to the nav and the tagline to the hero, and in this order their
              paths never cross. */}
          <p className='intro-eyebrow'>
            <span className='intro-eyebrow-rule' />
            <span className='intro-eyebrow-text'>Better systems. More human work.</span>
            <span className='intro-eyebrow-rule' />
          </p>

          <div className='intro-flow'>
            <span className='intro-flow-done' />
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

      <span className='intro-spark' />
    </div>
  )
}
