'use client'

import type { ComponentProps } from 'react'

import dynamic from 'next/dynamic'

import type { CaseStudyModal } from '@/components/landing/case-study-modal'

const load = () => import('@/components/landing/case-study-modal').then(m => m.CaseStudyModal)

const Modal = dynamic(load, { ssr: false })

/**
 * Starts fetching the dialog's code ahead of the first click. Called once the
 * work comes into view, so opening a project does not wait on the network.
 */
export const preloadCaseStudyModal = () => void load()

/**
 * The case-study dialog, kept out of the page's first download.
 *
 * It renders nothing until a project is chosen, so its code (the views, the
 * magnifier, the fullscreen viewer, the film player) need not arrive with the
 * page. It used to ship in the homepage's main bundle.
 */
export function LazyCaseStudyModal(props: ComponentProps<typeof CaseStudyModal>) {
  return props.study ? <Modal {...props} /> : null
}
