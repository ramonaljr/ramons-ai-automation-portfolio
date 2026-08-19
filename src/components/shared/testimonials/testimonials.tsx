'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { ArrowLeftIcon, ArrowRightIcon, QuoteIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

// Component Imports
import Eyebrow from '@/components/shared/eyebrow/eyebrow'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Principle = {
  quote: string
  name: string
  role: string
  avatar: string
}

const PRINCIPLES: Principle[] = [
  {
    quote:
      "Process-first mapping before code. Invoicing, AP/AR, and GL reconciliations fail when developers don't understand the accounting rules. I map out the SOPs, edge cases, and chart of accounts first.",
    name: '1. Domain-Driven Process Mapping',
    role: 'Accounting logic & business rules mapped before building',
    avatar: '/images/features/logo-01.webp'
  },
  {
    quote:
      'Deterministic math, probabilistic AI. Critical calculations, ledger balances, and data routes remain deterministic in code. LLMs (Claude & OpenAI) are reserved for unstructured document parsing, classification, and extraction.',
    name: '2. Deterministic Reliability + LLM Intelligence',
    role: 'Zero hallucinations on financial numbers and ledgers',
    avatar: '/images/features/logo-02.webp'
  },
  {
    quote:
      'Fail-safe architecture with human oversight. Every production workflow includes try/catch error branches, automated alert notifications, and human-in-the-loop review gates for high-value transactions.',
    name: '3. Fail-Safe & Human-in-the-Loop Design',
    role: 'Workflows documented so teams can easily operate them',
    avatar: '/images/features/logo-03.webp'
  }
]

const TILE_SIZE = 100
const TILE_GAP = 8
const BLOCK_HEIGHT = TILE_SIZE * 3 + TILE_GAP * 2
const SHADOW_ROOM = 60
const VIEWPORT_HEIGHT = BLOCK_HEIGHT + SHADOW_ROOM
const SIDE_ROOM = 40
const VIEWPORT_WIDTH = TILE_SIZE + SIDE_ROOM * 2
const SIDE_COLUMN_TILES = 5
const COLUMN_STEP = TILE_SIZE + TILE_GAP
const ROW_OFFSET = COLUMN_STEP / 2

const TILE_CLASS = 'bg-card size-25 rounded-md border border-border/70 shadow-xs'

const slideVariants = {
  enter: (direction: number) => ({ y: direction > 0 ? 32 : -32, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (direction: number) => ({ y: direction > 0 ? -32 : 32, opacity: 0 })
}

const sideColumnVariants = {
  initial: { y: ROW_OFFSET + COLUMN_STEP },
  animate: { y: ROW_OFFSET },
  exit: { y: ROW_OFFSET - COLUMN_STEP }
}

const MiddleColumnBlock = ({ avatar, name }: { avatar: string; name: string }) => (
  <div className='mx-auto w-fit space-y-2'>
    <div className={TILE_CLASS} />
    <div className='shadow-realistic relative size-25 rounded-md p-2 bg-card flex items-center justify-center'>
      <img src={avatar} alt={name} className='size-12 object-contain' />
    </div>
    <div className={TILE_CLASS} />
  </div>
)

type TestimonialsProps = {
  showBorder?: boolean
}

const Testimonials = ({ showBorder = true }: TestimonialsProps) => {
  const [index, setIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = (nextDirection: number) => {
    setPreviousIndex(index)
    setIndex(current => (current + nextDirection + PRINCIPLES.length) % PRINCIPLES.length)
    setDirection(nextDirection)
  }

  const principle = PRINCIPLES[index]
  const outgoing = PRINCIPLES[previousIndex]

  return (
    <section id='testimonials' className={cn('py-8 sm:py-16 lg:py-24', showBorder && 'border-b')}>
      <div className='mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-16 lg:px-10.5'>
        <div className='space-y-2'>
          <Eyebrow>Core Principles</Eyebrow>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>
            how I architect reliable, production-grade automations
          </h2>
        </div>

        <div className='grid grid-cols-1 items-center gap-6 sm:grid-cols-[323px_1fr] sm:gap-8'>
          <div className='relative mx-auto h-78 w-full mask-[radial-gradient(ellipse_at_center,black_25%,transparent_80%)] sm:mx-0'>
            <div className='absolute inset-0 grid h-auto grid-cols-3 content-center gap-3 max-sm:mx-auto max-sm:w-fit'>
              <AnimatePresence initial={false}>
                <motion.div
                  key={`left-${index}`}
                  style={{ gridColumn: 1, gridRow: 1, alignSelf: 'center' }}
                  variants={sideColumnVariants}
                  initial='initial'
                  animate='animate'
                  exit='exit'
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className='space-y-2'
                >
                  {Array.from({ length: SIDE_COLUMN_TILES }, (_, tileIndex) => (
                    <div key={tileIndex} className={TILE_CLASS} />
                  ))}
                </motion.div>
              </AnimatePresence>

              <div
                className='relative'
                style={{ gridColumn: 2, gridRow: 1, alignSelf: 'center', width: TILE_SIZE, height: VIEWPORT_HEIGHT }}
              >
                <div
                  className='absolute top-0 mask-[linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]'
                  style={{
                    left: '50%',
                    transform: `translate(-50%, ${SHADOW_ROOM / 2}px)`,
                    width: VIEWPORT_WIDTH,
                    height: VIEWPORT_HEIGHT
                  }}
                >
                  <motion.div
                    key={index}
                    initial={{ y: -VIEWPORT_HEIGHT }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <MiddleColumnBlock avatar={principle.avatar} name={principle.name} />
                    <div style={{ marginTop: SHADOW_ROOM }}>
                      <MiddleColumnBlock avatar={outgoing.avatar} name={outgoing.name} />
                    </div>
                  </motion.div>
                </div>
              </div>

              <AnimatePresence initial={false}>
                <motion.div
                  key={`right-${index}`}
                  style={{ gridColumn: 3, gridRow: 1, alignSelf: 'center' }}
                  variants={sideColumnVariants}
                  initial='initial'
                  animate='animate'
                  exit='exit'
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className='space-y-2'
                >
                  {Array.from({ length: SIDE_COLUMN_TILES }, (_, tileIndex) => (
                    <div key={tileIndex} className={TILE_CLASS} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className='overflow-hidden'>
            <div className='mb-8'>
              <QuoteIcon className='fill-accent size-9 rotate-180 text-transparent' />
            </div>

            <AnimatePresence initial={false} custom={direction} mode='wait'>
              <motion.div
                key={index}
                custom={direction}
                variants={slideVariants}
                initial='enter'
                animate='center'
                exit='exit'
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className='space-y-5'
              >
                <p className='text-primary max-w-lg text-xl font-medium lg:text-[24px] leading-relaxed'>{principle.quote}</p>
                <div>
                  <p className='text-base font-semibold text-foreground'>{principle.name}</p>
                  <p className='text-muted-foreground text-sm'>{principle.role}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className='mt-6 flex gap-3'>
              <Button
                onClick={() => goTo(-1)}
                aria-label='Previous testimonial'
                variant='outline'
                size='icon'
                className='hover:border-accent/30 dark:hover:border-accent/30 text-accent hover:bg-accent/10 dark:hover:bg-accent/10 hover:text-accent flex items-center justify-center rounded-full border transition-colors'
              >
                <ArrowLeftIcon className='size-4' />
              </Button>
              <Button
                onClick={() => goTo(1)}
                aria-label='Next testimonial'
                variant='outline'
                size='icon'
                className='hover:border-accent/30 dark:hover:border-accent/30 text-accent hover:bg-accent/10 dark:hover:bg-accent/10 hover:text-accent flex items-center justify-center rounded-full border transition-colors'
              >
                <ArrowRightIcon className='size-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
