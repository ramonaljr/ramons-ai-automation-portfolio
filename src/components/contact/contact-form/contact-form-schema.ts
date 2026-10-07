import { z } from 'zod'

import { SERVICES } from '@/lib/portfolio'

/** Built from SERVICES, so a renamed service cannot leave the dropdown stale. */
export const SERVICE_OPTIONS = [
  'Free 30-minute call',
  ...SERVICES.map(service => service.title),
  'Something else'
]

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  service: z.string().min(1, 'Please select a service.'),
  message: z.string().min(10, 'Message must be at least 10 characters.')
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
