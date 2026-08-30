import type { ReactNode } from 'react'

import { Geist_Mono, Delicious_Handrawn, IBM_Plex_Sans, Courier_Prime } from 'next/font/google'
import localFont from 'next/font/local'
import type { Metadata } from 'next'

import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import CustomCursor from '@/components/layout/custom-cursor'
import EdgeBlur from '@/components/layout/edge-blur'

import { cn } from '@/lib/utils'
import { SITE_URL } from '@/lib/site'

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

// Landing page display face — used by the hero headline and stat figures.
const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-ibm-plex',
  weight: ['300', '400', '500', '600'],
  subsets: ['latin']
})

// Landing page `font-pixel` face — see --font-pixel in globals.css.
const courierPrime = Courier_Prime({
  variable: '--font-courier-prime',
  weight: ['400', '700'],
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
    template: '%s - Ramon Vallejera Jr.',
    default: 'Ramon A. Vallejera, Jr. — AI Automation Specialist'
  },
  description:
    'End-to-end business automation. I build production n8n, Zapier and Make workflows, AI agents, and RAG knowledge systems that remove manual work across intake, onboarding, approvals, reporting and reconciliation — backed by 10 years running those operations and an MBA.',
  robots: 'index,follow',
  keywords: [
    'AI Automation Specialist',
    'n8n developer',
    'Zapier expert',
    'Make.com automation',
    'workflow automation consultant',
    'Claude API integration',
    'OpenAI automation',
    'RAG knowledge base',
    'AI voice agent',
    'finance process automation',
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
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: {
      template: '%s - Ramon Vallejera Jr.',
      default: 'Ramon A. Vallejera, Jr. — AI Automation Specialist'
    },
    description:
      'End-to-end business automation on n8n, Zapier and Make — AI agents, LLM integrations and RAG knowledge systems that take manual work out of intake, approvals, reporting and reconciliation.',
    type: 'website',
    siteName: 'Ramon A. Vallejera, Jr.',
    url: SITE_URL,
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
      default: 'Ramon A. Vallejera, Jr. — AI Automation Specialist'
    },
    description:
      'End-to-end business automation on n8n, Zapier and Make — AI agents, LLM integrations and RAG knowledge systems that take manual work out of intake, approvals, reporting and reconciliation.'
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
        ibmPlexSans.variable,
        courierPrime.variable,
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
