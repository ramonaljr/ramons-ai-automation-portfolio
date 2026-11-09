'use client'

import { SceneFrame } from '@/components/landing/scenes/scene-frame'
import { SERVICE_SCENES } from '@/components/landing/scenes/services-scenes'

/** A service's scene on its dotted ground, playing while `on`. */
export function ServiceScene({ slug, on }: { slug: string; on: boolean }) {
  const Scene = SERVICE_SCENES[slug]

  return (
    <div className='svc-fig' data-on={on || undefined}>
      <SceneFrame ratio={600 / 375} on={on}>
        {Scene && <Scene />}
      </SceneFrame>
    </div>
  )
}
