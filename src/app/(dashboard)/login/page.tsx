import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { LoginForm } from '@/components/dashboard/login-form'

export const metadata: Metadata = { title: 'Login' }

// The desk's welcome screen is set in Inter at light weights (350), so the
// login that mirrors it loads Inter too. Only this page pays for it.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const LoginPage = () => (
  <div className={inter.variable}>
    <LoginForm />
  </div>
)

export default LoginPage
