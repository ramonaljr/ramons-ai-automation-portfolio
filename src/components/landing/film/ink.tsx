import { BOILS, inkPath, type Pt } from '@/components/landing/film/sketch'

type Props = {
  pts: readonly Pt[]
  seed: number
  amp?: number
  closed?: boolean

  /** Lines drawn over each other, as the engine does: 2 for outlines, 1 for thin limbs. */
  passes?: number
  className?: string
}

/**
 * One inked shape, as the hand-drawn films draw it: three frames of the same
 * line, shown in turn eight times a second (film.css, "Ink"). The first pass
 * takes the shape's fill; later passes are a fainter second stroke. Fill and
 * stroke colours come from `className`.
 */
export function Ink({ pts, seed, amp, closed, passes = 2, className }: Props) {
  return (
    <g className={className ? `ink ${className}` : 'ink'}>
      {BOILS.map(boil => (
        <g key={boil} className='ink__f' data-f={boil}>
          {Array.from({ length: passes }, (_, pass) => (
            <path key={pass} d={inkPath(pts, { seed, amp, closed, boil, pass })} />
          ))}
        </g>
      ))}
    </g>
  )
}
