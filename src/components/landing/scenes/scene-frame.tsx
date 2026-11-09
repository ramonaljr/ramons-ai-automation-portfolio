'use client'

import './look.css'
import './scenes.css'
import './services.css'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/**
 * Where a Stageshow scene sits on the page (see scene.tsx). It shows the
 * scene only once Satoshi has loaded (Roll, Badge and Chip measure their
 * words once) and only while it has a size: a layout that is display: none
 * unmounts it, so it is measured afresh, at its real size, when that layout
 * appears. `on` false unmounts it too, so a scene never loops unseen.
 *
 * It flows at full width by default, taking the scene's height. A host with
 * a fixed box pins it to the box's bottom centre instead (`.ps-frame` in its
 * own CSS), as large as the box allows at `ratio`, the scene's width over
 * its height, so a hero that runs off the bottom meets the box's own edge.
 */
export function SceneFrame({ ratio, on = true, children }: { ratio: number; on?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [fontsReady, setFontsReady] = useState(false)
  const [sized, setSized] = useState(false)

  useEffect(() => {
    let live = true

    document.fonts.ready.then(() => {
      if (live) setFontsReady(true)
    })

    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    const node = ref.current

    if (!node) return

    const observer = new ResizeObserver(([entry]) => {
      setSized((entry?.contentRect.width ?? 0) > 0)
    })

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className='ps ps-frame' data-ss-fill='' style={{ '--ratio': ratio } as CSSProperties}>
      {on && fontsReady && sized && children}
    </div>
  )
}
