'use client'

import type { ComponentType } from 'react'

import { Audit } from '@/components/landing/scenes/s02-audit'
import { Build } from '@/components/landing/scenes/s04-build'
import { Design } from '@/components/landing/scenes/s03-design'
import { Discovery } from '@/components/landing/scenes/s01-discovery'
import { Live } from '@/components/landing/scenes/s06-live'
import { Testing } from '@/components/landing/scenes/s05-testing'
import type { SceneProps } from '@/components/landing/scenes/scene'
import { SceneFrame } from '@/components/landing/scenes/scene-frame'

/**
 * The scene beside each Process step. One invoice job runs through all six:
 * the discovery call, the audit of today's steps, the system map, connecting
 * the client's accounts, the test run and handover, and the live system
 * checking an invoice. The company, PO and amounts are illustration, and the
 * audit's times are labelled as estimates; none of it is a client record.
 */
const SCENES: ComponentType<SceneProps>[] = [Discovery, Audit, Design, Build, Testing, Live]

export function ProcessScene({ step, on = true }: { step: number; on?: boolean }) {
  const Scene = SCENES[step]

  return (
    <SceneFrame ratio={520 / 460} on={on}>
      {Scene && <Scene />}
    </SceneFrame>
  )
}
