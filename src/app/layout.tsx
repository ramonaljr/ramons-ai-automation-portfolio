import type { ReactNode } from 'react'

import { Geist_Mono, Delicious_Handrawn } from 'next/font/google'
import localFont from 'next/font/local'
import type { Metadata } from 'next'

import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import CustomCursor from '@/components/layout/custom-cursor'
import EdgeBlur from '@/components/layout/edge-blur'

import { cn } from '@/lib/utils'

import './globals.css'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

const deliciousHandrawn = Delicious_Handrawn({
  variable: '--font-delicious-handrawn',
  weight: '400',
  subsets: ['latin']
})

const satoshi = localFont({
  variable: '--font-satoshi',
  display: 'swap',
  src: [
    { path: '../assets/fonts/satoshi/satoshi-400.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/satoshi/satoshi-500.woff2', weight: '500', style: 'normal' },
    { path: '../assets/fonts/satoshi/satoshi-700.woff2', weight: '700', style: 'normal' },
    { path: '../assets/fonts/satoshi/satoshi-900.woff2', weight: '900', style: 'normal' }
  ]
})

export const metadata: Metadata = {
  title: {
    template: '%s - Ramon Vallejera Jr., MBA',
    default: 'Ramon A. Vallejera, Jr., MBA — AI Automation Specialist'
  },
  description:
    'Portfolio of Ramon A. Vallejera, Jr., MBA — AI Automation Specialist based in Cagayan de Oro, Philippines. 10 years of finance & accounting domain expertise combined with n8n, Claude, OpenAI, and Python business workflow automations.',
  robots: 'index,follow',
  keywords: [
    'AI Automation Specialist',
    'n8n AI Workflows',
    'Financial Process Automation',
    'Claude API',
    'OpenAI Automation',
    'Accounting Automation',
    'Cagayan de Oro',
    'Philippines'
  ],
  icons: {
    icon: [
      {
        url: '/favicon/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png'
      },
      {
        url: '/favicon/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        url: '/favicon/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon'
      }
    ],
    apple: [
      {
        url: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ],
    other: [
      {
        url: '/favicon/android-chrome-192x192.png',
        rel: 'icon',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        url: '/favicon/android-chrome-512x512.png',
        rel: 'icon',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  },
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}`),
  openGraph: {
    title: {
      template: '%s - Ramon Vallejera Jr.',
      default: 'Ramon A. Vallejera, Jr. - AI Automation Engineer'
    },
    description:
      'Portfolio of Ramon A. Vallejera, Jr. — AI Automation Engineer based in the Philippines specializing in autonomous agents, intelligent workflow automations, and custom LLM solutions.',
    type: 'website',
    siteName: 'Ramon A. Vallejera, Jr.',
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}`,
    images: [
      {
        url: '/images/og-image.png',
        type: 'image/png',
        width: 1200,
        height: 630,
        alt: "Ramon's AI Automation Portfolio"
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      template: '%s - Ramon Vallejera Jr.',
      default: 'Ramon A. Vallejera, Jr. - AI Automation Engineer'
    },
    description:
      'Portfolio of Ramon A. Vallejera, Jr. — AI Automation Engineer based in the Philippines specializing in autonomous agents, intelligent workflow automations, and custom LLM solutions.'
  }
}

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <html
      lang='en'
      className={cn(
        geistMono.variable,
        satoshi.variable,
        deliciousHandrawn.variable,
        'flex min-h-full w-full scroll-smooth antialiased'
      )}
      suppressHydrationWarning
    >
      <body className='flex min-h-full w-full flex-auto flex-col'>
        <ThemeProvider attribute='class' enableSystem={false} disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
          <EdgeBlur />
          <Toaster />
          <CustomCursor />
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout
