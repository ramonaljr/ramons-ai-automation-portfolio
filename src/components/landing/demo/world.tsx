'use client'

import type { ComponentType } from 'react'

import { Code, Funnel, Hourglass, RotateCw, Shuffle, Sparkles, Split, TextQuote, Workflow } from 'lucide-react'

import { ToolMark } from '@/components/landing/tool-stack-section'
import type { DemoEdge, DemoLayout, DemoNode } from '@/lib/demos/types'

/** What a canvas needs from the run to draw itself; the run lives in n8n-demo.tsx. */
export type NodeState = 'idle' | 'running' | 'waiting' | 'success'

export type WorldProps = {
  layout: DemoLayout
  stateOf: (node: DemoNode) => NodeState
  edgeLit: (edge: DemoEdge, index: number) => boolean

  /** Items (Make: bundles) a node put out, once it has run. */
  countOf: (node: DemoNode) => number
  onOpen: (name: string) => void
}

type Visual = {
  color: string
  slug?: string
  Icon?: ComponentType<{ size?: number; strokeWidth?: number; color?: string }>
}

/** Make's apps by module prefix, in the colours Make paints its circles. */
const MAKE: Record<string, Visual> = {
  'google-sheets': { color: '#0FA763', slug: 'googlesheets' },
  'google-email': { color: '#F14436', slug: 'gmail' },
  'google-drive': { color: '#FFC522', slug: 'googledrive' },
  slack: { color: '#4A154B', slug: 'slack' },
  'gemini-ai': { color: '#4E86F6', Icon: Sparkles },
  util: { color: '#A890EC', Icon: TextQuote },
  'builtin:BasicRouter': { color: '#6CC04A', Icon: Shuffle },
  'builtin:Break': { color: '#F7931E', Icon: RotateCw }
}

/** Zapier's apps by export id. Zapier's own tools share its orange. */
const ZAPIER: Record<string, Visual> = {
  AirtableCLIAPI: { color: '#18BFFF', slug: 'airtable' },
  GoogleMailV2CLIAPI: { color: '#EA4335', slug: 'gmail' },
  GoogleDriveCLIAPI: { color: '#4285F4', slug: 'googledrive' },
  FilterAPI: { color: '#FF4F00', Icon: Funnel },
  CodeCLIAPI: { color: '#FF4F00', Icon: Code },
  BranchingAPI: { color: '#FF4F00', Icon: Split },
  EngineAPI: { color: '#FF4F00', Icon: Split },
  DelayCLIAPI: { color: '#FF4F00', Icon: Hourglass },
  AICLIAPI: { color: '#FF4F00', Icon: Sparkles }
}

export function visualOf(platform: DemoLayout['platform'], type: string): Visual {
  if (platform === 'make') return MAKE[type] ?? MAKE[type.split(':')[0]] ?? { color: '#9a9a9a', Icon: Workflow }

  return ZAPIER[type] ?? { color: '#FF4F00', Icon: Workflow }
}

/** An app's mark: its logo where there is one, else a line icon. `tint` overrides the colour. */
export function AppMark({ visual, size, tint }: { visual: Visual; size: number; tint?: string }) {
  if (visual.slug) return <ToolMark tool={{ name: '', slug: visual.slug, color: tint ?? visual.color }} size={size} />

  const Icon = visual.Icon ?? Workflow

  return <Icon size={size} strokeWidth={1.8} color={tint ?? visual.color} />
}
