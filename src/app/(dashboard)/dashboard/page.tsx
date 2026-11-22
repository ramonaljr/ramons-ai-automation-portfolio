import type { Metadata } from 'next'

import { Dashboard } from '@/components/dashboard/dashboard'

export const metadata: Metadata = { title: 'Dashboard' }

const DashboardPage = () => <Dashboard />

export default DashboardPage
