'use client'

import { useEffect, useRef } from 'react'

import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'

import { usePrefersReducedMotion } from '@/components/landing/motion'

/**
 * Slow, scroll-linked geometry behind the portfolio journey. The constellation
 * supplies local motion; these much larger forms supply camera movement, so a
 * long page feels like one continuous scene rather than repeated card grids.
 */
export function ScrollAtmosphere() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const pointer = useMotionValue(0)
  const pointerSpring = useSpring(pointer, { stiffness: 65, damping: 22, mass: 0.8 })
  const firstY = useTransform(scrollYProgress, [0, 1], ['18vh', '-34vh'])
  const secondY = useTransform(scrollYProgress, [0, 1], ['-24vh', '28vh'])
  const firstRotate = useTransform(scrollYProgress, [0, 1], [0, 95])
  const secondRotate = useTransform(scrollYProgress, [0, 1], [0, -70])
  const beamX = useTransform(scrollYProgress, [0, 0.5, 1], ['-24vw', '18vw', '-8vw'])
  const firstX = useTransform(pointerSpring, [-1, 1], [-28, 28])
  const secondX = useTransform(pointerSpring, [-1, 1], [18, -18])

  useEffect(() => {
    if (reduced) return

    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      pointer.set((event.clientX / window.innerWidth - 0.5) * 2)
    }

    const reset = () => pointer.set(0)

    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', reset)

    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', reset)
    }
  }, [pointer, reduced])

  return (
    <div ref={ref} className='pointer-events-none absolute inset-0 z-1 overflow-clip' aria-hidden='true'>
      <div className='sticky top-0 h-screen overflow-hidden'>
        <motion.div
          className='scroll-orbit scroll-orbit-a absolute -top-[20vw] -right-[16vw] h-[58vw] w-[58vw] rounded-full'
          style={reduced ? undefined : { x: firstX, y: firstY, rotate: firstRotate }}
        />
        <motion.div
          className='scroll-orbit scroll-orbit-b absolute -bottom-[24vw] -left-[18vw] h-[64vw] w-[64vw] rounded-full'
          style={reduced ? undefined : { x: secondX, y: secondY, rotate: secondRotate }}
        />
        <motion.div
          className='scroll-light-beam absolute top-[-25%] left-1/2 h-[150%] w-[20vw] -translate-x-1/2 rotate-[18deg]'
          style={reduced ? undefined : { x: beamX }}
        />
      </div>
    </div>
  )
}
