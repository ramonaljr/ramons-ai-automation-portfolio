'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

/**
 * Cycling multilingual greeting, carried over from the previous portfolio hero.
 *
 * The non-Latin greetings fall outside IBM Plex Sans, so an explicit CJK and
 * Devanagari fallback stack is declared rather than leaving the browser to
 * pick something arbitrary.
 */
const GREETINGS = ['Hello', 'Kumusta', 'こんにちは', 'नमस्ते', '你好', 'Ciao', 'Hola'] as const
const INTERVAL_MS = 2200

const FALLBACK_STACK = [
  'var(--font-ibm-plex)',
  '"IBM Plex Sans"',
  '"Hiragino Sans"',
  '"Noto Sans JP"',
  '"Noto Sans SC"',
  '"Noto Sans Devanagari"',
  'sans-serif',
].join(', ')

export function GreetingWord({ className = '' }: { className?: string }) {
  const [index, setIndex] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % GREETINGS.length)
    }, INTERVAL_MS)

    return () => clearInterval(timer)
  }, [])

  const shift = reduced ? 0 : 24

  return (
    <span
      className={`inline-flex overflow-hidden align-baseline ${className}`}
      style={{ fontFamily: FALLBACK_STACK }}
    >
      {/* The live region announces each greeting rather than leaving screen
          readers with silently swapping text. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={GREETINGS[index]}
          initial={{ y: shift, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -shift, opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.3, ease: 'easeInOut' }}
          className="inline-block whitespace-nowrap"
        >
          {GREETINGS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
