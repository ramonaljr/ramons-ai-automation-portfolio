import type { ReactNode } from 'react'

/**
 * Bare passthrough layout for the landing page.
 *
 * The landing page is full-bleed and ships its own nav (MobileNav) and footer,
 * so it deliberately does NOT use `(pages)/layout.tsx` — that one wraps <main>
 * in `max-w-4xl lg:border-x` and injects NavDock/Footer/ScrollProfileToast,
 * all of which would fight a full-width design.
 */
const LandingLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return <main className='flex w-full min-w-0 flex-col'>{children}</main>
}

export default LandingLayout
