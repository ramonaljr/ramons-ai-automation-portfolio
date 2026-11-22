/** The R monogram from the favicon, drawn in the site's accent. */
export function DashboardMark() {
  return (
    <svg viewBox='0 0 64 64' aria-hidden='true'>
      <rect width='64' height='64' rx='14' fill='oklch(0.95 0.012 40)' />
      <g fill='none' stroke='var(--accent)' strokeLinecap='round' strokeLinejoin='round'>
        <path strokeWidth='3.5' d='M17 9H9v8M47 9h8v8M9 47v8h8M55 47v8h-8' />
        <path strokeWidth='4' d='M22 47V18h13c8 0 13 4 13 11 0 6-4 10-11 11l12 9' />
      </g>
      <circle cx='22' cy='18' r='2.6' fill='var(--accent)' />
      <circle cx='37' cy='40' r='2.6' fill='var(--accent)' />
      <circle cx='49' cy='49' r='2.6' fill='var(--accent)' />
    </svg>
  )
}
