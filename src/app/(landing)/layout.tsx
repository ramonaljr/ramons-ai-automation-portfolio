import type { ReactNode } from 'react'

import { ThemeProvider } from '@/components/theme-provider'

/**
 * Bare passthrough layout for the landing page.
 *
 * The landing page is full-bleed and ships its own nav (MobileNav) and footer,
 * so it deliberately does NOT use `(pages)/layout.tsx` — that one wraps <main>
 * in `max-w-4xl lg:border-x` and injects NavDock/Footer/ScrollProfileToast,
 * all of which would fight a full-width design.
 */
const LandingLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <ThemeProvider attribute='class' forcedTheme='dark' enableSystem={false} disableTransitionOnChange>
      {/* `dark` is present in server HTML for a dark first paint; forcedTheme
          keeps the root in sync after hydration even when this browser has an
          older `light` preference saved by next-themes. */}
      <main className='dark flex w-full min-w-0 flex-col'>{children}</main>
    </ThemeProvider>
  )
}

export default LandingLayout
