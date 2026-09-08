'use client'

import { useEffect, useState } from 'react'

/**
 * The hero's cinematic data current. The generated artwork carries the depth;
 * this SVG layer adds live signal traffic so the scene feels like an operating
 * system rather than a still illustration.
 */
export function SaasFlowField() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className={`data-current-field absolute inset-0 overflow-hidden ${mounted ? 'is-ready' : ''}`} aria-hidden='true'>
      <img className='data-current-art' src='/images/landing/data-current.jpg' alt='' width='1680' height='945' />
      <div className='data-current-bloom' />

      <svg className='data-current-map' viewBox='0 0 1600 900' preserveAspectRatio='xMidYMid slice'>
        <defs>
          <filter id='current-glow' x='-100%' y='-100%' width='300%' height='300%'>
            <feGaussianBlur stdDeviation='5' result='blur' />
            <feMerge>
              <feMergeNode in='blur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>
          <path id='current-a' d='M-80 790C250 625 520 800 820 720S1280 505 1680 575' />
          <path id='current-b' d='M-80 690C290 540 520 690 870 625S1280 420 1680 485' />
          <path id='current-c' d='M-80 855C330 720 610 900 960 795S1370 625 1680 670' />
        </defs>

        <g className='data-current-traces'>
          <use href='#current-a' />
          <use href='#current-b' />
          <use href='#current-c' />
        </g>

        {[0, 1, 2, 3].map(index => (
          <circle key={`a-${index}`} className='data-current-particle' r={index % 2 ? 3 : 4} filter='url(#current-glow)'>
            <animateMotion dur={`${9 + index * 1.6}s`} begin={`${index * -2.4}s`} repeatCount='indefinite'>
              <mpath href='#current-a' />
            </animateMotion>
          </circle>
        ))}

        {[0, 1, 2].map(index => (
          <rect key={`b-${index}`} className='data-current-packet' width='12' height='4' rx='2' filter='url(#current-glow)'>
            <animateMotion dur={`${11 + index * 1.8}s`} begin={`${index * -3.3}s`} repeatCount='indefinite' rotate='auto'>
              <mpath href='#current-b' />
            </animateMotion>
          </rect>
        ))}

        {[0, 1, 2].map(index => (
          <circle key={`c-${index}`} className='data-current-particle data-current-particle-soft' r='3'>
            <animateMotion dur={`${12 + index * 1.4}s`} begin={`${index * -3.8}s`} repeatCount='indefinite'>
              <mpath href='#current-c' />
            </animateMotion>
          </circle>
        ))}
      </svg>

      <div className='data-current-side-note data-current-side-note-left'>01 / THE CURRENT</div>
      <div className='data-current-side-note data-current-side-note-right'>SIGNAL → SYSTEM → RESULT</div>
      <div className='data-current-veil' />
    </div>
  )
}
