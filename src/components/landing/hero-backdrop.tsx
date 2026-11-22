'use client'

import { useEffect, useRef, useState } from 'react'

import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'

import { usePrefersReducedMotion } from '@/components/landing/motion'

/**
 * Real Mount Fuji behind the hero: the sky and the peak from a drone drift
 * over the Aokigahara forest (Pixabay #246269, Pixabay Content License — free
 * for commercial use, no attribution required).
 *
 * Only the mountain is kept. The footage's own forest is masked away below
 * the mountain's foot, and the layer sits at the very back of the autumn
 * scene (BlossomStoryBackground), so the page's own trees, branches and
 * falling leaves all stay in front of it. It drifts up and fades as the hero
 * scrolls away, and stops decoding once it has gone.
 *
 * Loading follows the page video's rules: the still is on screen from first
 * paint, and the footage mounts only after load, from 768px up, when the
 * reader has not asked to save data and does not prefer reduced motion.
 */
export function HeroBackdrop({ ready = true }: { ready?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduced = usePrefersReducedMotion()
  const [withVideo, setWithVideo] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(true)

  // Window scroll in pixels: the hero is the first screen, so a screen's worth
  // of scroll is the whole of its life.
  const { scrollY } = useScroll()
  const [screen, setScreen] = useState(900)

  useEffect(() => {
    const sync = () => setScreen(window.innerHeight)

    sync()
    window.addEventListener('resize', sync)

    return () => window.removeEventListener('resize', sync)
  }, [])

  const opacity = useTransform(scrollY, [0, screen * 0.85], [1, 0])
  const y = useTransform(scrollY, [0, screen], ['0%', '-12%'])

  useMotionValueEvent(scrollY, 'change', value => setVisible(value < screen))

  useEffect(() => {
    if (reduced) return

    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection

    if (connection?.saveData || !window.matchMedia('(min-width: 768px)').matches) return

    const mount = () => setWithVideo(true)

    if (document.readyState === 'complete') {
      const id = window.setTimeout(mount, 200)

      return () => window.clearTimeout(id)
    }

    window.addEventListener('load', mount, { once: true })

    return () => window.removeEventListener('load', mount)
  }, [reduced])

  // Plays only while the hero is on screen and the tab is in front.
  useEffect(() => {
    const video = videoRef.current

    if (!withVideo || !video) return

    const sync = () => {
      if (visible && !document.hidden) void video.play().catch(() => undefined)
      else video.pause()
    }

    sync()
    document.addEventListener('visibilitychange', sync)

    return () => document.removeEventListener('visibilitychange', sync)
  }, [withVideo, visible])

  return (
    <motion.div
      className='hero-backdrop absolute inset-0'
      data-ready={ready || undefined}
      style={reduced ? undefined : { opacity, y }}
    >
      <div className='hero-backdrop-media absolute inset-0'>
        <picture>
          <source media='(max-width: 1023px)' srcSet='/images/landing/hero-fuji-autumn-poster-960.webp' />
          <img
            src='/images/landing/hero-fuji-autumn-poster.webp'
            alt=''
            width={1920}
            height={1080}
            className='absolute inset-0 h-full w-full object-cover'
          />
        </picture>

        {withVideo && (
          <video
            ref={videoRef}
            className='hero-backdrop-video absolute inset-0 h-full w-full object-cover'
            data-playing={playing || undefined}
            onPlaying={() => setPlaying(true)}
            muted
            loop
            playsInline
            autoPlay
            preload='auto'
            poster='/images/landing/hero-fuji-autumn-poster.webp'
          >
            <source src='/video/hero-fuji-autumn-1920.mp4' type='video/mp4' media='(min-width: 1440px)' />
            <source src='/video/hero-fuji-autumn-1280.mp4' type='video/mp4' />
          </video>
        )}
      </div>
    </motion.div>
  )
}
