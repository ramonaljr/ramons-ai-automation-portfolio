'use client'

import { useEffect, useRef } from 'react'

import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'

import { usePrefersReducedMotion } from '@/components/landing/motion'

/** A three-act background: manual inputs become a route, then a running system. */
export function ScrollAtmosphere() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const pointer = useMotionValue(0)
  const pointerSpring = useSpring(pointer, { stiffness: 65, damping: 22, mass: 0.8 })
  const inputOpacity = useTransform(scrollYProgress, [0, 0.06, 0.27, 0.38], [0.9, 1, 0.72, 0])
  const inputY = useTransform(scrollYProgress, [0, 0.38], ['2vh', '-18vh'])
  const routeOpacity = useTransform(scrollYProgress, [0.2, 0.36, 0.66, 0.78], [0, 0.9, 0.72, 0])
  const routeScale = useTransform(scrollYProgress, [0.2, 0.68], [0.78, 1.08])
  const outcomeOpacity = useTransform(scrollYProgress, [0.62, 0.76, 1], [0, 0.9, 0.68])
  const outcomeScale = useTransform(scrollYProgress, [0.62, 1], [0.68, 1.12])
  const signalY = useTransform(scrollYProgress, [0.1, 0.88], ['-16vh', '108vh'])
  const pointerX = useTransform(pointerSpring, [-1, 1], [-22, 22])

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
      <div className='story-atmosphere sticky top-0 h-screen overflow-hidden'>
        <div className='story-spine'>
          <motion.span className='story-signal' style={reduced ? undefined : { y: signalY }} />
        </div>

        <motion.div
          className='story-chapter story-chapter-input absolute inset-0'
          style={reduced ? undefined : { opacity: inputOpacity, y: inputY, x: pointerX }}
        >
          <span className='story-kicker'>01 / THE OLD WAY</span>
          <span className='story-fragment story-fragment-a'>COPY</span>
          <span className='story-fragment story-fragment-b'>CHECK</span>
          <span className='story-fragment story-fragment-c'>CHASE</span>
          <span className='story-fragment story-fragment-d'>REPEAT</span>
        </motion.div>

        <motion.div
          className='story-chapter story-chapter-route absolute inset-0'
          style={reduced ? undefined : { opacity: routeOpacity, scale: routeScale, x: pointerX }}
        >
          <span className='story-kicker'>02 / CONNECT THE WORK</span>
          <div className='story-route story-route-a'>
            <i />
            <i />
            <i />
          </div>
          <div className='story-route story-route-b'>
            <i />
            <i />
          </div>
          <div className='story-route-core'>
            <span>IF</span>
            <strong>THEN</strong>
          </div>
        </motion.div>

        <motion.div
          className='story-chapter story-chapter-outcome absolute inset-0'
          style={reduced ? undefined : { opacity: outcomeOpacity, scale: outcomeScale, x: pointerX }}
        >
          <span className='story-kicker'>03 / TIME RETURNED</span>
          <div className='story-outcome-ring story-outcome-ring-a' />
          <div className='story-outcome-ring story-outcome-ring-b' />
          <div className='story-outcome-core'>
            <i />
            RUNNING
          </div>
        </motion.div>
      </div>
    </div>
  )
}
