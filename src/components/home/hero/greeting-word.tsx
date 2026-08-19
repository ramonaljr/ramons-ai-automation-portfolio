'use client'

// React Imports
import { useEffect, useState } from 'react'

// Third-party Imports
import { AnimatePresence, motion } from 'motion/react'

const GREETINGS = ['Hello', 'こんにちは', 'नमस्ते', '你好', 'Ciao']
const INTERVAL_MS = 2200

const GreetingWord = () => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % GREETINGS.length)
    }, INTERVAL_MS)

    return () => clearInterval(timer)
  }, [])

  return (
    <span className='inline-flex overflow-hidden align-baseline'>
      <AnimatePresence mode='wait' initial={false}>
        <motion.span
          key={GREETINGS[index]}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -24, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className='inline-block whitespace-nowrap'
        >
          {GREETINGS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default GreetingWord
