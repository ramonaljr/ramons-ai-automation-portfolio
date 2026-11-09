'use client'

import type { ReactNode } from 'react'

/**
 * The films' two robots, carried over from the hand-drawn Storify films and
 * redrawn flat in the site's colours: Dennice, who keeps the front desk, and
 * Leo, who calls it. Plus the desk they meet at. Drawn in SVG so they scale
 * with the stage; every colour comes from film.css, so a robot only says who
 * it is and how it feels.
 */

export type Mood = 'off' | 'normal' | 'puzzled' | 'happy'

export type Who = 'dennice' | 'leo'

const MOODS: Mood[] = ['off', 'normal', 'puzzled', 'happy']

/** Every face is drawn, and the one showing crossfades in as the last goes. */
function Face({ mood, on }: { mood: Mood; on: boolean }) {
  return (
    <g className='rb-mood' data-on={on || undefined}>
      <Features mood={mood} />
    </g>
  )
}

function Features({ mood }: { mood: Mood }) {
  if (mood === 'off') {
    return (
      <g className='rb-face rb-face--off'>
        <path d='M45 69h10M65 69h10' />
        <path d='M56 79h8' />
      </g>
    )
  }

  if (mood === 'happy') {
    return (
      <g className='rb-face'>
        <path d='M45 71q5-7 10 0M65 71q5-7 10 0' />
        <path d='M52 77q8 7 16 0' />
      </g>
    )
  }

  if (mood === 'puzzled') {
    return (
      <g className='rb-face'>
        <g className='rb-eyes'>
          <ellipse cx='50' cy='68' rx='3.6' ry='6' />
          <ellipse cx='70' cy='69' rx='2.6' ry='3.4' />
        </g>
        <path d='M54 80q3-3 6 0t6 0' />
      </g>
    )
  }

  return (
    <g className='rb-face'>
      <g className='rb-eyes'>
        <ellipse cx='50' cy='68' rx='3.6' ry='6' />
        <ellipse cx='70' cy='68' rx='3.6' ry='6' />
      </g>
      <path d='M54 78q6 4 12 0' />
    </g>
  )
}

/** A robot, 120 by 140, standing on its feet at the bottom of the box. */
export function Robot({ who, mood = 'normal', phone = false }: { who: Who; mood?: Mood; phone?: boolean }) {
  return (
    <svg className={`rb rb--${who}`} data-mood={mood} viewBox='0 0 120 140' aria-hidden='true'>
      <ellipse className='rb-shadow' cx='60' cy='135' rx='30' ry='3.5' />
      <path className='rb-limb' d='M47 112v14M73 112v14' />
      <ellipse className='rb-dark' cx='45' cy='129' rx='10' ry='5.5' />
      <ellipse className='rb-dark' cx='75' cy='129' rx='10' ry='5.5' />
      <path className='rb-limb' d='M26 82 13 102' />
      <circle className='rb-dark' cx='13' cy='102' r='6' />
      {phone ? (
        <>
          <path className='rb-limb' d='M94 80 105 58' />
          <rect className='rb-phone' x='99' y='30' width='13' height='27' rx='4' />
          <circle className='rb-dark' cx='105' cy='58' r='6' />
        </>
      ) : (
        <>
          <path className='rb-limb' d='M94 82 107 102' />
          <circle className='rb-dark' cx='107' cy='102' r='6' />
        </>
      )}
      <rect className='rb-body' x='22' y='44' width='76' height='72' rx='26' />
      <ellipse className='rb-shine' cx='38' cy='104' rx='9' ry='4.5' transform='rotate(-28 38 104)' />
      <rect className='rb-screen' x='33' y='54' width='54' height='32' rx='12' />
      {MOODS.map(m => (
        <Face key={m} mood={m} on={m === mood} />
      ))}
      {who === 'dennice' ? (
        <g className='rb-bulb'>
          <path className='rb-limb rb-limb--thin' d='M60 44V31' />
          <circle className='rb-bulb__glow' cx='60' cy='24' r='12' />
          <circle className='rb-bulb__lamp' cx='60' cy='24' r='7' />
        </g>
      ) : (
        <g className='rb-beanie'>
          <path className='rb-beanie__cap' d='M29 52a31 27 0 0 1 62 0z' />
          <rect className='rb-beanie__band' x='27' y='45' width='66' height='10' rx='5' />
          <circle className='rb-beanie__cap' cx='60' cy='22' r='6' />
        </g>
      )}
    </svg>
  )
}

/** The front desk's phone, shaking while it rings. */
export function DeskPhone({ ringing }: { ringing: boolean }) {
  return (
    <svg className='fd-phone' data-ring={ringing || undefined} viewBox='0 0 80 48' aria-hidden='true'>
      <path className='fd-phone__ring' d='M8 14q-5 8 0 16M2 10q-7 12 0 24M72 14q5 8 0 16M78 10q7 12 0 24' />
      <g className='fd-phone__set'>
        <path className='fd-phone__base' d='M22 22h36l6 22a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2z' />
        <rect className='fd-phone__keys' x='31' y='28' width='18' height='10' rx='2' />
        <path className='fd-phone__handset' d='M14 14q0-8 8-8h36q8 0 8 8v4q0 3-3 3h-7q-3 0-3-3v-3H28v3q0 3-3 3h-8q-3 0-3-3z' />
      </g>
    </svg>
  )
}

/** A speech bubble, its tail pointing down at whoever is speaking. */
export function Say({
  on,
  tail,
  className,
  children
}: {
  on: boolean
  tail: 'left' | 'right'
  className: string
  children: ReactNode
}) {
  return (
    <p className={`fd-say fd-say--${tail} ${className}`} data-on={on || undefined}>
      {children}
    </p>
  )
}

/** The voice agent, on the desk's line: a tag with a moving voice. */
export function AgentTag({ on, talking }: { on: boolean; talking: boolean }) {
  return (
    <div className='fd-agent' data-on={on || undefined} data-talking={talking || undefined}>
      <span className='fd-agent__wave' aria-hidden='true'>
        {[0, 1, 2, 3, 4].map(i => (
          <span key={i} />
        ))}
      </span>
      Voice agent
    </div>
  )
}
