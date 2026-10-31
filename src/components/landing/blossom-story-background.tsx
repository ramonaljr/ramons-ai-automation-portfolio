'use client'

import { useEffect, useRef, useState } from 'react'

import { motion, useScroll, useTransform } from 'motion/react'

import { usePrefersReducedMotion } from '@/components/landing/motion'
import { JourneyRanges, JourneyWalker } from '@/components/landing/hero-journey'

type Mood = 'golden' | 'calm' | 'close'

/**
 * The scene per section, in DOM order. The hero and the story own the autumn
 * scene; from the work down it fades to the plain slate ground, so the
 * projects, the services and the pricing are read against something quiet
 * rather than competing with a tree for attention. Anything above the work
 * is golden. (This keyed on About until the work moved above it.)
 *
 * At the booking form the scene comes back, without the video: the branches
 * and leaves frame the close the way they framed the opening, so the page
 * ends where it began.
 */
const SECTION_MOODS: readonly (readonly [id: string, mood: Mood])[] = [
  ['portfolio', 'calm'],
  ['contact', 'close']
]

/** The mood changes when a section crosses the middle of the viewport. */
const LINE = 0.5

/** One continuous autumn environment for the lower-page story. */
export function BlossomStoryBackground() {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduced = usePrefersReducedMotion()

  /**
   * The video is 3.2 MB and was fetched eagerly on every device, competing
   * with the hero for bandwidth; on phones it only ever showed at 36%
   * opacity. It now mounts after the page has loaded, on screens wide enough
   * to show it and on connections that have not asked to save data. Everyone
   * else gets the still autumn scene, which the overlay and tone layers
   * already carry.
   */
  const [withVideo, setWithVideo] = useState(false)

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection

    if (connection?.saveData || !window.matchMedia('(min-width: 768px)').matches) return

    const mount = () => setWithVideo(true)

    if (document.readyState === 'complete') {
      const id = window.setTimeout(mount, 300)

      return () => window.clearTimeout(id)
    }

    window.addEventListener('load', mount, { once: true })

    return () => window.removeEventListener('load', mount)
  }, [])
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ['start start', 'end end'] })
  const scale = useTransform(scrollYProgress, [0, 0.28, 0.62, 1], [1.02, 1.1, 1.16, 1.08])
  const x = useTransform(scrollYProgress, [0, 0.28, 0.62, 1], ['-2%', '3%', '-4%', '1%'])
  const y = useTransform(scrollYProgress, [0, 0.4, 0.78, 1], ['0%', '-2%', '2%', '-1%'])
  const opacity = useTransform(scrollYProgress, [0, 0.17, 0.42, 0.76, 1], [0.62, 0.58, 0.4, 0.36, 0.5])
  const glowX = useTransform(scrollYProgress, [0, 0.35, 0.72, 1], ['6%', '-6%', '4%', '-2%'])
  const foregroundY = useTransform(scrollYProgress, [0, 0.5, 1], ['-3%', '2%', '-1%'])
  const foregroundScale = useTransform(scrollYProgress, [0, 0.55, 1], [1.04, 1.1, 1.06])

  // Written straight to the DOM: the grade is pure CSS, so a mood change
  // should not re-render the video subtree.
  useEffect(() => {
    const root = rootRef.current

    if (!root) return

    const targets = SECTION_MOODS.flatMap(([id, mood]) => {
      const element = document.getElementById(id)

      return element ? [{ element, mood }] : []
    })

    const update = () => {
      const line = window.innerHeight * LINE
      let mood: Mood = 'golden'

      for (const target of targets) {
        if (target.element.getBoundingClientRect().top <= line) mood = target.mood
      }

      root.dataset.mood = mood

      // The falling leaves are a sibling layer, so the scene state is also
      // written where both can see it.
      root.parentElement?.setAttribute('data-scene', mood)
    }

    update()

    // Checked on scroll, once a frame, rather than by an IntersectionObserver
    // on the mid-screen line: a jump that skips a section entirely (an anchor
    // link, or the browser restoring the scroll on reload) never crosses the
    // line, so the observer never fired and the autumn scene stayed up behind
    // the work and About.
    let frame = 0

    const onScroll = () => {
      if (frame) return

      frame = requestAnimationFrame(() => {
        frame = 0
        update()
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    if (reduced) {
      video.pause()
      video.currentTime = 0.1

      return
    }

    void video.play().catch(() => undefined)
  }, [reduced, withVideo])

  return (
    <div
      ref={rootRef}
      data-mood='golden'
      className='blossom-story-background pointer-events-none absolute inset-0'
      aria-hidden='true'
    >
      <div className='sticky top-0 h-screen overflow-hidden'>
        {/* Under the tree footage: it is screen-blended, so the white tree
            paints itself over the ranges and they read as behind it. */}
        <JourneyRanges />

        {withVideo && (
          <motion.video
            ref={videoRef}
            className='blossom-story-video absolute inset-0 h-full w-full object-cover'
            style={reduced ? undefined : { scale, x, y, opacity }}
            autoPlay={!reduced}
            muted
            loop
            playsInline
            preload='auto'
          >
            <source src='/video/hero-compute.mp4' type='video/mp4' />
          </motion.video>
        )}

        <div className='blossom-story-tone absolute inset-0' />
        <motion.div className='blossom-story-glow absolute inset-0' style={reduced ? undefined : { x: glowX }} />
        <div className='blossom-story-veil absolute inset-0' />
        <motion.img
          src='/images/landing/autumn-environment-overlay.webp'
          alt=''
          width={1672}
          height={941}
          className='blossom-story-foreground absolute inset-0 h-full w-full object-cover'
          style={reduced ? undefined : { y: foregroundY, scale: foregroundScale }}
        />
        {/* Warm light falling through the branches from the top right: two
            sets of shafts drifting against each other, so where they cross
            the light shimmers. Golden scene only (globals.css). */}
        <div className='blossom-story-rays absolute inset-0'>
          <i />
          <i />
        </div>
        <div className='blossom-story-horizon absolute inset-x-0 bottom-0' />

        {/* In front of the branches and the light, behind the falling leaves. */}
        <JourneyWalker />
      </div>
    </div>
  )
}
