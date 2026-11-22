import type { Metadata } from 'next'

import { LoginForm } from '@/components/dashboard/login-form'

export const metadata: Metadata = { title: 'Login' }

const LoginPage = () => <LoginForm />

export default LoginPage
