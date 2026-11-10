'use client'

import { useEffect, useState, type ComponentType } from 'react'

import { AppointmentSetterFilm } from '@/components/landing/film/films/ai-appointment-setter'
import { InvoiceApprovalFilm } from '@/components/landing/film/films/ai-invoice-processing-approval'
import { UnpaidRemindersFilm } from '@/components/landing/film/films/ai-unpaid-invoice-reminders'
import { OrderStockFilm } from '@/components/landing/film/films/order-stock-check'
import { LeadScoringFilm } from '@/components/landing/film/films/solar-lead-scoring-follow-up'
import { ProspectingFilm } from '@/components/landing/film/films/ai-prospecting-apollo'
import type { LiveFilmSlug } from '@/components/landing/film/live-films'

const FILMS: Record<LiveFilmSlug, ComponentType> = {
  'ai-appointment-setter': AppointmentSetterFilm,
  'ai-invoice-processing-approval': InvoiceApprovalFilm,
  'ai-unpaid-invoice-reminders': UnpaidRemindersFilm,
  'order-stock-check': OrderStockFilm,
  'solar-lead-scoring-follow-up': LeadScoringFilm,
  'ai-prospecting-apollo': ProspectingFilm
}

/**
 * A case study's live film. Shown only once Satoshi has loaded, since the
 * kit's Roll, Badge and Chip measure their words once.
 */
export function LiveFilm({ slug }: { slug: LiveFilmSlug }) {
  const [fontsReady, setFontsReady] = useState(false)

  useEffect(() => {
    let live = true

    document.fonts.ready.then(() => {
      if (live) setFontsReady(true)
    })

    return () => {
      live = false
    }
  }, [])

  const Film = FILMS[slug]

  return fontsReady ? <Film /> : <div className='aspect-video w-full rounded-xl bg-[#f3f4f7]' />
}
