'use client'

import { useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

/**
 * Cycling multilingual greeting, carried over from the previous portfolio hero.
 *
 * The non-Latin greetings fall outside Satoshi, so an explicit CJK and
 * Devanagari fallback stack is declared rather than leaving the browser to
 * pick something arbitrary.
 */
const GREETINGS = ['Hello', 'Kumusta', 'こんにちは', 'नमस्ते', '你好', 'Ciao', 'Hola'] as const
const INTERVAL_MS = 2200

const FALLBACK_STACK = [
  'var(--font-satoshi)',
  '"Hiragino Sans"',
  '"Noto Sans JP"',
  '"Noto Sans SC"',
  '"Noto Sans Devanagari"',
  'sans-serif'
].join(', ')

export function GreetingWord({ className = '' }: { className?: string }) {
  const [index, setIndex] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  // The cycle only runs while someone can see it. Reduced-motion readers get
  // the first greeting held still, and scrolling away or hiding the tab stops
  // the timer instead of re-rendering a word nobody is looking at.
  useEffect(() => {
    const el = ref.current

    if (reduced || !el) return

    let timer: number | undefined
    let onScreen = false

    const sync = () => {
      const run = onScreen && !document.hidden

      if (run && timer === undefined) {
        timer = window.setInterval(() => {
          setIndex(prev => (prev + 1) % GREETINGS.length)
        }, INTERVAL_MS)
      } else if (!run && timer !== undefined) {
        window.clearInterval(timer)
        timer = undefined
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })

    observer.observe(el)
    document.addEventListener('visibilitychange', sync)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      window.clearInterval(timer)
    }
  }, [reduced])

  const shift = reduced ? 0 : 24

  return (
    <span
      ref={ref}
      className={`relative inline-flex overflow-hidden align-baseline ${className}`}
      style={{ fontFamily: FALLBACK_STACK }}
    >
      {/* The live region announces each greeting rather than leaving screen
          readers with silently swapping text. */}
      {/* `popLayout` overlaps the outgoing and incoming words. `wait` left the
          slot empty between them, so the heading read ", I'm" for a beat. */}
      <AnimatePresence mode='popLayout' initial={false}>
        <motion.span
          key={GREETINGS[index]}
          initial={{ y: shift, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -shift, opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.3, ease: 'easeInOut' }}
          className='inline-block whitespace-nowrap'
        >
          {GREETINGS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
