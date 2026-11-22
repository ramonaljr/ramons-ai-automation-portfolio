'use client'

import { useEffect, useRef, useState } from 'react'

import { usePrefersReducedMotion } from '@/components/landing/motion'

/**
 * Real footage behind the hero: a drone drift over the autumn Aokigahara
 * forest toward Mount Fuji (Pixabay #246269, Pixabay Content License — free
 * for commercial use, no attribution required).
 *
 * It sits in the page scene, under the falling leaves and above the painted
 * autumn backdrop, so the leaves still fall over the photograph. Unlike the
 * page video it is shown at full strength: no screen blend, no tone layer.
 * The hero's own `.hero-autumn::before` wash keeps the headline readable.
 *
 * Loading follows the page video's rules: the still is on screen from first
 * paint (it is the hero's largest image), and the footage mounts only after
 * load, from 768px up, when the reader has not asked to save data and does
 * not prefer reduced motion. Phones keep the still.
 */
export function HeroBackdrop({ ready = true }: { ready?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduced = usePrefersReducedMotion()
  const [withVideo, setWithVideo] = useState(false)
  const [playing, setPlaying] = useState(false)

  // Matches the hero's height, which grows past one screen when its copy
  // wraps on a short window, so the footage never ends above the hero's edge.
  useEffect(() => {
    const root = rootRef.current
    const hero = document.querySelector<HTMLElement>('[data-hero-root]')

    if (!root || !hero) return

    const sync = () => root.style.setProperty('--hero-h', `${hero.offsetHeight}px`)
    const observer = new ResizeObserver(sync)

    observer.observe(hero)
    sync()

    return () => observer.disconnect()
  }, [])

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
    const root = rootRef.current
    const video = videoRef.current

    if (!withVideo || !root || !video) return

    let onScreen = true

    const sync = () => {
      if (onScreen && !document.hidden) void video.play().catch(() => undefined)
      else video.pause()
    }

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })

    observer.observe(root)
    document.addEventListener('visibilitychange', sync)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [withVideo])

  return (
    <div
      ref={rootRef}
      className='hero-backdrop pointer-events-none absolute inset-x-0 top-0'
      data-ready={ready || undefined}
      aria-hidden='true'
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
    </div>
  )
}
