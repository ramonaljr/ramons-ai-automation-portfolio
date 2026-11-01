'use client'

// Third-party Imports
import { useEffect, useState } from 'react'

// Component Imports
import ContactForm from '@/components/contact/contact-form/contact-form'
import { CalendlyEmbed } from '@/components/contact/calendly-embed'

/**
 * The booking card on /contact. Arriving from the landing page's calendar, the
 * URL carries the slot already picked there (`?date=&time=`), and the form
 * books exactly that slot through n8n; showing Calendly instead would drop it.
 * Everyone else gets Calendly.
 *
 * Read from location rather than useSearchParams so /contact stays static,
 * the same as the form itself.
 */
export function ContactBooking() {
  // Null until mounted, so neither the form nor Calendly's frame starts loading
  // for a visitor who will not see it.
  const [handoff, setHandoff] = useState<boolean | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHandoff(params.has('date') && params.has('time'))
  }, [])

  if (handoff === null) return <div className='min-h-[700px]' />

  return handoff ? <ContactForm /> : <CalendlyEmbed />
}
