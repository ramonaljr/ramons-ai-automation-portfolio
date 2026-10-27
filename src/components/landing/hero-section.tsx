'use client'

import { useEffect, useRef, useState, type PointerEvent } from 'react'

import { AnimatePresence, motion } from 'motion/react'

import { PROFILE } from '@/lib/portfolio'
import { Cta, usePrefersReducedMotion } from '@/components/landing/motion'
import { gsap, LINE_DROP, MOTION_OK, SplitText, useGSAP } from '@/components/landing/gsap'

const DISPLAY_FONT = 'var(--font-editorial), Georgia, serif'

/**
 * Kept short on purpose. These set inside a clipped, absolutely-positioned
 * line, so a phrase that wraps loses its second line entirely — at 375px the
 * previous "capturing new leads." rendered as "capturing". Short phrases keep
 * the headline on one line down to 360px; `LONGEST_WORK` below is the
 * belt-and-braces guarantee for widths and fallback fonts we have not measured.
 */
const ROTATING_WORK = ['data entry.', 'new leads.', 'follow-ups.', 'reporting.']

/**
 * Reserves the line box in normal flow. The rotating word itself is absolutely
 * positioned so the outgoing and incoming words can cross-fade over each other,
 * which means it contributes no height — without this sizer the box falls back
 * to a fixed `min-height` that cannot know how the text actually wrapped.
 */
const LONGEST_WORK = ROTATING_WORK.reduce((a, b) => (b.length > a.length ? b : a))

/**
 * The desktop entrance, as one GSAP timeline rather than five CSS transitions
 * on staggered delays. Each block used to fade up as a slab; now the headline
 * rises line by line from behind its own edge, the rotating word follows its
 * line in, and the portrait wipes open while the copy settles. One timeline
 * means one place to read and retune the order.
 *
 * Phones never run it: below 768px the hero rises as a CSS animation from
 * first paint (see `.hero-reveal` in globals.css), because waiting for
 * JavaScript there cost most of the page's Largest Contentful Paint.
 */
const HERO_MOTION = `(min-width: 768px) and ${MOTION_OK}`

/**
 * Moves the portrait's reveal circle to the pointer. Written straight to the
 * style, like the work cards' spotlight, so following the mouse never
 * re-renders React. Touch has no hover to follow, so it is mouse and pen only.
 */
function trackReveal(event: PointerEvent<HTMLElement>) {
  if (event.pointerType === 'touch') return

  const figure = event.currentTarget
  const box = figure.getBoundingClientRect()

  figure.style.setProperty('--mx', `${event.clientX - box.left}px`)
  figure.style.setProperty('--my', `${event.clientY - box.top}px`)
  figure.setAttribute('data-pointer', 'in')
  figure.setAttribute('data-hinted', 'true')
}

/**
 * `ready` lets the page gate the reveal on the intro animation finishing,
 * preserving the original choreography. Defaults to revealing on mount.
 */
export function HeroSection({ ready = true }: { ready?: boolean }) {
  const rootRef = useRef<HTMLElement>(null)
  const [wordIndex, setWordIndex] = useState(0)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (!ready) return

      const mm = gsap.matchMedia()

      mm.add(HERO_MOTION, () => {
        const q = gsap.utils.selector(rootRef)
        const title = q('[data-hero="title"]')
        const copy = q('[data-hero="copy"]')

        const titleSplit = SplitText.create(q('[data-hero-line]'), {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          aria: 'none'
        })

        const copySplit = SplitText.create(copy, { type: 'lines', mask: 'lines', linesClass: 'split-line' })

        // The splits are only scaffolding for the entrance. Once it lands the
        // markup goes back to what React rendered, so a later resize re-wraps
        // real text instead of lines measured at the old width.
        // The blueprint under the portrait only answers the pointer once the
        // entrance has landed, so the wipe and the reveal never fight over the
        // same frame.
        const portrait = q('.hero-portrait')[0] as HTMLElement | undefined

        const tl = gsap.timeline({
          defaults: { ease: 'expo.out', duration: 1.15 },
          onComplete: () => {
            titleSplit.revert()
            copySplit.revert()
            portrait?.setAttribute('data-reveal', 'ready')
          }
        })

        tl.addLabel('copy', 0)
          .fromTo(
            q('[data-hero="byline"], [data-hero="eyebrow"]'),
            { opacity: 0.01, y: 14 },
            { opacity: 1, y: 0, duration: 0.9 },
            'copy'
          )
          .fromTo(q('[data-hero-rule]'), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, 'copy')
          .set(title, { opacity: 1 }, 'copy+=0.1')
          .fromTo(titleSplit.lines, { yPercent: LINE_DROP }, { yPercent: 0 }, 'copy+=0.1')
          .fromTo(q('[data-hero-word]'), { yPercent: LINE_DROP + 10 }, { yPercent: 0 }, 'copy+=0.22')
          .set(copy, { opacity: 1 }, 'copy+=0.42')
          .fromTo(copySplit.lines, { yPercent: LINE_DROP }, { yPercent: 0, duration: 1, stagger: 0.07 }, 'copy+=0.42')
          .fromTo(
            q('[data-hero="actions"]'),
            { opacity: 0.01, y: 16 },
            { opacity: 1, y: 0, duration: 0.9 },
            'copy+=0.62'
          )

          // The portrait opens from the base a beat after the headline starts,
          // and the photo inside settles from a slight push-in as it does.
          .addLabel('portrait', 'copy+=0.18')
          .fromTo(
            q('.hero-portrait-frame'),
            { clipPath: 'inset(100% 0% 0% 0% round 1.75rem)' },
            { clipPath: 'inset(0% 0% 0% 0% round 1.75rem)', duration: 1.3, ease: 'expo.inOut' },
            'portrait'
          )
          .fromTo(q('.hero-portrait-image'), { scale: 1.14 }, { scale: 1, duration: 2.1 }, 'portrait')

        return () => portrait?.removeAttribute('data-reveal')
      })

      return () => mm.revert()
    },
    { scope: rootRef, dependencies: [ready] }
  )

  useEffect(() => {
    if (reduced) return

    const interval = window.setInterval(() => {
      setWordIndex(current => (current + 1) % ROTATING_WORK.length)
    }, 3200)

    return () => window.clearInterval(interval)
  }, [reduced])

  return (
    <section ref={rootRef} className='hero-autumn relative flex min-h-dvh flex-col justify-center overflow-hidden'>
      {/* No backdrop of its own: the autumn video and falling leaves behind
          the whole page show through, so the hero and the sections below share
          one scene. `.hero-autumn` only adds a wash behind the copy. */}

      <div className='relative z-10 mx-auto flex w-full max-w-390 flex-1 flex-col justify-center px-6 pt-32 pb-10 md:px-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-20 2xl:max-w-440'>
        <div className='koisei-hero-copy w-full max-w-[62rem] text-left lg:max-w-[58%]'>
          {/* Phones get a face too, just smaller: the portrait card below only
              appears once there is a column to put it in. */}
          <div data-hero='byline' className='hero-reveal hero-byline mb-6 flex items-center gap-3 lg:hidden'>
            <img src='/images/landing/ramon-avatar.webp' alt='' width={96} height={96} className='hero-byline-avatar' />
            <span className='text-ink-2 text-sm leading-tight'>
              <strong className='text-ink block font-medium'>{PROFILE.name}</strong>
              {PROFILE.title} · MBA
            </span>
          </div>

          {/* Eyebrow */}
          <div data-hero='eyebrow' className='hero-reveal mb-8'>
            <span className='inline-flex items-center gap-3'>
              <span data-hero-rule className='bg-ink/25 h-px w-8 origin-left' />
              {/* The brand line. It closes the page in the footer too, so a
                  visitor meets the same promise first and last. The
                  credentials it replaced are in the byline and portrait card. */}
              <span className='eyebrow'>
                Better systems. <br className='sm:hidden' />
                More human work.
              </span>
            </span>
          </div>

          <h1
            data-hero='title'
            aria-label='Let automation handle data entry, new leads, follow-ups, and reporting.'
            className='hero-reveal display-xl text-ink text-left text-[clamp(2.6rem,4.6vw,5rem)] leading-[0.92] font-light'
            style={{ fontFamily: DISPLAY_FONT }}
          >
            <span data-hero-line className='block'>
              Let automation handle
            </span>
            {/* At leading 0.88 the line box ends ~0.03em below the baseline,
                but g/y/p descend ~0.18em, so `overflow-hidden` cut their tails
                off. The padding widens the clip downward and the matching
                negative margin keeps the layout where it was. */}
            <span
              className='hero-word-shell hero-rotating-line relative -mb-[0.22em] block overflow-hidden pb-[0.22em]'
              aria-hidden='true'
            >
              {/* The track is what the entrance lifts into the clipped line.
                  It is positioned so the absolutely placed words measure
                  against it, and they ride in with it rather than sitting
                  still while the line around them moves. */}
              <span data-hero-word className='relative block'>
                <span className='hero-sizer invisible block' data-text={LONGEST_WORK} />
                {/* The words cross over each other rather than taking turns. With
                  `mode='wait'` the old word left before the new one arrived,
                  so for over a second of every cycle the headline read "Let
                  automation handle" with nothing after it. The first word is
                  on screen from the first frame (`initial={false}`). */}
                <AnimatePresence initial={false}>
                  <motion.span
                    key={ROTATING_WORK[wordIndex]}
                    initial={reduced ? false : { opacity: 0, y: '38%' }}
                    animate={{ opacity: 1, y: '0%' }}
                    exit={reduced ? undefined : { opacity: 0, y: '-38%' }}
                    transition={{ duration: reduced ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className='hero-outcome absolute inset-x-0 top-0 block'
                  >
                    {ROTATING_WORK[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </h1>

          {/* Supporting line + actions. The hero previously ran headline →
              stats with no call to action anywhere above the fold, so the
              first thing a visitor could act on was ten sections down. */}
          <p data-hero='copy' className='hero-reveal text-lead text-ink-2 mt-9 max-w-[53ch] hero-delay-1'>
            For any team buried in repetitive work: I connect your tools and add AI, so the busywork runs on its own.
            Built by a former accountant.
          </p>

          <div data-hero='actions' className='hero-reveal mt-10 flex flex-wrap items-center gap-x-3 gap-y-3 hero-delay-2'>
            <Cta href='#contact'>Book a free call</Cta>
            <Cta href='#portfolio' tone='secondary'>
              See examples
            </Cta>
          </div>
        </div>

        {/* People hire people: a face above the fold does trust work before a
            word is read. The office portrait, cut out of its office so the
            person stands in the same autumn scene as the headline; the casual,
            smiling one carries About, where the tone is personal.

            Under the photo sits a line drawing of the same frame. Wherever the
            pointer goes, a circle of the drawing shows through: the person,
            then the system behind them. Desktop pointers only, and only once
            the entrance has landed (`data-reveal`, set by the timeline). */}
        <figure
          className='hero-portrait hidden lg:block'
          onPointerMove={trackReveal}
          onPointerEnter={trackReveal}
          onPointerLeave={event => event.currentTarget.removeAttribute('data-pointer')}
        >
          <div className='hero-portrait-frame'>
            {/* The figure only shows at 1024px and up, but a hidden <img> still
                downloads. Below that the source is a 1px placeholder, so
                phones skip the 80 KB they would never see. */}
            <picture>
              <source media='(max-width: 1023px)' srcSet='data:image/gif;base64,R0lGODlhAQABAAAAACw=' />
              <img
                src='/images/landing/ramon-portrait-cutout.webp'
                alt={PROFILE.name}
                width={1120}
                height={1400}
                fetchPriority='high'
                className='hero-portrait-image'
              />
            </picture>
            <img
              src='/images/landing/ramon-portrait-blueprint.webp'
              alt=''
              width={1120}
              height={1400}
              loading='lazy'
              decoding='async'
              className='hero-portrait-blueprint'
            />
          </div>
          <figcaption className='hero-portrait-hint' aria-hidden='true'>Hover to see the blueprint</figcaption>
        </figure>
      </div>
    </section>
  )
}
