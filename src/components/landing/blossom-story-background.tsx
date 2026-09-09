'use client'

import { useEffect, useRef } from 'react'

import { motion, useScroll, useTransform } from 'motion/react'

import { usePrefersReducedMotion } from '@/components/landing/motion'

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
    <div ref={rootRef} className='blossom-story-background pointer-events-none absolute inset-0' aria-hidden='true'>
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
