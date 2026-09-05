'use client'

import { useEffect, useRef, useState } from 'react'

import { READABLE } from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'
import type { Tool } from '@/lib/portfolio'
import { TOOLS_ROW_1, TOOLS_ROW_2 } from '@/lib/portfolio'

/**
 * Logos are monochrome simple-icons SVGs. Painting them through a CSS mask
 * lets a single file carry any brand colour, which an <img> cannot do.
 * Tools with no logo file fall back to a monogram badge.
 */
function ToolMark({ tool }: { tool: Tool }) {
  if (!tool.slug) {
    return (
      <span
        aria-hidden='true'
        className='text-ground flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[12px] font-semibold'
        style={{ backgroundColor: tool.color }}
      >
        {tool.name.charAt(0)}
      </span>
    )
  }

  const url = `url(/images/tools/${tool.slug}.svg)`

  return (
    <span
      aria-hidden='true'
      className='h-[22px] w-[22px] shrink-0'
      style={{
        backgroundColor: tool.color,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center'
      }}
    />
  )
}

function Pill({ tool }: { tool: Tool }) {
  return (
    <span className='border-rule bg-surface hover:bg-surface-raised hover:border-rule-strong flex shrink-0 items-center gap-2.5 rounded-full border px-5 py-3 transition-colors duration-300'>
      <ToolMark tool={tool} />
      <span className='text-ink-2 text-[14px] whitespace-nowrap'>{tool.name}</span>
    </span>
  )
}

function Row({ tools, reverse = false, duration }: { tools: Tool[]; reverse?: boolean; duration: number }) {
  return (
    <div className='group flex overflow-hidden'>
      {/* The track is duplicated so the -50% translation loops seamlessly. */}
      {[0, 1].map(copy => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className='marquee-track flex shrink-0 gap-3 pr-3 group-hover:[animation-play-state:paused]'
          style={{
            animation: `${reverse ? 'marquee-reverse' : 'marquee'} ${duration}s linear infinite`
          }}
        >
          {tools.map(t => (
            <Pill key={`${copy}-${t.name}`} tool={t} />
          ))}
        </div>
      ))}
    </div>
  )
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current

    if (!el) return

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true)
      },
      { threshold }
    )

    obs.observe(el)

    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

export function ToolStackSection() {
  const { ref, inView } = useInView(0.2)

  return (
    <section id='stack' className='border-rule overflow-hidden border-t py-32'>
      <div
        ref={ref}
        className={`px-6 md:px-12 lg:px-20 ${READABLE}`}
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)'
        }}
      >
        <SectionIntro
          tag='TOOL STACK'
          margin=''
          titleClassName='mt-6 text-[clamp(2rem,4vw,3.25rem)]'
          title='Everything it has to talk to.'
          blurb='The platforms, models and business systems these workflows run on and connect into.'
        />
      </div>

      {/* Marquee rows. Edges fade out so pills enter and leave rather than
          appearing to be clipped by the viewport. */}
      <div
        className='mt-14 flex flex-col gap-3'
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
        }}
      >
        <Row tools={TOOLS_ROW_1} duration={46} />
        <Row tools={TOOLS_ROW_2} duration={58} reverse />
      </div>
    </section>
  )
}
