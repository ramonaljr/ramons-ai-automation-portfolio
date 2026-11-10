import { inkPath, type Pt } from '@/components/landing/film/sketch'

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
 * One inked shape, as the hand-drawn films draw it, held still. The first pass
 * takes the shape's fill; later passes are a fainter second stroke. Fill and
 * stroke colours come from `className`.
 *
 * One frame, not the hand-drawn films' three boiling at eight a second: in a
 * live page that redrew every line in the film eight times a second, which
 * read as the whole film flickering, and Chrome on a Mac could flash a frame
 * blank between two copies.
 */
export function Ink({ pts, seed, amp, closed, passes = 2, className }: Props) {
  return (
    <g className={className ? `ink ${className}` : 'ink'}>
      <g className='ink__f'>
        {Array.from({ length: passes }, (_, pass) => (
          <path key={pass} d={inkPath(pts, { seed, amp, closed, boil: 0, pass })} />
        ))}
      </g>
    </g>
  )
}
