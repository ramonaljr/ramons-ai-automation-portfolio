'use client'

import { useEffect, useRef } from 'react'

import { motion, useScroll, useTransform } from 'motion/react'

import { usePrefersReducedMotion } from '@/components/landing/motion'

type Mood = 'golden' | 'muted' | 'warm' | 'dusk'

/**
 * The video's grade per section, in DOM order. The story sets the mood:
 * golden for the promise and the close, muted for the years of manual work,
 * dusk for the proof, warm for the explanation in between. Anything above
 * About (the hero) is golden.
 */
const SECTION_MOODS: readonly (readonly [id: string, mood: Mood])[] = [
  ['about', 'muted'],
  ['portfolio', 'dusk'],
  ['services', 'warm'],
  ['process', 'warm'],
  ['experience', 'muted'],
  ['platforms', 'warm'],
  ['testimonials', 'golden'],
  ['engagement', 'golden'],
  ['faq', 'golden'],
  ['contact', 'golden']
]

/** The mood changes when a section crosses the middle of the viewport. */
const LINE = 0.5

/** One continuous autumn environment for the lower-page story. */
export function BlossomStoryBackground() {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduced = usePrefersReducedMotion()
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
    }

    update()

    const observer = new IntersectionObserver(update, {
      rootMargin: `-${LINE * 100}% 0px -${100 - LINE * 100 - 1}% 0px`,
      threshold: 0
    })

    targets.forEach(target => observer.observe(target.element))

    return () => observer.disconnect()
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
  }, [reduced])

  return (
    <div
      ref={rootRef}
      data-mood='golden'
      className='blossom-story-background pointer-events-none absolute inset-0'
      aria-hidden='true'
    >
      <div className='sticky top-0 h-screen overflow-hidden'>
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
        <div className='blossom-story-horizon absolute inset-x-0 bottom-0' />
      </div>
    </div>
  )
}
