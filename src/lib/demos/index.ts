import type { DemoBundle } from '@/lib/demos/types'

/**
 * Which projects have an interactive demo, and where its data lives.
 *
 * Loaded on demand: a layout is several hundred lines of JSON, and nobody who
 * never opens that project's build should download it.
 */
const DEMOS: Record<string, () => Promise<DemoBundle>> = {
  'airtable-crm-lead-engagement': () =>
    import('@/lib/demos/airtable-crm-lead-engagement').then(m => m.airtableCrmLeadEngagement),
  'gmail-attachment-filing': () => import('@/lib/demos/gmail-attachment-filing').then(m => m.gmailAttachmentFiling),
  'order-stock-check': () => import('@/lib/demos/order-stock-check').then(m => m.orderStockCheck),
  'solar-lead-scoring-follow-up': () =>
    import('@/lib/demos/solar-lead-scoring-follow-up').then(m => m.solarLeadScoringFollowUp),
  'hotel-employee-onboarding': () =>
    import('@/lib/demos/hotel-employee-onboarding').then(m => m.hotelEmployeeOnboarding),
  'ai-unpaid-invoice-reminders': () =>
    import('@/lib/demos/ai-unpaid-invoice-reminders').then(m => m.aiUnpaidInvoiceReminders),
  'ai-prospecting-apollo': () => import('@/lib/demos/ai-prospecting-apollo').then(m => m.aiProspectingApollo),
  'ai-invoice-processing-approval': () =>
    import('@/lib/demos/ai-invoice-processing-approval').then(m => m.aiInvoiceProcessingApproval),
  'ai-appointment-setter': () => import('@/lib/demos/ai-appointment-setter').then(m => m.aiAppointmentSetter),
  'hr-evaluation-assistant': () => import('@/lib/demos/hr-evaluation-assistant').then(m => m.hrEvaluationAssistant),
  'ai-customer-support-agent': () => import('@/lib/demos/ai-customer-support-agent').then(m => m.aiCustomerSupportAgent)
}

export const hasDemo = (slug: string) => slug in DEMOS

export const loadDemo = (slug: string) => DEMOS[slug]?.()
