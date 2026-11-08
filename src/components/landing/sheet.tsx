'use client'

import './sheet.css'

import { useInView } from '@/components/landing/motion'

/**
 * The drafting-sheet language shared by About, Services and Process.
 *
 * Benchmarked on Studio Okafor (2026-11-08): each of the three sections opens
 * like a sheet in a drawing set, with a hairline that draws itself across the
 * page, a sheet number and a title in mono caps. The landing page's taste rules
 * otherwise ban numbered labels and hairlines; they are allowed inside these
 * three sections only, by Ramon's choice.
 */

/** Two-digit sheet and row numbers: 01, 02 … */
export const pad = (n: number) => String(n).padStart(2, '0')

/** How many sheets the landing page numbers: About, Services, Process. */
export const SHEETS = 3

/**
 * The header rule over a section. Decorative metadata: the section's own
 * heading follows it and carries the meaning, so screen readers skip this.
 */
export function SheetHeader({ number, title }: { number: number; title: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4)

  return (
    <div ref={ref} className='sheet-head' data-in={inView || undefined} aria-hidden='true'>
      <span className='sheet-head-n'>{pad(number)}</span>
      <span className='sheet-head-t'>{title}</span>
      <span className='sheet-head-s'>
        Sheet {pad(number)} / {pad(SHEETS)}
      </span>
    </div>
  )
}

/**
 * The open/close mark at the end of an index row: a plus whose upright folds
 * flat when the row opens.
 */
export function SheetPlus() {
  return <span className='sheet-plus' aria-hidden='true' />
}
